import { create } from "zustand";
import { User } from "@/types/user";
import { LoginData } from "@/types/auth";
import { loginUserApi, logoutUserApi } from "@/services/auth.api";
import { getCurrentUser, updateUserDetailsApi, updateUserAvatarApi } from "@/services/user.api";
import { disconnectSocket } from "@/services/socket.service";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    isInitialized: boolean;

    // Session Management
    fetchProfile: () => Promise<void>;

    // Authentication Actions
    login: (credentials: LoginData) => Promise<boolean>;
    logout: () => Promise<void>;

    // User Profile Actions
    updateUserDetails: (updates: { username: string; email: string }) => Promise<{ success: boolean; message?: string }>;
    updateUserAvatar: (avatar: File) => Promise<{ success: boolean; message?: string }>;

    clearError: () => void;
}

let isFetchingProfile = false;

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    isInitialized: false,

    // 1. App load / Refresh par session restore karna
    fetchProfile: async () => {
        // Agar pehle se login flag nahi hai, toh faltu network call mat bhejo
        if (typeof window !== "undefined" && !localStorage.getItem("is_logged_in")) {
            return set({ user: null, isAuthenticated: false, loading: false, error: null, isInitialized: true });
        }

        if (isFetchingProfile) return;
        isFetchingProfile = true;

        set({ loading: true, error: null });

        try {
            const data = await getCurrentUser();

            const user = data.data || data.user;
            if (data.success && user) {
                set({ user: user, isAuthenticated: true, loading: false, error: null, isInitialized: true });
            } else {
                if (typeof window !== "undefined") localStorage.removeItem("is_logged_in");
                set({ user: null, isAuthenticated: false, loading: false, error: null, isInitialized: true });
            }
        } catch (error: any) {
            if (typeof window !== "undefined") localStorage.removeItem("is_logged_in");
            set({
                user: null,
                isAuthenticated: false,
                loading: false,
                error: error?.message || "Failed to fetch profile",
                isInitialized: true

            });
        } finally {
            isFetchingProfile = false;
        }
    },

    // 2. Login User
    login: async (credentials) => {
        set({ loading: true, error: null });

        try {
            const response = await loginUserApi(credentials);

            const user = response.data || response.user;
            if (response.success && user) {
                if (typeof window !== "undefined") localStorage.setItem("is_logged_in", "true");
                set({
                    user: user,
                    isAuthenticated: true,
                    loading: false,
                    error: null,
                    isInitialized: true
                });
                return true;
            }

            set({
                error: response.message || "Invalid credentials",
                loading: false,
            });
            return false;
        } catch (error: any) {
            set({
                error: error?.message || "Login failed",
                loading: false,
            });
            return false;
        }
    },

    // 3. Logout User
    logout: async () => {
        set({ loading: true });
        try {

            await logoutUserApi();
        } finally {
            // disconnect cleanly socket on logout
            disconnectSocket();
            if (typeof window !== "undefined") localStorage.removeItem("is_logged_in");
            set({
                user: null,
                isAuthenticated: false,
                loading: false,
                error: null,
                isInitialized: true
            });
        }
    },

    // 4. Update User Details (Username / Email)
    updateUserDetails: async (updates) => {
        try {
            const data = await updateUserDetailsApi(updates);
            const updatedUser = data?.data || data?.user;

            if (data?.success && updatedUser) {
                set((state) => ({
                    user: state.user ? { ...state.user, ...updatedUser } : updatedUser,
                    error: null,
                }));
                return { success: true, message: data.message || "Details updated successfully" };
            } else {
                return { success: false, message: data?.message || "Failed to update details" };
            }
        } catch (error: any) {
            return { success: false, message: error?.message || "Failed to update details" };
        }
    },

    // 5. Update User Avatar
    updateUserAvatar: async (avatar) => {
        try {
            const data = await updateUserAvatarApi(avatar);
            const updatedUser = data?.data || data?.user;

            if (data?.success && updatedUser) {
                set((state) => ({
                    user: state.user ? { ...state.user, ...updatedUser } : updatedUser,
                    error: null,
                }));
                return { success: true, message: data.message || "Avatar updated successfully" };
            } else {
                return { success: false, message: data?.message || "Failed to update avatar" };
            }
        } catch (error: any) {
            return { success: false, message: error?.message || "Failed to update avatar" };
        }
    },

    clearError: () => set({ error: null }),
}));