"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Only redirect if:
        // 1. Not currently loading
        // 2. User is explicitly null (not just undefined during initial load)
        // 3. Not an admin
        // 4. Haven't already redirected (prevent multiple redirects)
        if (!loading && user === null && !isAdmin && !hasRedirected.current) {
            hasRedirected.current = true;
            router.push("/login?redirect=/admin");
        }
    }, [loading, user, isAdmin, router]);

    // Reset redirect flag if user becomes admin
    useEffect(() => {
        if (isAdmin) {
            hasRedirected.current = false;
        }
    }, [isAdmin]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent mx-auto"></div>
                    <p className="text-zinc-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render anything if we're redirecting or user is not admin
    if (!isAdmin || user === null) {
        return null;
    }

    return <>{children}</>;
}
