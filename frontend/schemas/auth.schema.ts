// frontend/schemas/auth.schema.ts
import { z } from 'zod';

// 1. Login Validation Schema
export const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// 2. Register Validation Schema
export const registerSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username cannot exceed 30 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// 3. Change Password Validation Schema
export const changePasswordSchema = z
    .object({
        oldPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "New password and Confirm password do not match",
        path: ["confirmPassword"],
    });


// 4. Forgot Password Schema
export const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid registered email address"),
});

// 5. Reset Password Schema
export const resetPasswordSchema = z
    .object({
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "New password and Confirm password do not match",
        path: ["confirmPassword"], // Confirm password input ke niche error dikhayega
    });



// 6. Update Profile Schema
export const updateProfileSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username cannot exceed 30 characters"),
    email: z.string().email("Please enter a valid email address"),
});

// Auto-generated TypeScript Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

