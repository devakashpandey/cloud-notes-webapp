import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const VerifyJWT = async (req, res, next) => {
    try {

        // 1. Cookie ya Authorization header se token nikalo
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json(
                {
                    sucess: false,
                    message: "Token expired, Unauthorized access",
                })
        }

        // 2. Token ko verify karo secret key se
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // 3. User ko DB me dhundho (password ko exclude karke)
        const user = await User.findById(decodedToken._id).select("-password");

        // 4.Agar user nahi mila toh error
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid access token - User not found"
            });
        }

        // 5. User ko request object me attach karo
        req.user = user;
        next(); // next middleware ko call karo

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error?.message || "Invalid Access Token",
        });
    }
}