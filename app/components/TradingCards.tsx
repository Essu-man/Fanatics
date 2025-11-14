"use client";

import { useState, useRef, useEffect } from "react";

const tradingCards = [
  {
    id: "early-access",
    title: "Early Access On The Fanatics App",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&h=500&fit=crop",
    href: "#",
  },
  {
    id: "topps",
    title: "Topps",
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=500&h=500&fit=crop",
    href: "#",
  },
  {
    id: "under-wraps",
    title: "Fanatics Under Wraps",
    image: "https://images.unsplash.com/photo-1516138889897-3a135b1e0d40?w=500&h=500&fit=crop",
    href: "#",
  },
  {
    id: "topps-now",
    title: "Topps Now",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=500&fit=crop",
    href: "#",
  },
  {
    id: "panini",
    title: "Panini",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=500&fit=crop",
    href: "#",
  },
  {
    id: "upper-deck",
    title: "Upper Deck",
    image: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=500&h=500&fit=crop",
    href: "#",
  },
  {
    id: "rookie-cards",
    title: "Rookie Cards",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=500&fit=crop",
    href: "#",
  },
  {
    id: "autographed",
    title: "Autographed Cards",
    image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500&h=500&fit=crop",
    href: "#",
  },
];

export default function TradingCards() {
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
          Trading Cards & More
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
            {tradingCards.map((card) => (
              <a
                key={card.id}
                href={card.href}
                className="group relative flex-shrink-0 overflow-hidden rounded-lg"
                style={{ width: "280px" }}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white">
                    <h3 className="text-sm font-bold">{card.title}</h3>
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
