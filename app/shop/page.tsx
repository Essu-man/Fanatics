"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import SportsNav from "../components/SportsNav";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { TeamPageSkeleton } from "../components/ui/Skeleton";
import type { Product } from "@/lib/products";
import { Filter, SortAsc, Grid3x3 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("/api/admin/products");
                const data = await response.json();

                if (data.success && data.products) {
                    const availableProducts = data.products
                        .filter((p: any) => p.available && p.images && p.images.length > 0)
                        .map((p: any) => ({
                            id: p.id,
                            name: p.name,
                            team: p.team,
                            teamId: p.teamId,
                            price: p.price,
                            images: p.images || [],
                            colors: p.colors || [],
                        }));

                    setProducts(availableProducts);
                    setFilteredProducts(availableProducts);
                } else {
                    setProducts([]);
                    setFilteredProducts([]);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setProducts([]);
                setFilteredProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        let filtered = [...products];

        // Apply category filter
        if (selectedCategory !== "all") {
            filtered = filtered.filter((p) =>
                p.name.toLowerCase().includes(selectedCategory.toLowerCase())
            );
        }

        // Apply sorting
        if (sortBy === "price-low") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high") {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === "name") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
        // newest is default order

        setFilteredProducts(filtered);
    }, [selectedCategory, sortBy, products]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white text-zinc-900">
                <Header />
                <SportsNav />
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <TeamPageSkeleton />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900">
            <Header />
            <SportsNav />

            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Hero Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-zinc-900 mb-3">Shop All Products</h1>
                    <p className="text-lg text-zinc-600 max-w-2xl">
                        Discover our complete collection of authentic team jerseys, apparel, and gear.
                        From football to basketball and everything in between.
                    </p>
                </div>

                {/* Filters and Sort */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-zinc-600" />
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="jersey">Jerseys</SelectItem>
                                    <SelectItem value="apparel">Apparel</SelectItem>
                                    <SelectItem value="accessories">Accessories</SelectItem>
                                    <SelectItem value="training">Training Gear</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4 text-zinc-600" />
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="name">Name (A-Z)</SelectItem>
                                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6 text-sm text-zinc-600">
                    Showing <span className="font-semibold text-zinc-900">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? "s" : ""}
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <Grid3x3 className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-zinc-900 mb-2">No products found</h3>
                        <p className="text-zinc-600 mb-6">
                            Try adjusting your filters or browse all teams to find what you're looking for.
                        </p>
                        <Link
                            href="/teams"
                            className="inline-block bg-[var(--brand-red)] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[var(--brand-red-dark)] transition-colors"
                        >
                            Browse Teams
                        </Link>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
