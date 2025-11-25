"use client";

import { useState } from "react";
import Button from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
import type { Product } from "@/lib/products";
import ProductCard from "@/app/components/ProductCard";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";

interface ProductGridProps {
    products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'new'>('featured');

    const sortedProducts = [...products].sort((a, b) => {
        switch (sortBy) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            default:
                return 0;
        }
    });

    return (
        <div className="mx-auto max-w-2xl px-4 lg:max-w-7xl">
            {/* Filters */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <div>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="featured">Featured</SelectItem>
                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            <SelectItem value="new">Newest</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-500">
                        {products.length} items
                    </span>
                </div>
            </div>

            {/* Product Grid */}
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}