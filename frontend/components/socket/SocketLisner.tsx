'use client';

import { useSocketEvents } from '@/hooks/useSocketEvents';

export const SocketListener = () => {
    useSocketEvents();
    return null; // Yeh UI me kuch render nahi karega, sirf socket listen karega
};
