"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import VendorApplicationStatusView, {
    type VendorApplicationStatusPayload,
} from "@/app/components/vendor/VendorApplicationStatusView";
import { RefreshCw } from "lucide-react";

type SellerAccess = "unknown" | "allowed" | "denied";

export default function VendorProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isVendor, loading, refreshUser, syncUser } = useAuth();
    const router = useRouter();
    const hasRedirected = useRef(false);
    const sellerCheckKey = useRef<string | null>(null);
    const sellerCheckInFlight = useRef(false);
    const [appLoading, setAppLoading] = useState(false);
    const [application, setApplication] = useState<VendorApplicationStatusPayload | null | undefined>(
        undefined
    );
    const [refreshing, setRefreshing] = useState(false);
    const [sellerAccess, setSellerAccess] = useState<SellerAccess>("unknown");
    const [accessError, setAccessError] = useState<string | null>(null);
    const sellerAccessRef = useRef<SellerAccess>(sellerAccess);
    sellerAccessRef.current = sellerAccess;

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

    const verifySellerAccess = useCallback(
        async (force = false) => {
            const firebaseUser = auth.currentUser;
            if (!firebaseUser) {
                setSellerAccess("denied");
                setAccessError("Sign in required.");
                sellerCheckKey.current = null;
                return;
            }

            const checkKey = firebaseUser.uid;
            if (!force && sellerCheckKey.current === checkKey && sellerAccessRef.current === "allowed") {
                return;
            }
            if (sellerCheckInFlight.current) return;

            sellerCheckInFlight.current = true;
            if (!force && sellerAccessRef.current !== "allowed") {
                setSellerAccess("unknown");
            }

            try {
                const token = await firebaseUser.getIdToken();
                const res = await fetch("/api/vendor/session", {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });
                const data = await res.json();
                if (data.canSell) {
                    sellerCheckKey.current = checkKey;
                    setSellerAccess("allowed");
                    setAccessError(null);
                    if (data.user) {
                        syncUser(data.user);
                    } else {
                        await refreshUser();
                    }
                } else {
                    sellerCheckKey.current = checkKey;
                    setSellerAccess("denied");
                    setAccessError(data.error || "Seller access is not available for this account.");
                }
            } catch {
                setSellerAccess("denied");
                setAccessError("Could not verify seller access. Try again.");
            } finally {
                sellerCheckInFlight.current = false;
            }
        },
        [refreshUser, syncUser]
    );

    useEffect(() => {
        if (!loading && !user && !hasRedirected.current) {
            hasRedirected.current = true;
            router.push("/login?redirect=/vendor");
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (loading) return;

        if (!isVendor) {
            sellerCheckKey.current = null;
            setSellerAccess("unknown");
            setAccessError(null);
            if (user) {
                loadApplicationStatus();
            }
            return;
        }

        setApplication(undefined);
        verifySellerAccess(false);
    }, [loading, isVendor, user?.id, loadApplicationStatus, verifySellerAccess]);

    const handleRefreshAccess = async () => {
        setRefreshing(true);
        sellerCheckKey.current = null;
        try {
            const firebaseUser = auth.currentUser;
            if (firebaseUser) {
                await firebaseUser.getIdToken(true);
            }
        } catch {
            /* ignore */
        }
        await refreshUser();
        await verifySellerAccess(true);
        if (!isVendor) {
            await loadApplicationStatus();
        }
        setRefreshing(false);
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

    if (sellerAccess === "unknown") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent mx-auto"></div>
                    <p className="text-zinc-600">Verifying seller access…</p>
                </div>
            </div>
        );
    }

    if (sellerAccess === "denied") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
                <div className="max-w-lg rounded-2xl border border-amber-100 bg-white p-8 shadow-sm text-center">
                    <h1 className="text-xl font-bold text-zinc-900">Seller access not ready</h1>
                    <p className="mt-3 text-sm text-zinc-600">{accessError}</p>
                    <button
                        type="button"
                        onClick={handleRefreshAccess}
                        disabled={refreshing}
                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        {refreshing ? "Refreshing…" : "Retry access"}
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
