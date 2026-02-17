"use client";

import { useState, useRef, useEffect } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "../../lib/products";
import { footballTeams, basketballTeams, internationalTeams } from "../../lib/teams";

// Helper function to determine if a league is football or basketball
const isFootballLeague = (league: string | undefined): boolean => {
    if (!league) return false;
    const footballLeagues = new Set(footballTeams.map(t => t.league));
    return footballLeagues.has(league);
};

const isBasketballLeague = (league: string | undefined): boolean => {
    if (!league) return false;
    const basketballLeagues = new Set(basketballTeams.map(t => t.league));
    return basketballLeagues.has(league);
};

function ProductCarousel({ products }: { products: Product[] }) {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const cardWidth = 296; // Card width (280px) + gap (24px)

    useEffect(() => {
        const updateScrollButtons = () => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                setScrollPosition(scrollLeft);
                setCanScrollLeft(scrollLeft > 10);
                setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
            }
        };

        updateScrollButtons();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener("scroll", updateScrollButtons);
            window.addEventListener("resize", updateScrollButtons);
            return () => {
                container.removeEventListener("scroll", updateScrollButtons);
                window.removeEventListener("resize", updateScrollButtons);
            };
        }
    }, []);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            const currentScroll = scrollContainerRef.current.scrollLeft;
            const newPosition = Math.max(0, currentScroll - cardWidth);
            scrollContainerRef.current.scrollTo({
                left: newPosition,
                behavior: "smooth",
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            const currentScroll = scrollContainerRef.current.scrollLeft;
            const maxScroll =
                scrollContainerRef.current.scrollWidth -
                scrollContainerRef.current.clientWidth;
            const newPosition = Math.min(maxScroll, currentScroll + cardWidth);
            scrollContainerRef.current.scrollTo({
                left: newPosition,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="relative">
            {/* Left Arrow */}
            <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all duration-200 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 ${!canScrollLeft ? "hidden" : ""
                    }`}
                aria-label="Scroll left"
            >
                <svg
                    className="h-6 w-6 text-zinc-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>

            {/* Scrollable Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                {products.map((product) => (
                    <div key={product.id} className="flex-shrink-0" style={{ width: "280px" }}>
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>

            {/* Right Arrow */}
            <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all duration-200 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 ${!canScrollRight ? "hidden" : ""
                    }`}
                aria-label="Scroll right"
            >
                <svg
                    className="h-6 w-6 text-zinc-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
        </div>
    );
}

export default function HomeProductSections() {
    const [footballProducts, setFootballProducts] = useState<Product[]>([]);
    const [basketballProducts, setBasketballProducts] = useState<Product[]>([]);
    const [trainersProducts, setTrainersProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("/api/admin/products");
                const data = await response.json();

                if (data.success && data.products) {
                    // Filter products with images
                    const availableProducts = data.products.filter(
                        (p: any) => p.images && p.images.length > 0
                    );

                    // Convert to Product type and filter by league
                    const allProducts: any[] = availableProducts.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        team: p.team,
                        teamId: p.teamId,
                        league: p.league,
                        price: p.price,
                        images: p.images || [],
                        colors: p.colors || [],
                        stock: p.stock,
                        available: p.available,
                    }));

                    // Separate football and basketball products using the league field
                    // Football includes both football clubs and international teams
                    const allFootballTeams = [...footballTeams, ...internationalTeams];
                    const football = allProducts.filter((p: any) => {
                        // First try: use league field directly
                        if (p.league) {
                            const isFootball = isFootballLeague(p.league);
                            if (isFootball) return true;
                        }

                        // Second try: find team by teamId
                        if (p.teamId) {
                            const team = allFootballTeams.find((t) => t.id === p.teamId);
                            if (team) return true;
                        }

                        // Third try: find team by team name
                        if (p.team) {
                            const team = allFootballTeams.find((t) => t.name === p.team);
                            if (team) return true;
                        }

                        return false;
                    });

                    const basketball = allProducts.filter((p: any) => {
                        // First try: use league field directly
                        if (p.league) {
                            const isBasketball = isBasketballLeague(p.league);
                            if (isBasketball) return true;
                        }

                        // Second try: find team by teamId
                        if (p.teamId) {
                            const team = basketballTeams.find((t) => t.id === p.teamId);
                            if (team) return true;
                        }

                        // Third try: find team by team name
                        if (p.team) {
                            const team = basketballTeams.find((t) => t.name === p.team);
                            if (team) return true;
                        }

                        return false;
                    });

                    // Filter trainers by category
                    const trainers = allProducts.filter((p: any) => {
                        return p.category && p.category.toLowerCase() === 'trainers';
                    });

                    setFootballProducts(football.slice(0, 8));
                    setBasketballProducts(basketball.slice(0, 8));
                    setTrainersProducts(trainers.slice(0, 8));
                } else {
                    setFootballProducts([]);
                    setBasketballProducts([]);
                    setTrainersProducts([]);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setFootballProducts([]);
                setBasketballProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <>
                <section className="bg-white py-12">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="mb-8 text-center text-3xl font-bold text-zinc-900 md:text-4xl">
                            Gear Up for Game Day: Shop Football
                        </h2>
                        <div className="flex items-center justify-center py-12">
                            <div className="text-zinc-500">Loading...</div>
                        </div>
                    </div>
                </section>
                <section className="bg-white py-12">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="mb-8 text-center text-3xl font-bold text-zinc-900 md:text-4xl">
                            Rule the Court: Shop Basketball
                        </h2>
                        <div className="flex items-center justify-center py-12">
                            <div className="text-zinc-500">Loading...</div>
                        </div>
                    </div>
                </section>
                <section className="bg-white py-12">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="mb-8 text-center text-3xl font-bold text-zinc-900 md:text-4xl">
                            Train Like a Pro: Shop Training Kits
                        </h2>
                        <div className="flex items-center justify-center py-12">
                            <div className="text-zinc-500">Loading...</div>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            {/* Football Section - Extended, Basketball section removed for now */}
            <section className="bg-white py-12">
                <div className="mx-auto max-w-7xl px-6">
                    <h2 className="mb-8 text-center text-3xl font-bold text-zinc-900 md:text-4xl">
                        Gear Up for Game Day: Shop Football
                    </h2>
                    {footballProducts.length > 0 ? (
                        <ProductCarousel products={footballProducts} />
                    ) : (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-zinc-500">No football products available</div>
                        </div>
                    )}
                </div>
            </section>

            {/* Trainers Section */}
            <section className="bg-zinc-50 py-12">
                <div className="mx-auto max-w-7xl px-6">
                    <h2 className="mb-8 text-center text-3xl font-bold text-zinc-900 md:text-4xl">
                        Train Like a Pro: Shop Training Kits
                    </h2>
                    {trainersProducts.length > 0 ? (
                        <ProductCarousel products={trainersProducts} />
                    ) : (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-zinc-500">No training kits available</div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
