"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "../../lib/products";

interface ProductSectionProps {
    title: string;
    category: "football" | "basketball";
    products: Product[];
}

export default function ProductSection({ title, category, products }: ProductSectionProps) {
    const [activeTab, setActiveTab] = useState("all");

    const tabs = [
        { id: "all", label: `All ${category === "football" ? "Football" : "Basketball"}` },
        { id: "team", label: "By Team" },
        { id: "player", label: "By Player" },
        { id: "league", label: "By League" },
    ];

    return (
        <section className="bg-white py-12">
            <div className="mx-auto max-w-7xl px-6">
                <h2 className="mb-6 text-3xl font-bold text-zinc-900">{title}</h2>
                
                {/* Category Tabs */}
                <div className="mb-8 flex gap-2 border-b border-zinc-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? "border-b-2 border-[var(--brand-red)] text-[var(--brand-red)]"
                                    : "text-zinc-600 hover:text-zinc-900"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
