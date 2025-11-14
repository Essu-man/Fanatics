"use client";

import { useState, useRef, useEffect } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "../../lib/products";

// Football products
const footballProducts: Product[] = [
    {
        id: "man-utd-7",
        name: "Manchester United Kit",
        team: "Manchester United",
        price: 120.00,
        images: [
            "https://images.unsplash.com/photo-1637089760728-0707413a1a03?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "red", name: "Red", hex: "#DA020E" },
        ],
    },
    {
        id: "messi-10",
        name: "Lionel Messi Jersey",
        team: "Argentina",
        price: 195.00,
        images: [
            "https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "blue", name: "Dark Blue", hex: "#6CACE4" },
        ],
    },
    {
        id: "cowboys-93",
        name: "Dallas Cowboys Jersey",
        team: "Dallas Cowboys",
        price: 110.00,
        images: [
            "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "navy", name: "Navy Blue", hex: "#003594" },
        ],
    },
    {
        id: "mahomes-15",
        name: "Patrick Mahomes Jersey",
        team: "Kansas City Chiefs",
        price: 150.00,
        images: [
            "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "green", name: "Green", hex: "#E31837" },
        ],
    },
    {
        id: "brady-12",
        name: "Tom Brady Jersey",
        team: "Tampa Bay Buccaneers",
        price: 140.00,
        images: [
            "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "red", name: "Red", hex: "#D50A0A" },
        ],
    },
    {
        id: "ronaldo-7",
        name: "Cristiano Ronaldo Jersey",
        team: "Portugal",
        price: 200.00,
        images: [
            "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "red", name: "Red", hex: "#DA020E" },
        ],
    },
];

// Basketball products
const basketballProducts: Product[] = [
    {
        id: "lebron-23",
        name: "LeBron James Jersey",
        team: "Los Angeles Lakers",
        price: 180.00,
        images: [
            "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "yellow", name: "Yellow", hex: "#FDB927" },
        ],
    },
    {
        id: "jordan-23",
        name: "Michael Jordan Jersey",
        team: "Chicago Bulls",
        price: 250.00,
        images: [
            "https://images.unsplash.com/photo-1565877302143-786477b33d82?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "red", name: "Red", hex: "#CE1141" },
        ],
    },
    {
        id: "curry-30",
        name: "Stephen Curry Jersey",
        team: "Golden State Warriors",
        price: 175.00,
        images: [
            "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "white", name: "White", hex: "#FFFFFF" },
        ],
    },
    {
        id: "celtics-green",
        name: "Boston Celtics Jersey",
        team: "Boston Celtics",
        price: 115.00,
        images: [
            "https://images.unsplash.com/photo-1434648957308-5e6a859697e8?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "green", name: "Green", hex: "#007A33" },
        ],
    },
    {
        id: "durant-7",
        name: "Kevin Durant Jersey",
        team: "Phoenix Suns",
        price: 165.00,
        images: [
            "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "orange", name: "Orange", hex: "#E56020" },
        ],
    },
    {
        id: "giannis-34",
        name: "Giannis Antetokounmpo Jersey",
        team: "Milwaukee Bucks",
        price: 170.00,
        images: [
            "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "green", name: "Green", hex: "#00471B" },
        ],
    },
];

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
                className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all duration-200 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 ${
                    !canScrollLeft ? "hidden" : ""
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
                className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all duration-200 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 ${
                    !canScrollRight ? "hidden" : ""
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
    return (
        <>
            {/* Football Section */}
            <section className="bg-white py-12">
                <div className="mx-auto max-w-7xl px-6">
                    <h2 className="mb-8 text-center text-3xl font-bold text-zinc-900 md:text-4xl">
                        Gear Up for Game Day: Shop Football
                    </h2>
                    <ProductCarousel products={footballProducts} />
                </div>
            </section>

            {/* Basketball Section */}
            <section className="bg-white py-12">
                <div className="mx-auto max-w-7xl px-6">
                    <h2 className="mb-8 text-center text-3xl font-bold text-zinc-900 md:text-4xl">
                        Rule the Court: Shop Basketball
                    </h2>
                    <ProductCarousel products={basketballProducts} />
                </div>
            </section>
        </>
    );
}

