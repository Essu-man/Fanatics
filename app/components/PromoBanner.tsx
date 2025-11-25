"use client";

import Button from "./ui/button";
import Link from "next/link";

export default function PromoBanner() {
    return (
        <section className="relative w-full overflow-hidden">
            <div className="relative h-[500px] w-full md:h-[600px]">
                {/* Background Image with better overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-purple-900/90 to-red-900/95">
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-25"
                        style={{
                            backgroundImage: "url('https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920&h=1080&fit=crop')"
                        }}
                    ></div>
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-transparent animate-pulse"></div>
                </div>
                
                {/* Content Overlay */}
                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6">
                    <div className="max-w-2xl space-y-6">
                        <div className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                            Limited Time Offer
                        </div>
                        <h1 className="text-4xl font-black leading-tight text-white drop-shadow-2xl md:text-6xl lg:text-7xl">
                            25% Off All<br />
                            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                                NBA & NFL Jerseys
                            </span>
                        </h1>
                        <p className="text-lg text-white/95 md:text-xl max-w-xl">
                            Shop the latest styles and support your favorite team with our exclusive collection. Authentic gear for true fans.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button 
                                as={Link}
                                href="/search?category=jerseys"
                                className="bg-[var(--brand-red)] px-8 py-3.5 text-base font-bold text-white shadow-xl hover:bg-[var(--brand-red-dark)] hover:scale-105 transition-transform"
                            >
                                Shop Now
                            </Button>
                            <Button 
                                as={Link}
                                href="/teams"
                                className="border-2 border-white/80 bg-white/10 px-8 py-3.5 text-base font-bold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
                            >
                                Browse Teams
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

