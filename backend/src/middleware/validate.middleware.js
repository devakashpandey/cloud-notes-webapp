import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // Validated & trimmed sanitized data re-assign karein
        if (parsed.body) req.body = parsed.body; // 
        if (parsed.query) req.query = parsed.query;
        if (parsed.params) req.params = parsed.params;

        next();
    } catch (error) {
        const issues = error.errors || error.issues || [];
        const errorMessages = issues?.map((err) => ({
            field: err.path.slice(1).join("."),
            message: err.message,
        })) || [];

        return next(new ApiError(400, errorMessages[0]?.message || "Validation Error", errorMessages));
    }
};
