"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect, useMemo } from "react";
import {
    MapPin,
    ChevronRight,
    Search,
    Shirt,
    Store,
    Sparkles,
    Cpu,
    Dumbbell,
    LayoutGrid,
    Truck,
    Clock,
} from "lucide-react";
import StoreCardGrid, {
    CEDIMAN_OFFICIAL_STORE,
    vendorToStoreListing,
} from "@/app/components/home/StoreCardGrid";

const categoryChips: { label: string; href: string; icon: typeof Shirt }[] = [
    { label: "Jerseys", href: "/shop?category=jersey", icon: Shirt },
    { label: "Training", href: "/shop?category=trainers", icon: Dumbbell },
    { label: "Cosmetics", href: "/shop?category=cosmetics", icon: Sparkles },
    { label: "Gadgets", href: "/shop?category=gadgets", icon: Cpu },
    { label: "Other", href: "/shop?category=other", icon: LayoutGrid },
    { label: "All stores", href: "/stores", icon: Store },
];

type VendorSummary = {
    id: string;
    slug: string;
    businessName: string;
    description?: string;
    logoUrl?: string;
};

export default function MarketplaceHome() {
    const router = useRouter();
    const [q, setQ] = useState("");
    const [dynamicCategories, setDynamicCategories] = useState<
        { label?: string; name?: string; href?: string; icon?: typeof Shirt }[]
    >([]);
    const [vendors, setVendors] = useState<VendorSummary[]>([]);
    const [storesLoading, setStoresLoading] = useState(true);

    useEffect(() => {
        const handleScroll = () => {};
        window.addEventListener("scroll", handleScroll);

        fetch("/api/categories")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.categories) {
                    setDynamicCategories(data.categories);
                }
            })
            .catch(() => {});

        fetch("/api/vendors", { cache: "no-store" })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setVendors(data.vendors || []);
            })
            .catch(() => setVendors([]))
            .finally(() => setStoresLoading(false));

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const featuredStores = useMemo(() => {
        const marketplace = vendors.map(vendorToStoreListing);
        return [CEDIMAN_OFFICIAL_STORE, ...marketplace].slice(0, 6);
    }, [vendors]);

    const getIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes("jersey")) return Shirt;
        if (lower.includes("train")) return Dumbbell;
        if (lower.includes("cosmetic") || lower.includes("beauty")) return Sparkles;
        if (lower.includes("gadget") || lower.includes("tech")) return Cpu;
        return LayoutGrid;
    };

    function onSearch(e: FormEvent) {
        e.preventDefault();
        const trimmed = q.trim();
        if (trimmed) router.push(`/stores?q=${encodeURIComponent(trimmed)}`);
        else router.push("/stores");
    }

    return (
        <div className="bg-[#fcfcfc] pb-20">
            <div className="bg-emerald-50 py-2 border-b border-emerald-100">
                <div className="mx-auto max-w-7xl px-4 md:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Delivering to Accra, Ghana</span>
                        <ChevronRight className="h-3 w-3 opacity-50" />
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-[10px] uppercase tracking-wider text-emerald-600 font-bold">
                        <span className="flex items-center gap-1">
                            <Truck className="h-3 w-3" /> Same day dispatch
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> 24/7 Support
                        </span>
                    </div>
                </div>
            </div>

            <section className="relative pt-12 pb-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-50/50 to-transparent pointer-events-none" />
                <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-900 leading-[1.1]">
                            Everything you love, <br />
                            <span className="text-emerald-600">delivered.</span>
                        </h1>
                        <p className="mt-4 text-lg text-zinc-600 font-medium">
                            The best stores in Ghana, all in one place.
                        </p>
                    </div>

                    <form onSubmit={onSearch} className="mt-10 max-w-2xl group">
                        <div className="relative flex items-center transition-all duration-300">
                            <div className="absolute left-5 text-zinc-400 group-focus-within:text-emerald-600 transition-colors">
                                <Search className="h-6 w-6" />
                            </div>
                            <input
                                type="search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search stores by name..."
                                className="w-full h-16 pl-14 pr-32 rounded-2xl bg-white border-2 border-zinc-100 shadow-xl shadow-zinc-200/50 text-lg font-medium placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 h-12 px-8 bg-zinc-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all active:scale-95"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <section className="mb-12">
                <div className="mx-auto max-w-7xl px-4 md:px-6">
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {(dynamicCategories.length > 0 ? dynamicCategories : categoryChips).map((cat) => {
                            const name = "name" in cat ? cat.name : undefined;
                            const Icon = cat.icon || getIcon(cat.label || name || "");
                            const label = cat.label || name || "";
                            const href = cat.href || `/shop?category=${(name || label).toLowerCase()}`;

                            return (
                                <Link
                                    key={label}
                                    href={href}
                                    className="flex flex-col items-center gap-3 shrink-0"
                                >
                                    <div className="w-20 h-20 rounded-3xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center group hover:border-emerald-200 hover:shadow-md transition-all active:scale-95">
                                        <Icon className="h-8 w-8 text-zinc-700 group-hover:text-emerald-600 transition-colors" />
                                    </div>
                                    <span className="text-xs font-bold text-zinc-600">{label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="mb-16">
                <div className="mx-auto max-w-7xl px-4 md:px-6">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900">Featured Stores</h2>
                            <p className="text-zinc-500 font-medium">
                                Official Cediman plus active marketplace sellers
                            </p>
                        </div>
                        <Link
                            href="/stores"
                            className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:underline"
                        >
                            See all stores <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {storesLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-72 rounded-[2.5rem] bg-zinc-100 animate-pulse border border-zinc-100"
                                />
                            ))}
                        </div>
                    ) : (
                        <StoreCardGrid stores={featuredStores} />
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 md:px-6">
                <div className="relative rounded-[3rem] bg-zinc-900 p-8 md:p-16 overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/20 to-transparent pointer-events-none" />
                    <div className="relative z-10 max-w-xl">
                        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                            Ready to grow your <br />
                            <span className="text-emerald-400">business?</span>
                        </h2>
                        <p className="mt-4 text-zinc-400 text-lg">
                            Join Ghana&apos;s fastest growing marketplace and start selling to thousands of customers
                            today.
                        </p>
                        <Link
                            href="/signup?role=vendor"
                            className="mt-8 inline-flex items-center gap-3 bg-white text-zinc-900 px-8 py-4 rounded-2xl font-black hover:bg-emerald-400 transition-colors"
                        >
                            Become a Seller
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
