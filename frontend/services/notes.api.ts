import { GetNotesParams } from '@/types/note';
import { apiClient } from '../lib/axios';


export const getNotesApi = async (params?: GetNotesParams) => {
    try {
        const response = await apiClient.get('notes/get-notes', { params });
        return response.data;
    } catch (error) {
        console.error("Fetch error:", error);
        return { success: false, message: "Something went wrong" };
    }
};


export const createNoteApi = async (data: any) => {
    try {
        const response = await apiClient.post('notes/create-note', data);
        return response.data;
    } catch (error) {
        console.error("Fetch error:", error);
        return { success: false, message: "Something went wrong" };
    }
};


export const deleteNoteApi = async (noteId: string) => {
    try {
        const response = await apiClient.delete(`notes/${noteId}`);
        return response.data;
    } catch (error) {
        console.error("Delete error:", error);
        return { success: false, message: "Something went wrong" };
    }
};

export const updateNoteApi = async (noteId: string, data: any) => {
    try {
        const response = await apiClient.patch(`notes/${noteId}`, data);
        return response.data;
    } catch (error) {
        console.error("Update error:", error);
        return { success: false, message: "Something went wrong" };
    }
};

export const togglePinApi = async (noteId: string) => {
    try {
        const response = await apiClient.patch(`notes/${noteId}/pin`);
        return response.data;
    } catch (error) {
        console.error("Toggle pin error:", error);
        return { success: false, message: "Something went wrong" };
    }
};


