"use client";

import Button from "./ui/button";

export default function PromoBanner() {
    return (
        <section className="relative w-full overflow-hidden">
            <div className="relative h-[500px] w-full">
                {/* Background Image - Basketball player */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-purple-900/80 to-pink-900/90">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-30"></div>
                </div>
                
                {/* Content Overlay */}
                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6">
                    <div className="max-w-2xl">
                        <h1 className="mb-4 text-5xl font-black leading-tight text-white md:text-6xl">
                            25% Off All NBA Jerseys
                        </h1>
                        <p className="mb-8 text-lg text-white/90">
                            Shop the latest styles and support your favorite team with our exclusive collection.
                        </p>
                        <Button className="bg-[var(--brand-red)] px-8 py-3 text-base font-bold text-white hover:bg-[var(--brand-red-dark)]">
                            Shop Now
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

