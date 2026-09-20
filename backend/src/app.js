// this file create server
import express from "express";
import mainRouter from "./routes/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { errorHandler } from "./middleware/error.middleware.js";
import { globalLimiter } from "./middleware/rateLimiter.middleware.js";



export const app = express();

// 1. Helmet security always on top
app.use(helmet())

// 2. CORS always on top after helmet 
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true // Cookies allow karne ke liye
}));

// 3. Body & Cookie Parser
// body-parser middleware express does not parse incomming JSON payload automatically 
// ye middleware client se aa rhi request ko parse karta hai
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser()); // cookies ko handle karne ke liye


// 4. Global API Rate Limiter (Routes se theek pehle)
app.use("/api/v1", globalLimiter);

// 5. routes declaration
app.use("/api/v1", mainRouter);

// 6. Global error handler middleware - always at last
app.use(errorHandler)


