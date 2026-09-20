import { ChangePasswordData, ForgotPasswordData, LoginData, RegisterData, ResetPasswordData } from '@/types/auth';
import { apiClient } from '../lib/axios';


export const registerUserApi = async (data: RegisterData | FormData) => {
    try {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    } catch (error: any) {
        console.error("Register API error:", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Registration failed. Please try again."
        };
    }
};

export const loginUserApi = async (data: LoginData) => {
    try {
        const response = await apiClient.post('/auth/login', data, { _skipAuthRefresh: true });
        return response.data;
    } catch (error: any) {
        console.error("Login API error:", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Invalid username or password"
        };
    }
};

export const logoutUserApi = async () => {
    try {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    } catch (error: any) {
        console.error("Logout API error:", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Logout failed"
        };
    }
};


export const changePasswordApi = async (data: ChangePasswordData) => {
    try {
        const response = await apiClient.post('/auth/change-password', data);
        return response.data;
    } catch (error: any) {
        console.error("Change Password API error:", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to change password"
        };
    }
};

export const verifyEmailApi = async (token: string) => {
    try {
        const response = await apiClient.get(`/auth/verify-email/${token}`);
        return response.data;
    } catch (error: any) {
        console.error("Verify Email API error:", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Invalid or expired verification link."
        };
    }
};

export const forgotPasswordApi = async (data: ForgotPasswordData) => {
    try {
        const response = await apiClient.post('/auth/forgot-password', data);
        return response.data;
    } catch (error: any) {
        console.error("Forgot Password API error:", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to send reset link."
        };
    }
};

export const resetPasswordApi = async (token: string, data: ResetPasswordData) => {
    try {
        const response = await apiClient.post(`/auth/reset-password/${token}`, data);
        return response.data;
    } catch (error: any) {
        console.error("Reset Password API error:", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to reset password."
        };
    }
};

// export const resendVerificationApi = async (data: { email: string }) => {
//     try {
//         const response = await apiClient.post('/auth/resend-verification', data);
//         return response.data;
//     } catch (error: any) {
//         console.error("Resend Verification API error:", error);
//         return {
//             success: false,
//             message: error?.response?.data?.message || "Failed to resend verification email."
//         };
//     }
// };