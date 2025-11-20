"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push("/login?redirect=/admin");
        }
    }, [loading, isAdmin, router]);

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

    if (!isAdmin) {
        return null;
    }

    return <>{children}</>;
}
