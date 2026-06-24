"use client";

import { useState } from "react";
import type { Vendor } from "@/lib/firestore";
import {
    Instagram,
    Facebook,
    Youtube,
    Linkedin,
    MessageCircle,
    Ghost,
    Link,
} from "lucide-react";

type VendorStorefrontBannerProps = {
    vendor: Pick<Vendor, "businessName" | "description" | "logoUrl" | "bannerUrl" | "socialHandles">;
    /** Compact preview for settings page */
    preview?: boolean;
};

function getSocialIcon(platform: string) {
    const size = "h-3.5 w-3.5";
    switch (platform.toLowerCase()) {
        case "instagram":
            return <Instagram className={size} />;
        case "facebook":
            return <Facebook className={size} />;
        case "youtube":
            return <Youtube className={size} />;
        case "linkedin":
            return <Linkedin className={size} />;
        case "x (twitter)":
        case "twitter":
        case "x":
            return (
                <svg className={size} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            );
        case "tiktok":
            return (
                <svg className={size} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.86.82 2 1.37 3.2 1.48V9.6c-1.3-.06-2.58-.57-3.6-1.37a8.775 8.775 0 0 1-1.1-1.02v8.13c-.02 4.13-2.9 7.82-7.01 8.27a8.212 8.212 0 0 1-8.5-5.91 8.163 8.163 0 0 1 5.3-9.98c.7-.22 1.43-.27 2.16-.27v4.13c-1.68.18-3.03 1.55-3.03 3.24 0 1.93 1.63 3.44 3.52 3.25 1.53-.15 2.66-1.52 2.66-3.05V0h.27z" />
                </svg>
            );
        case "snapchat":
            return <Ghost className={size} />;
        case "whatsapp business":
        case "whatsapp":
            return <MessageCircle className={size} />;
        case "threads":
            return (
                <svg className={size} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.56 12.35c-.07.03-.13.06-.2.08-.34.12-.7.21-1.07.26-.3.04-.6.06-.9.06-.82 0-1.52-.22-2.12-.66-.6-.44-.9-1.08-.9-1.92 0-.82.3-1.46.9-1.9.6-.44 1.3-.66 2.12-.66.62 0 1.18.12 1.67.36.49.24.84.58 1.05 1.02.21.44.31.95.31 1.52v.42c0 .65-.17 1.15-.51 1.5-.34.35-.8.52-1.38.52-.39 0-.7-.09-.94-.27-.24-.18-.36-.45-.36-.81 0-.05.01-.13.03-.24l.43-1.89c.04-.19.06-.34.06-.46 0-.3-.08-.54-.24-.72s-.41-.27-.75-.27c-.38 0-.71.14-.99.42-.28.28-.42.66-.42 1.14 0 .34.07.65.21.93s.34.49.6.63c.26.14.54.21.84.21.13 0 .28-.02.45-.06-.06.27-.09.5-.09.69 0 .47.11.84.33 1.11.22.27.53.4.93.4.78 0 1.4-.28 1.86-.84.46-.56.69-1.34.69-2.34v-.54c0-1.12-.25-2-.75-2.64s-1.27-.96-2.31-.96c-1.14 0-2.06.37-2.76 1.11-.7.74-1.05 1.76-1.05 3.06 0 1.25.34 2.24 1.02 2.97.68.73 1.56 1.1 2.64 1.1.84 0 1.57-.22 2.2-.66l.81 1.08c-.87.66-1.88.99-3.03.99-1.49 0-2.7-.49-3.63-1.47-.93-.98-1.4-2.34-1.4-4.08 0-1.78.49-3.18 1.47-4.2s2.28-1.53 3.9-1.53c1.46 0 2.6.43 3.42 1.29.82.86 1.23 2.06 1.23 3.6v.57c0 1.34-.34 2.38-1.02 3.12-.68.74-1.59 1.11-2.73 1.11-.81 0-1.47-.2-1.98-.6-.51-.4-.76-1.01-.76-1.83 0-.15.02-.33.06-.54l.43-1.89c.07-.31.1-.51.1-.6 0-.17-.04-.3-.12-.39s-.2-.14-.36-.14c-.16 0-.31.06-.45.18s-.24.29-.3.51l-.42 1.89c-.06.27-.09.5-.09.69 0 .47.11.84.33 1.11.22.27.53.4.93.4.78 0 1.4-.28 1.86-.84.46-.56.69-1.34.69-2.34v-.54c0-1.12-.25-2-.75-2.64s-1.27-.96-2.31-.96c-1.14 0-2.06.37-2.76 1.11-.7.74-1.05 1.76-1.05 3.06 0 1.25.34 2.24 1.02 2.97.68.73 1.56 1.1 2.64 1.1.84 0 1.57-.22 2.2-.66l.81 1.08c-.87.66-1.88.99-3.03.99-1.49 0-2.7-.49-3.63-1.47-.93-.98-1.4-2.34-1.4-4.08 0-1.78.49-3.18 1.47-4.2s2.28-1.53 3.9-1.53c1.46 0 2.6.43 3.42 1.29.82.86 1.23 2.06 1.23 3.6v.57c0 1.34-.34 2.38-1.02 3.12-.68.74-1.59 1.11-2.73 1.11-.81 0-1.47-.2-1.98-.6-.51-.4-.76-1.01-.76-1.83 0-.15.02-.33.06-.54z" />
                </svg>
            );
        case "pinterest":
            return (
                <svg className={size} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.289 2C6.617 2 2 6.617 2 12.289c0 4.348 2.7 8.062 6.55 9.58-.09-.808-.172-2.05.034-2.934.186-.8.1.186 1.206 1.206.8.034 1.636-.217 2.457-.3 3.013 0 5.46-2.6 5.46-5.787 0-4.9-3.518-8.31-8.536-8.31-5.8 0-9.21 4.348-9.21 8.847 0 1.756.677 3.639 1.522 4.66.166.2.19.378.14.58l-.582 2.382c-.084.347-.27.42-.622.254-2.302-1.07-3.743-4.43-3.743-7.11 0-5.788 4.21-11.102 12.135-11.102 6.37 0 11.32 4.541 11.32 10.606 0 6.329-3.99 11.424-9.53 11.424-1.86 0-3.606-.966-4.202-2.106l-1.144 4.364c-.415 1.59-1.537 3.585-2.29 4.816 1.58.488 3.255.753 4.992.753 5.672 0 10.289-4.617 10.289-10.289C22.578 6.617 17.96 2 12.289 2z" />
                </svg>
            );
        default:
            return <Link className={size} />;
    }
}

function getSocialUrl(platform: string, handle: string): string | null {
    if (!handle || !handle.trim()) return null;
    const cleanHandle = handle.trim();
    if (cleanHandle.startsWith("http://") || cleanHandle.startsWith("https://")) {
        return cleanHandle;
    }
    switch (platform.toLowerCase()) {
        case "instagram":
            return `https://instagram.com/${cleanHandle.replace("@", "")}`;
        case "tiktok":
            return `https://tiktok.com/@${cleanHandle.replace("@", "")}`;
        case "snapchat":
            return `https://snapchat.com/add/${cleanHandle}`;
        case "facebook":
            return `https://facebook.com/${cleanHandle}`;
        case "whatsapp business":
        case "whatsapp":
            return `https://wa.me/${cleanHandle.replace(/[^0-9]/g, "")}`;
        case "x (twitter)":
        case "twitter":
        case "x":
            return `https://x.com/${cleanHandle.replace("@", "")}`;
        case "youtube":
            return `https://youtube.com/${cleanHandle.startsWith("@") ? cleanHandle : "@" + cleanHandle}`;
        case "linkedin":
            return `https://linkedin.com/in/${cleanHandle}`;
        case "pinterest":
            return `https://pinterest.com/${cleanHandle}`;
        case "threads":
            return `https://threads.net/@${cleanHandle.replace("@", "")}`;
        default:
            return `https://${cleanHandle}`;
    }
}

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
                <div className="shrink-0 flex justify-center">
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

                {/* Social Handles on the right side */}
                {vendor.socialHandles && vendor.socialHandles.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-end sm:ml-auto shrink-0 sm:self-center">
                        {vendor.socialHandles.map((sh, idx) => {
                            const href = getSocialUrl(sh.platform, sh.handle);
                            if (!href) return null;
                            return (
                                <a
                                    key={idx}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-2 rounded-full transition-all border ${
                                        hasBanner
                                            ? "bg-black/40 hover:bg-black/60 border-white/20 text-white hover:scale-110"
                                            : "bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-600 hover:scale-110"
                                    }`}
                                    title={`${sh.platform}: ${sh.handle}`}
                                >
                                    {getSocialIcon(sh.platform)}
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
