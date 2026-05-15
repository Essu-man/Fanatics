"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect } from "react";
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
    Star,
    ArrowRight,
} from "lucide-react";
import { MARKETPLACE_CATEGORIES } from "@/lib/product-category";

const categoryChips: { label: string; href: string; icon: any }[] = [
    { label: "Jerseys", href: "/shop?category=jersey", icon: Shirt },
    { label: "Training", href: "/shop?category=trainers", icon: Dumbbell },
    { label: "Cosmetics", href: "/shop?category=cosmetics", icon: Sparkles },
    { label: "Gadgets", href: "/shop?category=gadgets", icon: Cpu },
    { label: "Other", href: "/shop?category=other", icon: LayoutGrid },
    { label: "All stores", href: "/shop", icon: Store },
];

type StoreCard = {
    id: string;
    name: string;
    subtitle: string;
    href: string;
    badge?: string;
    featured?: boolean;
    rating?: number;
    deliveryTime?: string;
    gradient: string;
    image?: string;
};

const stores: StoreCard[] = [
    {
        id: "cediman-jerseys",
        name: "Cediman Jersey Store",
        subtitle: "Authentic kits & fan gear",
        href: "/teams",
        badge: "Official Store",
        featured: true,
        rating: 4.9,
        deliveryTime: "24-48h",
        gradient: "from-[#7f1d1d] via-[var(--brand-red)] to-rose-600",
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    },
    {
        id: "trainers",
        name: "Pro Training Hub",
        subtitle: "Elite athletic apparel",
        href: "/shop?category=trainers",
        rating: 4.7,
        deliveryTime: "1-3 days",
        gradient: "from-emerald-900 via-teal-800 to-cyan-700",
        image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80",
    },
    {
        id: "beauty",
        name: "Radiance & Glow",
        subtitle: "Premium skincare & beauty",
        href: "/shop?category=cosmetics",
        badge: "New",
        rating: 4.8,
        deliveryTime: "2-4 days",
        gradient: "from-fuchsia-900 via-purple-800 to-violet-700",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
    },
    {
        id: "tech",
        name: "Digital Horizon",
        subtitle: "Next-gen tech gadgets",
        href: "/shop?category=gadgets",
        rating: 4.6,
        deliveryTime: "1-2 days",
        gradient: "from-slate-900 via-blue-950 to-indigo-900",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
    },
];

export default function MarketplaceHome() {
    const router = useRouter();
    const [q, setQ] = useState("");
    const [isScrolled, setIsScrolled] = useState(false);
    const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        // Fetch categories
        fetch("/api/categories")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.categories) {
                    setDynamicCategories(data.categories);
                }
            })
            .catch(() => {});

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
        if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        else router.push("/shop");
    }

    return (
        <div className="bg-[#fcfcfc] pb-20">
            {/* Delivery Status Bar */}
            <div className="bg-emerald-50 py-2 border-b border-emerald-100">
                <div className="mx-auto max-w-7xl px-4 md:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Delivering to Accra, Ghana</span>
                        <ChevronRight className="h-3 w-3 opacity-50" />
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-[10px] uppercase tracking-wider text-emerald-600 font-bold">
                        <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Same day dispatch</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 24/7 Support</span>
                    </div>
                </div>
            </div>

            {/* Hero Section with Search */}
            <section className="relative pt-12 pb-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-50/50 to-transparent pointer-events-none" />
                <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-900 leading-[1.1]">
                            Everything you love, <br/>
                            <span className="text-emerald-600">delivered.</span>
                        </h1>
                        <p className="mt-4 text-lg text-zinc-600 font-medium">
                            The best stores in Ghana, all in one place.
                        </p>
                    </div>

                    <form
                        onSubmit={onSearch}
                        className="mt-10 max-w-2xl group"
                    >
                        <div className="relative flex items-center transition-all duration-300">
                            <div className="absolute left-5 text-zinc-400 group-focus-within:text-emerald-600 transition-colors">
                                <Search className="h-6 w-6" />
                            </div>
                            <input
                                type="search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search for stores or items..."
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

            {/* Categories Rail */}
            <section className="mb-12">
                <div className="mx-auto max-w-7xl px-4 md:px-6">
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {(dynamicCategories.length > 0 ? dynamicCategories : categoryChips).map((cat: any) => {
                            const Icon = cat.icon || getIcon(cat.label || cat.name);
                            const label = cat.label || cat.name;
                            const href = cat.href || `/shop?category=${cat.name.toLowerCase()}`;
                            
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

            {/* Featured Stores */}
            <section className="mb-16">
                <div className="mx-auto max-w-7xl px-4 md:px-6">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900">Featured Stores</h2>
                            <p className="text-zinc-500 font-medium">Handpicked for quality and speed</p>
                        </div>
                        <Link href="/shop" className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:underline">
                            See all stores <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {stores.map((store) => (
                            <Link
                                key={store.id}
                                href={store.href}
                                className="group relative flex flex-col rounded-[2.5rem] overflow-hidden bg-white border border-zinc-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                            >
                                <div className="relative aspect-[16/9] overflow-hidden">
                                    <img
                                        src={store.image}
                                        alt={store.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                                    
                                    {store.badge && (
                                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur shadow-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                            {store.badge}
                                        </div>
                                    )}

                                    <div className="absolute bottom-4 left-6 right-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="flex items-center gap-0.5 bg-emerald-500 text-white px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                                                <Star className="h-2.5 w-2.5 fill-current" /> {store.rating}
                                            </div>
                                            <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-md">
                                                {store.deliveryTime}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-white drop-shadow-md">
                                            {store.name}
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-zinc-800">{store.subtitle}</p>
                                        <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> Standard Delivery
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vendor CTA */}
            <section className="mx-auto max-w-7xl px-4 md:px-6">
                <div className="relative rounded-[3rem] bg-zinc-900 p-8 md:p-16 overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/20 to-transparent pointer-events-none" />
                    <div className="relative z-10 max-w-xl">
                        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                            Ready to grow your <br/>
                            <span className="text-emerald-400">business?</span>
                        </h2>
                        <p className="mt-4 text-zinc-400 text-lg">
                            Join Ghana's fastest growing marketplace and start selling to thousands of customers today.
                        </p>
                        <Link
                            href="/vendor/apply"
                            className="mt-8 inline-flex items-center gap-3 bg-white text-zinc-900 px-8 py-4 rounded-2xl font-black hover:bg-emerald-400 transition-colors"
                        >
                            Become a Seller
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
