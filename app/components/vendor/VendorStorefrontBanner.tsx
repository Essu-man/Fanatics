"use client";

import { useState } from "react";
import type { Vendor } from "@/lib/firestore";

type VendorStorefrontBannerProps = {
    vendor: Pick<Vendor, "businessName" | "description" | "logoUrl" | "bannerUrl">;
    /** Compact preview for settings page */
    preview?: boolean;
};

export default function VendorStorefrontBanner({ vendor, preview = false }: VendorStorefrontBannerProps) {
    const bannerSrc = vendor.bannerUrl?.trim() || "";
    const [bannerFailed, setBannerFailed] = useState(false);
    const hasBanner = Boolean(bannerSrc) && !bannerFailed;
    const heightClass = preview ? "min-h-[140px]" : "min-h-[200px] sm:min-h-[220px]";

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border border-zinc-200 shadow-sm ${heightClass} ${
                hasBanner ? "" : "bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100"
            }`}
        >
            {hasBanner && (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={bannerSrc}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={() => setBannerFailed(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
                </>
            )}

            <div
                className={`relative flex h-full flex-col gap-5 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8 ${
                    hasBanner ? "text-white" : "text-zinc-900"
                }`}
            >
                <div className="flex shrink-0 items-center justify-center sm:justify-start">
                    {vendor.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={vendor.logoUrl}
                            alt={`${vendor.businessName} logo`}
                            className="h-20 w-20 rounded-2xl border-2 border-white bg-white object-cover shadow-lg sm:h-24 sm:w-24"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white bg-white text-2xl font-bold text-zinc-600 shadow-lg sm:h-24 sm:w-24">
                            {vendor.businessName.slice(0, 1).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                    <p
                        className={`text-[10px] font-bold uppercase tracking-widest ${
                            hasBanner ? "text-white/80" : "text-zinc-400"
                        }`}
                    >
                        Official store
                    </p>
                    <h1 className="mt-1 text-xl font-bold sm:text-3xl">{vendor.businessName}</h1>
                    {vendor.description ? (
                        <p
                            className={`mt-2 max-w-2xl text-sm leading-relaxed ${
                                hasBanner ? "text-white/90" : "text-zinc-600"
                            }`}
                        >
                            {vendor.description}
                        </p>
                    ) : (
                        <p className={`mt-2 text-sm ${hasBanner ? "text-white/80" : "text-zinc-500"}`}>
                            Shop {vendor.businessName}&apos;s listings on Cediman
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
