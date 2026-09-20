"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading, isInitialized } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (isInitialized && !loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, loading, isInitialized, router]);

    if (!isInitialized || loading) {
        return <LoadingSpinner text="Loading user profile..." className="min-h-screen" />;
    }

    return isAuthenticated ? <>{children}</> : null;
}