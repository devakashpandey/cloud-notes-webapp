import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

// 1. General Limiter: Pure API ke liye (15 min me 200 requests per IP)
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new ApiError(429, "Too many requests from this IP, please try again after 15 minutes."));
    },
});

// 2. Strict Auth Limiter: Login / Register brute-force attacks rokne ke liye (15 min me 20 attempts)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new ApiError(429, "Too many authentication attempts. Please try again after 15 minutes."));
    },
});
