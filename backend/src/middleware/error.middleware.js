import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
    let error = err;

    // Agar error custom ApiError nahi hai (e.g. Mongoose, JWT, Zod error), toh use convert karein
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message, error?.errors || []);
    }

    const response = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors,
    };

    return res.status(error.statusCode).json(response);
};
