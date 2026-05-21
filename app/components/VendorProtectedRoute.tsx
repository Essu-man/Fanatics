"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import VendorApplicationStatusView, {
    type VendorApplicationStatusPayload,
} from "@/app/components/vendor/VendorApplicationStatusView";

export default function VendorProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isVendor, loading, refreshUser } = useAuth();
    const router = useRouter();
    const hasRedirected = useRef(false);
    const [appLoading, setAppLoading] = useState(false);
    const [application, setApplication] = useState<VendorApplicationStatusPayload | null | undefined>(
        undefined
    );
    const [refreshing, setRefreshing] = useState(false);

    const loadApplicationStatus = useCallback(async () => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
            setApplication(null);
            return;
        }
        setAppLoading(true);
        try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch("/api/vendor/application-status", {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });
            const data = await res.json();
            if (data.success) {
                setApplication(data.application ?? null);
            } else {
                setApplication(null);
            }
        } catch {
            setApplication(null);
        } finally {
            setAppLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!loading && !user && !hasRedirected.current) {
            hasRedirected.current = true;
            router.push("/login?redirect=/vendor");
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (isVendor) {
            hasRedirected.current = false;
            setApplication(undefined);
            return;
        }
        if (!loading && user && !isVendor) {
            loadApplicationStatus();
        }
    }, [loading, user, isVendor, loadApplicationStatus]);

    const handleRefreshAccess = async () => {
        setRefreshing(true);
        await refreshUser();
        setRefreshing(false);
        await loadApplicationStatus();
    };

    if (loading || (user && !isVendor && (appLoading || application === undefined))) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent mx-auto"></div>
                    <p className="text-zinc-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (!isVendor) {
        return (
            <VendorApplicationStatusView
                application={application ?? null}
                onRefreshAccess={handleRefreshAccess}
                refreshing={refreshing}
            />
        );
    }

    return <>{children}</>;
}
