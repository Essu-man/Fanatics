"use client";

import { useState, useRef, useEffect } from "react";

const collabs = [
  {
    id: "lululemon",
    title: "Lululemon",
    logo: "Ω",
    href: "#",
  },
  {
    id: "off-season",
    title: "OFF SEASON",
    href: "#",
  },
  {
    id: "todd-snyder",
    title: "TODD SNYDER NEW YORK",
    href: "#",
  },
  {
    id: "yeti",
    title: "YETI",
    href: "#",
  },
  {
    id: "fanatics",
    title: "Fanatics",
    href: "#",
  },
  {
    id: "nike",
    title: "Nike",
    href: "#",
  },
  {
    id: "adidas",
    title: "adidas",
    href: "#",
  },
  {
    id: "under-armour",
    title: "Under Armour",
    href: "#",
  },
  {
    id: "new-era",
    title: "New Era",
    href: "#",
  },
  {
    id: "mitchell-ness",
    title: "Mitchell & Ness",
    href: "#",
  },
];

export default function CollabsCollections() {
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
          Collabs & Collections
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
            {collabs.map((collab) => (
              <a
                key={collab.id}
                href={collab.href}
                className="group relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-50 p-8 transition-all duration-300 hover:bg-zinc-100"
                style={{ width: "280px", minHeight: "200px" }}
              >
                <div className="text-center">
                  {collab.logo ? (
                    <div className="text-5xl font-normal text-zinc-900">{collab.logo}</div>
                  ) : (
                    <h3 className="text-lg font-bold text-zinc-900 md:text-xl">{collab.title}</h3>
                  )}
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
