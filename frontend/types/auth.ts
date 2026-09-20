export interface LoginData {
    email?: string;
    username?: string;
    password: string;
}

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    avatar?: File | null;
}

export interface ChangePasswordData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    newPassword: string;
    confirmPassword: string;
}
