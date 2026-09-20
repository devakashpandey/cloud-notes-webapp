import { useEffect } from "react";
import { connectSocket } from "@/services/socket.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotesStore } from "@/store/useNotesStore";
import { Note } from "@/types/note";
import toast from "react-hot-toast";

export const useSocketEvents = () => {
    const { isAuthenticated } = useAuthStore();
    const { handleRealtimeCreated, handleRealtimeDeleted } = useNotesStore();

    useEffect(() => {
        if (!isAuthenticated) return;

        // create socket instance
        const socket = connectSocket();

        // connect socket
        if (!socket.connected) { socket.connect(); }

        // note created event handler
        const onNoteCreated = (note: Note) => {
            handleRealtimeCreated(note);

        };

        // note deleted event handler
        const onNoteDeleted = ({ id }: { id: string }) => {
            handleRealtimeDeleted(id);

        };

        // attach event listeners
        socket.on("note:created", onNoteCreated);
        socket.on("note:deleted", onNoteDeleted);

        // cleanup on component unmount or before effect re-runs
        return () => {
            socket.off("note:created", onNoteCreated);
            socket.off("note:deleted", onNoteDeleted);
        };
    }, [isAuthenticated, handleRealtimeCreated, handleRealtimeDeleted]);
};