import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { parseCookie } from "cookie";
import { User } from "../models/user.model.js";

let io;

//  existing HTTP server ke saath Socket.io server connect/initialize karna.
export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            credentials: true,
        },
    });

    // middleware for authentication and attach user object to socket
    io.use(async (socket, next) => {
        try {

            // read cookie
            const cookies = parseCookie(
                socket.handshake.headers?.cookie || ""
            );

            // get accesstoken from cookie or handshake auth
            const token =
                socket.handshake.auth?.token ||
                cookies.accessToken;

            if (!token) {
                return next(new Error("Authentication required"));
            }

            // verify token
            const decoded = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET
            );

            // find user
            const user = await User.findById(decoded._id)
                .select("-password");

            if (!user) {
                return next(new Error("User not found"));
            }

            // attach user to socket
            socket.user = user;
            next();
        } catch (error) {
            return next(new Error("Invalid or expired token"));
        }
    });


    // connection event
    io.on("connection", (socket) => {
        const userId = socket.user._id.toString();
        const userRoom = `user:${userId}`;

        socket.join(userRoom);

        console.log(
            `[Socket Connected] ${socket.user.email} joined ${userRoom}`
        );

        socket.on("disconnect", (reason) => {
            console.log(
                `[Socket Disconnected] ${socket.user.email} - ${reason}`
            );
        });
    });

    return io;
};


//  socket instance return karna 
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized");
    }

    return io;
};