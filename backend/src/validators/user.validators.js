import { z } from "zod";

export const updateUserDetailsSchema = z.object({
    body: z.object({
        username: z.string().trim().min(3, "Username must be at least 3 characters").max(30).optional(),
        email: z.string().trim().email("Invalid email address").optional(),
    }).refine((data) => data.username || data.email, {
        message: "At least one field (username or email) is required to update",
    }),
});
