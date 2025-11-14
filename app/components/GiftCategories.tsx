"use client";

import { useState, useRef, useEffect } from "react";

const giftCategories = [
  {
    id: "jerseys",
    title: "#1 Gift Jerseys",
    description: "Give the gift every fan wants",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=600&fit=crop",
    href: "#",
  },
  {
    id: "him",
    title: "Gifts for Him",
    description: "For the guy who lives and breathes sports",
    image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500&h=600&fit=crop",
    href: "#",
  },
  {
    id: "her",
    title: "Gifts for Her",
    description: "Give her the gift of game-day glam",
    image: "https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=500&h=600&fit=crop",
    href: "#",
  },
  {
    id: "kids",
    title: "Gifts for Kids",
    description: "Big smiles for little fans",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&h=600&fit=crop",
    href: "#",
  },
  {
    id: "pets",
    title: "Gifts for Pets",
    description: "For furry friends",
    image: "https://images.unsplash.com/photo-1516138889897-3a135b1e0d40?w=500&h=600&fit=crop",
    href: "#",
  },
  {
    id: "accessories",
    title: "Accessories",
    description: "Complete your game-day look",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&h=600&fit=crop",
    href: "#",
  },
  {
    id: "collectibles",
    title: "Collectibles",
    description: "Rare finds for true fans",
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=500&h=600&fit=crop",
    href: "#",
  },
  {
    id: "home-decor",
    title: "Home & Decor",
    description: "Show your team spirit at home",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=600&fit=crop",
    href: "#",
  },
  {
    id: "tailgating",
    title: "Tailgating",
    description: "Gear up for game day",
    image: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=500&h=600&fit=crop",
    href: "#",
  },
  {
    id: "autographed",
    title: "Autographed Items",
    description: "Authentic signed memorabilia",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=600&fit=crop",
    href: "#",
  },
  {
    id: "vintage",
    title: "Vintage Gear",
    description: "Classic throwback styles",
    image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500&h=600&fit=crop",
    href: "#",
  },
  {
    id: "custom",
    title: "Custom Items",
    description: "Personalized for you",
    image: "https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=500&h=600&fit=crop",
    href: "#",
  },
];

export default function GiftCategories() {
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
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-8 text-center text-3xl font-bold text-zinc-900 md:text-4xl">
          Unwrap the Season&apos;s Top Gifts
        </h2>
        
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
            {giftCategories.map((category) => (
              <a
                key={category.id}
                href={category.href}
                className="group relative flex-shrink-0 overflow-hidden rounded-lg"
                style={{ width: "280px" }}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="mb-1 text-lg font-bold">{category.title}</h3>
                    <p className="text-sm text-white/90">{category.description}</p>
                  </div>
                </div>
              </a>
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
      </div>
    </section>
  );
}
