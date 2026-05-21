"use client";

import { Suspense, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ChevronLeft } from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import StoreCardGrid, {
    CEDIMAN_OFFICIAL_STORE,
    vendorToStoreListing,
    type StoreListing,
} from "@/app/components/home/StoreCardGrid";

type VendorSummary = {
    id: string;
    slug: string;
    businessName: string;
    description?: string;
    logoUrl?: string;
};

function StoresPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryFromUrl = searchParams.get("q") || "";
    const [q, setQ] = useState(queryFromUrl);
    const [vendors, setVendors] = useState<VendorSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setQ(queryFromUrl);
    }, [queryFromUrl]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const params = queryFromUrl.trim() ? `?q=${encodeURIComponent(queryFromUrl.trim())}` : "";
        fetch(`/api/vendors${params}`, { cache: "no-store" })
            .then((res) => res.json())
            .then((data) => {
                if (cancelled) return;
                if (data.success) setVendors(data.vendors || []);
                else setVendors([]);
            })
            .catch(() => {
                if (!cancelled) setVendors([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [queryFromUrl]);

    const stores: StoreListing[] = useMemo(() => {
        const marketplace = vendors.map(vendorToStoreListing);
        const term = queryFromUrl.trim().toLowerCase();
        const officialMatches =
            !term ||
            CEDIMAN_OFFICIAL_STORE.name.toLowerCase().includes(term) ||
            CEDIMAN_OFFICIAL_STORE.subtitle.toLowerCase().includes(term) ||
            "cediman".includes(term) ||
            "jersey".includes(term);

        return officialMatches ? [CEDIMAN_OFFICIAL_STORE, ...marketplace] : marketplace;
    }, [vendors, queryFromUrl]);

    function onSearch(e: FormEvent) {
        e.preventDefault();
        const trimmed = q.trim();
        if (trimmed) router.push(`/stores?q=${encodeURIComponent(trimmed)}`);
        else router.push("/stores");
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc]">
            <Header />
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-10">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-600 hover:text-emerald-700 mb-6"
                >
                    <ChevronLeft className="h-4 w-4" /> Back to home
                </Link>

                <h1 className="text-3xl md:text-4xl font-black text-zinc-900">All stores</h1>
                <p className="mt-2 text-zinc-600 font-medium">
                    {queryFromUrl
                        ? `Showing stores matching “${queryFromUrl}”`
                        : "Browse official Cediman and marketplace sellers"}
                </p>

                <form onSubmit={onSearch} className="mt-8 max-w-2xl">
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 h-5 w-5 text-zinc-400" />
                        <input
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search stores by name..."
                            className="w-full h-14 pl-12 pr-28 rounded-2xl border-2 border-zinc-100 bg-white text-base font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 h-10 px-6 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-emerald-600"
                        >
                            Search
                        </button>
                    </div>
                </form>

                <div className="mt-10">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-72 rounded-[2.5rem] bg-zinc-100 animate-pulse border border-zinc-100"
                                />
                            ))}
                        </div>
                    ) : (
                        <StoreCardGrid stores={stores} />
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default function StoresPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center text-zinc-500">
                    Loading stores…
                </div>
            }
        >
            <StoresPageContent />
        </Suspense>
    );
}
