import { apiClient } from "@/lib/axios";

export const getCurrentUser = async () => {
    try {
        const response = await apiClient.get("/get-user-profile");
        return response.data;
    } catch (error) {
        return { success: false, message: "Something went wrong" };
    }
};


export const updateUserDetailsApi = async (updates: {
    username: string;
    email: string;
}) => {
    try {
        const response = await apiClient.patch(
            "/update-user-details",
            updates
        );
        return response.data;
    } catch (error) {
        return { success: false, message: "Failed to update profile" };
    }
};

export const updateUserAvatarApi = async (avatar: File) => {
    try {
        const formData = new FormData();
        formData.append("avatar", avatar);
        const response = await apiClient.patch("/update-user-avatar", formData);
        return response.data;
    } catch (error) {
        return { success: false, message: "Failed to update avatar" };
    }
};