import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";

// socket instance create krne ke liye (tabhi create hoga jab first time call hoga)
export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            withCredentials: true,
            autoConnect: false, // har page load pe automatically connect ni hoga - explicitly connect karenge
            transports: ["websocket", "polling"],
        });
    }
    return socket;
};

// socket connect krne ke liye
export const connectSocket = () => {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
    }
    return s;
};

// socket disconnect krne ke liye - logout ya tab close krte samay
export const disconnectSocket = () => {
    if (socket?.connected) {
        socket.disconnect();
    }
};
