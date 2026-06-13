"use client";

import Link from "next/link";
import { MapPin, Star, ArrowRight } from "lucide-react";

export type StoreListing = {
    id: string;
    name: string;
    subtitle: string;
    href: string;
    badge?: string;
    rating?: number;
    deliveryTime?: string;
    image?: string;
    gradient: string;
};

const GRADIENTS = [
    "from-emerald-900 via-teal-800 to-cyan-700",
    "from-fuchsia-900 via-purple-800 to-violet-700",
    "from-slate-900 via-blue-950 to-indigo-900",
    "from-amber-900 via-orange-800 to-rose-700",
    "from-zinc-800 via-zinc-700 to-zinc-600",
];

export function gradientForStore(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % GRADIENTS.length;
    return GRADIENTS[hash];
}

export const CEDIMAN_OFFICIAL_STORE: StoreListing = {
    id: "cediman-official",
    name: "Cediman Jersey Store",
    subtitle: "Authentic kits & fan gear",
    href: "/teams",
    badge: "Official Store",
    rating: 4.9,
    deliveryTime: "24-48h",
    gradient: "from-[#7f1d1d] via-[var(--brand-red)] to-rose-600",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
};

export function vendorToStoreListing(v: {
    id: string;
    slug: string;
    businessName: string;
    description?: string;
    logoUrl?: string;
}): StoreListing {
    return {
        id: v.id,
        name: v.businessName,
        subtitle: v.description?.trim() || "Marketplace seller on Cediman",
        href: `/store/${v.slug}`,
        rating: 4.8,
        deliveryTime: "2-5 days",
        image: v.logoUrl,
        gradient: gradientForStore(v.id),
    };
}

export default function StoreCardGrid({ 
    stores, 
    className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
    enableSpecialLayout = false
}: { 
    stores: StoreListing[]; 
    className?: string;
    enableSpecialLayout?: boolean;
}) {
    if (stores.length === 0) {
        return (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-12 text-center">
                <p className="text-zinc-600 font-medium">No stores match your search.</p>
            </div>
        );
    }

    return (
        <div className={className}>
            {stores.map((store, index) => {
                const isFullWidth = enableSpecialLayout && (index === 6 || (index > 6 && (index - 6) % 13 === 0));
                return (
                    <Link
                        key={store.id}
                        href={store.href}
                        className={`group relative flex flex-col rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-white border border-zinc-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ${isFullWidth ? "col-span-2" : ""}`}
                    >
                        <div className={`relative overflow-hidden ${isFullWidth ? "aspect-[2/1] md:aspect-[2.5/1]" : "aspect-[4/3] md:aspect-[16/9]"}`}>
                            {store.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={store.image}
                                    alt={store.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div
                                    className={`w-full h-full bg-gradient-to-br ${store.gradient} flex items-center justify-center`}
                                >
                                    <span className="text-3xl md:text-5xl font-black text-white/90">
                                        {store.name.slice(0, 1).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                            {store.badge && (
                                <div className="absolute top-2.5 left-2.5 md:top-4 md:left-4 bg-white/95 backdrop-blur shadow-sm px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                    {store.badge}
                                </div>
                            )}

                            <div className="absolute bottom-2.5 left-3 right-3 md:bottom-4 md:left-6 md:right-6">
                                <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                                    {store.rating != null && (
                                        <div className="flex items-center gap-0.5 bg-emerald-500 text-white px-1 py-0.5 md:px-1.5 md:py-0.5 rounded text-[9px] md:text-[10px] font-bold">
                                            <Star className="h-2 w-2 md:h-2.5 md:w-2.5 fill-current" /> {store.rating}
                                        </div>
                                    )}
                                    {store.deliveryTime && (
                                        <span className="text-[9px] md:text-[10px] font-bold text-white uppercase tracking-wider bg-black/30 backdrop-blur-md px-1.5 py-0.5 rounded">
                                            {store.deliveryTime}
                                        </span>
                                    )}
                                </div>
                                <h3 className={`font-black text-white drop-shadow-md ${isFullWidth ? "text-lg md:text-3xl" : "text-sm md:text-2xl"}`}>{store.name}</h3>
                            </div>
                        </div>
                        <div className="p-3 md:p-6 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-xs md:text-sm font-bold text-zinc-800 line-clamp-1 md:line-clamp-2">{store.subtitle}</p>
                                <p className="text-[10px] md:text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                                    <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3" /> Ghana delivery
                                </p>
                            </div>
                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                                <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
