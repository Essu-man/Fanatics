"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/firestore";
import StockIndicator from "./StockIndicator";

interface RecommendedProductsProps {
    title: string;
    products: Product[];
    loading?: boolean;
}

export default function RecommendedProducts({
    title,
    products,
    loading = false,
}: RecommendedProductsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(4);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setItemsPerView(1);
            } else if (window.innerWidth < 768) {
                setItemsPerView(2);
            } else if (window.innerWidth < 1024) {
                setItemsPerView(3);
            } else {
                setItemsPerView(4);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const maxIndex = Math.max(0, products.length - itemsPerView);

    const handlePrev = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-zinc-900">{title}</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse rounded-lg border border-zinc-200 bg-zinc-100 p-4"
                        >
                            <div className="mb-3 h-48 rounded-lg bg-zinc-200"></div>
                            <div className="mb-2 h-4 rounded bg-zinc-200"></div>
                            <div className="h-4 w-2/3 rounded bg-zinc-200"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-zinc-900">{title}</h2>
                {products.length > itemsPerView && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentIndex >= maxIndex}
                            className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Next"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            <div className="relative overflow-hidden">
                <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{
                        transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                    }}
                >
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="flex-shrink-0 px-2"
                            style={{ width: `${100 / itemsPerView}%` }}
                        >
                            <Link
                                href={`/products/${product.id}`}
                                className={`group block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:shadow-md ${product.available === false || product.stock === 0 ? 'opacity-60' : ''}`}
                            >
                                {product.images && product.images.length > 0 && (
                                    <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-zinc-100">
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className={`h-full w-full object-cover transition-transform group-hover:scale-105 ${product.available === false || product.stock === 0 ? 'grayscale' : ''}`}
                                        />
                                    </div>
                                )}
                                <div>
                                    <h3 className="mb-1 font-semibold text-zinc-900 line-clamp-1">
                                        {product.name}
                                    </h3>
                                    {product.team && (
                                        <p className="mb-2 text-xs text-zinc-500">{product.team}</p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-bold text-[var(--brand-red)]">
                                            ₵{product.price.toFixed(2)}
                                        </p>
                                        <StockIndicator stock={product.stock ?? 0} />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
