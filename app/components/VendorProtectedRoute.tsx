"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function VendorProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isVendor, loading } = useAuth();
    const router = useRouter();
    const hasRedirected = useRef(false);

    useEffect(() => {
        if (!loading && (!user || !isVendor) && !hasRedirected.current) {
            hasRedirected.current = true;
            router.push("/login?redirect=/vendor");
        }
    }, [loading, user, isVendor, router]);

    useEffect(() => {
        if (isVendor) {
            hasRedirected.current = false;
        }
    }, [isVendor]);

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

    if (!isVendor || user === null) {
        return null;
    }

    return <>{children}</>;
}
