"use client";

import Link from "next/link";
import { useAuth } from "../providers/AuthProvider";
import { Package, PlusCircle } from "lucide-react";

export default function VendorHomePage() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Welcome{user?.firstName ? `, ${user.firstName}` : ""}</h1>
                <p className="mt-1 text-sm text-zinc-600">
                    Manage your listings and fulfill orders placed through Cediman checkout.
                </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-5 py-4 text-sm text-emerald-900">
                <strong>How it works:</strong> Add products here. New listings may need admin approval before they appear
                in the shop. Your public store is at{" "}
                <code className="rounded bg-white/80 px-1.5 py-0.5 text-xs">/store/your-slug</code> after onboarding.
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Link
                    href="/vendor/products"
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-[var(--brand-red)]/40"
                >
                    <Package className="h-10 w-10 text-[var(--brand-red)]" />
                    <div>
                        <p className="font-semibold text-zinc-900">My products</p>
                        <p className="text-sm text-zinc-500">View and edit what you sell</p>
                    </div>
                </Link>
                <Link
                    href="/vendor/products/new"
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-[var(--brand-red)]/40"
                >
                    <PlusCircle className="h-10 w-10 text-[var(--brand-red)]" />
                    <div>
                        <p className="font-semibold text-zinc-900">Add product</p>
                        <p className="text-sm text-zinc-500">Create a new listing</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
