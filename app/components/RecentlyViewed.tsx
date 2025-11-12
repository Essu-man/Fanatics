"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import type { Product } from "../../lib/products";
import { products } from "../../lib/products";

export default function RecentlyViewed() {
    const [viewedProducts, setViewedProducts] = useState<Product[]>([]);

    useEffect(() => {
        try {
            const viewedIds = JSON.parse(localStorage.getItem("cediman:recentlyViewed") || "[]");
            const viewed = products.filter((p) => viewedIds.includes(p.id)).slice(0, 4);
            setViewedProducts(viewed);
        } catch (e) {
            setViewedProducts([]);
        }
    }, []);

    if (viewedProducts.length === 0) return null;

    return (
        <section className="bg-white py-12">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-zinc-900">Recently Viewed</h2>
                    <Link href="#" className="text-sm font-medium text-zinc-700 hover:text-[var(--brand-red)]">
                        View All
                    </Link>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {viewedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}

