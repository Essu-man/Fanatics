"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  team?: string;
  price: number;
  images: string[];
  category?: string;
}

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardWidth = 296; // Card width (280px) + gap (24px)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/admin/products");
        const data = await response.json();

        if (data.success && data.products) {
          // Filter for available products, sort by newest first (createdAt), and limit to 5
          const availableProducts = data.products
            .filter((p: any) => p.available && p.images && p.images.length > 0)
            .sort((a: any, b: any) => {
              // Sort by createdAt descending (newest first)
              const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() :
                (a.createdAt ? new Date(a.createdAt).getTime() : 0);
              const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() :
                (b.createdAt ? new Date(b.createdAt).getTime() : 0);
              return dateB - dateA;
            })
            .slice(0, 5)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              team: p.team,
              price: p.price,
              images: p.images || [],
              category: p.category,
            }));
          setProducts(availableProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
          Wishlist-Worthy New Arrivals
        </h2>

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
            {loading ? (
              <div className="flex items-center justify-center" style={{ width: "280px" }}>
                <div className="text-zinc-500">Loading...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex items-center justify-center" style={{ width: "280px" }}>
                <div className="text-zinc-500">No products available</div>
              </div>
            ) : (
              products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group relative flex-shrink-0 overflow-hidden rounded-lg"
                  style={{ width: "280px" }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={product.images[0] || "https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=500&h=700&fit=crop"}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="mb-1 text-lg font-bold">{product.name}</h3>
                      <p className="text-sm text-white/90">
                        {product.team ? `${product.team} • ` : ""}${product.category || "Jersey"}
                      </p>
                      <p className="mt-1 text-base font-semibold">₵{product.price.toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
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
      </div>
    </section>
  );
}
