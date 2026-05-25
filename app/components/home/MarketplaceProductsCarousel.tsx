"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Store } from "lucide-react";
import type { Product } from "@/lib/products";

const SLIDE_MS = 5000;
const CARD_WIDTH = 280;
const GAP = 24;

type CarouselProduct = Product & {
    storeLabel: string;
};

function toCarouselProduct(p: Product): CarouselProduct {
    return {
        ...p,
        storeLabel: p.vendorName || (p.vendorSlug ? p.vendorSlug : "Cediman"),
    };
}

export default function MarketplaceProductsCarousel() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [products, setProducts] = useState<CarouselProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        setCanScrollLeft(scrollLeft > 8);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
    }, []);

    useEffect(() => {
        fetch("/api/shop/products", { cache: "no-store" })
            .then((res) => res.json())
            .then((data) => {
                if (!data.success || !Array.isArray(data.products)) {
                    setProducts([]);
                    return;
                }
                const list = (data.products as Product[])
                    .slice(0, 24)
                    .map(toCarouselProduct);
                setProducts(list);
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    const scrollByStep = useCallback((direction: 1 | -1) => {
        const el = scrollRef.current;
        if (!el) return;
        const step = CARD_WIDTH + GAP;
        const maxScroll = el.scrollWidth - el.clientWidth;
        const next =
            direction === 1
                ? el.scrollLeft + step >= maxScroll - 8
                    ? 0
                    : el.scrollLeft + step
                : el.scrollLeft - step <= 8
                  ? maxScroll
                  : el.scrollLeft - step;
        el.scrollTo({ left: next, behavior: "smooth" });
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el || products.length === 0) return;

        updateScrollState();
        el.addEventListener("scroll", updateScrollState, { passive: true });
        window.addEventListener("resize", updateScrollState);

        return () => {
            el.removeEventListener("scroll", updateScrollState);
            window.removeEventListener("resize", updateScrollState);
        };
    }, [products.length, updateScrollState]);

    useEffect(() => {
        if (paused || products.length < 2) return;
        const id = window.setInterval(() => scrollByStep(1), SLIDE_MS);
        return () => window.clearInterval(id);
    }, [paused, products.length, scrollByStep]);

    if (!loading && products.length === 0) return null;

    return (
        <section className="mb-16" aria-label="Products from all stores">
            <div className="mx-auto max-w-7xl px-4 md:px-6">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900">From every store</h2>
                        <p className="text-zinc-500 font-medium">
                            Fresh picks across Cediman and marketplace sellers — updates every few seconds
                        </p>
                    </div>
                    <Link
                        href="/shop"
                        className="hidden sm:inline-flex text-sm font-bold text-emerald-600 items-center gap-1 hover:underline"
                    >
                        Shop all
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                <div
                    className="relative"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                    onFocusCapture={() => setPaused(true)}
                    onBlurCapture={() => setPaused(false)}
                >
                    {products.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={() => scrollByStep(-1)}
                                disabled={!canScrollLeft && products.length <= 4}
                                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-zinc-200 bg-white p-2.5 shadow-lg transition hover:bg-zinc-50 disabled:opacity-40"
                                aria-label="Previous products"
                            >
                                <ChevronLeft className="h-5 w-5 text-zinc-800" />
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollByStep(1)}
                                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-zinc-200 bg-white p-2.5 shadow-lg transition hover:bg-zinc-50"
                                aria-label="Next products"
                            >
                                <ChevronRight className="h-5 w-5 text-zinc-800" />
                            </button>
                        </>
                    )}

                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scroll-smooth px-1 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                        {loading
                            ? [1, 2, 3, 4].map((i) => (
                                  <div
                                      key={i}
                                      className="h-[360px] shrink-0 animate-pulse rounded-2xl bg-zinc-100"
                                      style={{ width: CARD_WIDTH }}
                                  />
                              ))
                            : products.map((product) => (
                                  <Link
                                      key={product.id}
                                      href={`/products/${product.id}`}
                                      className="group relative shrink-0 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition hover:shadow-md"
                                      style={{ width: CARD_WIDTH }}
                                  >
                                      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                              src={product.images[0]}
                                              alt={product.name}
                                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                              loading="lazy"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                              <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm">
                                                  <Store className="h-3 w-3" />
                                                  {product.storeLabel}
                                              </span>
                                              <h3 className="line-clamp-2 text-lg font-bold leading-tight">
                                                  {product.name}
                                              </h3>
                                              {product.category && (
                                                  <p className="mt-1 text-xs text-white/80">{product.category}</p>
                                              )}
                                              <p className="mt-2 text-base font-black">
                                                  ₵{product.price.toFixed(2)}
                                              </p>
                                          </div>
                                      </div>
                                  </Link>
                              ))}
                    </div>
                </div>

                <Link
                    href="/shop"
                    className="mt-6 inline-flex sm:hidden text-sm font-bold text-emerald-600 items-center gap-1 hover:underline"
                >
                    Shop all products
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        </section>
    );
}
