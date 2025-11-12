"use client";

import { useMemo } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import type { Product } from "../../lib/products";
import { products } from "../../lib/products";

interface ProductRecommendationsProps {
    currentProduct: Product;
    limit?: number;
}

export default function ProductRecommendations({ currentProduct, limit = 4 }: ProductRecommendationsProps) {
    const recommendations = useMemo(() => {
        // Get products from same team
        const sameTeam = products
            .filter((p) => p.team === currentProduct.team && p.id !== currentProduct.id)
            .slice(0, limit);

        // If not enough, add random products
        if (sameTeam.length < limit) {
            const random = products
                .filter((p) => p.id !== currentProduct.id && !sameTeam.find((st) => st.id === p.id))
                .slice(0, limit - sameTeam.length);
            return [...sameTeam, ...random];
        }

        return sameTeam;
    }, [currentProduct, limit]);

    if (recommendations.length === 0) return null;

    return (
        <section className="border-t border-zinc-200 bg-white py-12">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-zinc-900">You May Also Like</h2>
                    <Link href="#" className="text-sm font-medium text-zinc-700 hover:text-[var(--brand-red)]">
                        View All
                    </Link>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {recommendations.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}

