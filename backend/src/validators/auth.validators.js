import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        username: z
            .string({ required_error: "Username is required" })
            .trim()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username cannot exceed 30 characters"),
        email: z
            .string({ required_error: "Email is required" })
            .trim()
            .email("Invalid email address"),
        password: z
            .string({ required_error: "Password is required" })
            .min(6, "Password must be at least 6 characters"),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        username: z
            .string({ required_error: "Username is required" })
            .trim()
            .min(1, "Username is required"),
        password: z
            .string({ required_error: "Password is required" })
            .min(1, "Password is required"),
        email: z
            .string()
            .trim()
            .email("Invalid email format")
            .optional()
            .or(z.literal("")),
    }),
});

export const changePasswordSchema = z.object({
    body: z
        .object({
            oldPassword: z.string().min(1, "Current password is required"),
            newPassword: z.string().min(6, "New password must be at least 6 characters"),
            confirmPassword: z.string().min(6, "Confirm password is required"),
        })
        // 1. Check: Naya password purane password jaisa same nahi hona chahiye
        .refine((data) => data.oldPassword !== data.newPassword, {
            message: "New password cannot be the same as old password",
            path: ["newPassword"],
        })
        // 2. Check: Naya password aur Confirm password match hone chahiye
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: "New password and Confirm password do not match",
            path: ["confirmPassword"],
        }),
});


export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z
            .string({ required_error: "Email is required" })
            .trim()
            .email("Please provide a valid email address"),
    }),
});

export const resetPasswordSchema = z.object({
    body: z
        .object({
            newPassword: z
                .string({ required_error: "New password is required" })
                .min(6, "Password must be at least 6 characters long"),
            confirmPassword: z
                .string({ required_error: "Confirm password is required" })
                .min(6, "Confirm password must be at least 6 characters long"),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: "New password and Confirm password do not match",
            path: ["confirmPassword"],
        }),
});
