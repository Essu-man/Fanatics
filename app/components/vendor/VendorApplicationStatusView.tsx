"use client";

import Link from "next/link";
import { Clock, CheckCircle2, XCircle, Store, RefreshCw } from "lucide-react";

export type VendorApplicationStatusPayload = {
    id: string;
    status: "pending" | "approved" | "rejected";
    businessName: string;
    appliedAt: string | null;
    reviewedAt?: string | null;
};

type Props = {
    application: VendorApplicationStatusPayload | null;
    onRefreshAccess?: () => void;
    refreshing?: boolean;
};

function formatDate(iso: string | null | undefined) {
    if (!iso) return null;
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return null;
    }
}

export default function VendorApplicationStatusView({
    application,
    onRefreshAccess,
    refreshing = false,
}: Props) {
    if (!application) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
                <div className="max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm text-center">
                    <Store className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-zinc-900">Become a Cediman seller</h1>
                    <p className="mt-3 text-sm text-zinc-600">
                        You don&apos;t have a seller application on this account yet. Submit one to start selling on
                        the marketplace.
                    </p>
                    <Link
                        href="/vendor/apply"
                        className="mt-6 inline-flex rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-600"
                    >
                        Apply to sell
                    </Link>
                </div>
            </div>
        );
    }

    if (application.status === "pending") {
        const submitted = formatDate(application.appliedAt);
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50/80 via-white to-zinc-50 p-6">
                <div className="max-w-lg w-full rounded-[2rem] border border-amber-100 bg-white p-8 md:p-10 shadow-lg">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-6">
                        <Clock className="h-8 w-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">
                        Seller application
                    </p>
                    <h1 className="text-2xl font-black text-zinc-900">Pending approval</h1>
                    <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
                        Thanks, <strong className="text-zinc-800">{application.businessName}</strong>. Our team is
                        reviewing your application. You&apos;ll get full access to upload products once you&apos;re
                        approved — usually within 2–3 business days.
                    </p>
                    {submitted && (
                        <p className="mt-4 text-xs font-medium text-zinc-500">Submitted on {submitted}</p>
                    )}
                    <div className="mt-8 rounded-2xl bg-zinc-50 border border-zinc-100 p-4 text-sm text-zinc-600">
                        <p className="font-semibold text-zinc-800 mb-1">What happens next?</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>We verify your business details and documents</li>
                            <li>After approval, sign in again and open your seller dashboard</li>
                            <li>Then add products from <strong>Add product</strong></li>
                        </ul>
                    </div>
                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/"
                            className="flex-1 text-center rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-50"
                        >
                            Back to shop
                        </Link>
                        <Link
                            href="/account"
                            className="flex-1 text-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600"
                        >
                            My account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (application.status === "rejected") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
                <div className="max-w-lg rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
                        <XCircle className="h-7 w-7" />
                    </div>
                    <h1 className="text-xl font-bold text-zinc-900">Application not approved</h1>
                    <p className="mt-3 text-sm text-zinc-600">
                        Your seller application for <strong>{application.businessName}</strong> was not approved at
                        this time. Contact support if you have questions, or submit a new application with updated
                        information.
                    </p>
                    <Link
                        href="/vendor/apply"
                        className="mt-6 inline-flex rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-600"
                    >
                        Apply again
                    </Link>
                </div>
            </div>
        );
    }

    // approved but session may not have vendor role yet
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
            <div className="max-w-lg rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mx-auto mb-4">
                    <CheckCircle2 className="h-7 w-7" />
                </div>
                <h1 className="text-xl font-bold text-zinc-900">You&apos;re approved!</h1>
                <p className="mt-3 text-sm text-zinc-600">
                    <strong>{application.businessName}</strong> is approved. Refresh your session to open the seller
                    dashboard and add products.
                </p>
                {onRefreshAccess && (
                    <button
                        type="button"
                        onClick={onRefreshAccess}
                        disabled={refreshing}
                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        {refreshing ? "Refreshing…" : "Open seller dashboard"}
                    </button>
                )}
            </div>
        </div>
    );
}
