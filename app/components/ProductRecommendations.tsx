"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import type { Product } from "../../lib/firestore";
import { getProducts, getProductsByTeam } from "../../lib/firestore";

interface ProductRecommendationsProps {
    currentProduct: Product;
    limit?: number;
}

export default function ProductRecommendations({ currentProduct, limit = 4 }: ProductRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setIsLoading(true);
            try {
                let recs: Product[] = [];

                // 1. Try to get products from the same team
                if (currentProduct.teamId || currentProduct.team) {
                    // Prefer teamId if available (more reliable in DB), fallback to team name
                    // Note: getProductsByTeam currently expects teamId. Logic might need adjustment if using names.
                    // Assuming similar products share 'teamId' or we use 'team' to find them.
                    // For now, let's try getting all products and filtering, or using specifics if possible.
                    // Since getProductsByTeam exists, let's use it if we have a teamId.

                    if (currentProduct.teamId) {
                        const teamProducts = await getProductsByTeam(currentProduct.teamId);
                        recs = teamProducts.filter(p => p.id !== currentProduct.id);
                    } else {
                        // If no teamId, fetch unrelated products to filter? Or just skip.
                        // Ideally we should have teamId. If not, maybe we can fetch all and filter by team name
                        // but that's expensive. Let's just fall through to "recent/all".
                    }
                }

                // 2. If not enough products, fetch reliable 'recent' products from DB
                if (recs.length < limit) {
                    // Fetch a batch of products to fill the gap
                    // We fetch a bit more (e.g. limit * 2) to ensure we have enough after filtering current
                    const allProducts = await getProducts(); // This gets products ordered by createdAt desc

                    // Filter out current product and already added recs
                    const existingIds = new Set(recs.map(p => p.id));
                    existingIds.add(currentProduct.id);

                    const additional = allProducts
                        .filter(p => !existingIds.has(p.id))
                        .slice(0, limit - recs.length);

                    recs = [...recs, ...additional];
                }

                setRecommendations(recs.slice(0, limit));
            } catch (error) {
                console.error("Failed to load recommendations", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, [currentProduct, limit]);


    if (isLoading) {
        // Optional: Render a skeleton or return null
        return (
            <section className="border-t border-zinc-200 bg-white py-12">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="h-8 w-48 bg-zinc-100 rounded mb-6 animate-pulse"></div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[...Array(limit)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] bg-zinc-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (recommendations.length === 0) return null;

    return (
        <section className="border-t border-zinc-200 bg-white py-12">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-zinc-900">You May Also Like</h2>
                    <Link href="/shop" className="text-sm font-medium text-zinc-700 hover:text-[var(--brand-red)]">
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

