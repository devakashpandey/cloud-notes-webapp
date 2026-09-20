"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

export default function AuthInitializer({
    children,
}: {
    children: React.ReactNode;
}) {
    const fetchProfile = useAuthStore((state) => state.fetchProfile);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return <>{children}</>;
}
