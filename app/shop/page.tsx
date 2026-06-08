"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import SportsNav from "../components/SportsNav";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { TeamPageSkeleton } from "../components/ui/Skeleton";
import type { Product } from "@/lib/products";
import HomeProductSections from "../components/HomeProductSections";
import NewArrivals from "../components/NewArrivals";
import { Filter, SortAsc, Grid3x3, ChevronDown } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";

const PAGE_SIZE = 20;

// Child component to use useSearchParams inside Suspense
function ShopPageContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [categories, setCategories] = useState<{name: string, slug: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const searchParams = useSearchParams();
    const leagueParam = searchParams.get("league") || "";

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Fetch categories
                const catRes = await fetch("/api/categories");
                const catData = await catRes.json();
                if (catData.success) {
                    setCategories(catData.categories);
                }

                const response = await fetch("/api/shop/products", { cache: "no-store" });
                const data = await response.json();

                if (data.success && data.products) {
                    setProducts(data.products);
                    setFilteredProducts(data.products);
                }
            } catch (error) {
                console.error("Error fetching shop data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        const raw = (searchParams.get("category") || "").toLowerCase();
        if (raw) {
            setSelectedCategory(raw);
        }
    }, [searchParams]);

    useEffect(() => {
        let filtered = [...products];

        // League filter from query param
        if (leagueParam) {
            filtered = filtered.filter((p) =>
                p.league && p.league.toLowerCase().replace(/\s+/g, "-") === leagueParam.toLowerCase()
            );
        }

        // Apply category filter
        if (selectedCategory !== "all") {
            filtered = filtered.filter((p) => {
                if (!p.category) return false;
                return p.category.toLowerCase() === selectedCategory.toLowerCase();
            });
        }

        // Apply sorting
        if (sortBy === "price-low") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high") {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === "name") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }

        setFilteredProducts(filtered);
    }, [selectedCategory, sortBy, products, leagueParam]);

    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [filteredProducts]);

    const displayedProducts = filteredProducts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredProducts.length;

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-6 py-12">
                <TeamPageSkeleton />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-6 py-12">
            {/* Hero Section */}
            <div className="mb-12">
                <h1 className="text-4xl font-black text-zinc-900 mb-3">Shop All Products</h1>
                <p className="text-lg text-zinc-600 max-w-2xl">
                    Discover jerseys, apparel, beauty, tech, and more from Cediman and marketplace
                    sellers across Ghana — one cart, fast delivery.
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
                                {categories.map((cat) => (
                                    <SelectItem key={cat.slug} value={cat.name.toLowerCase()}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
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
                Showing{" "}
                <span className="font-semibold text-zinc-900">
                    {filteredProducts.length === 0 ? 0 : Math.min(visibleCount, filteredProducts.length)}
                </span>{" "}
                of <span className="font-semibold text-zinc-900">{filteredProducts.length}</span> product
                {filteredProducts.length !== 1 ? "s" : ""}
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {displayedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    {hasMore && (
                        <div className="mt-16 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--brand-red)] to-red-600 text-white px-12 py-4 text-base font-black uppercase tracking-wider shadow-lg shadow-red-500/10 hover:shadow-xl hover:shadow-red-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/50 cursor-pointer"
                            >
                                <span>Load More</span>
                                <ChevronDown className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-0.5" />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="py-24 text-center">
                    <Grid3x3 className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-zinc-900 mb-2">No products found</h3>
                    <p className="text-zinc-600 mb-6">
                        Try adjusting your filters or browse all teams to find what you're looking for.
                    </p>
                </div>
            )}

            <div className="mt-24 space-y-24">
                <NewArrivals />
                <HomeProductSections />
            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <div className="min-h-screen bg-white text-zinc-900">
            <Header />
            <SportsNav />
            <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-12"><TeamPageSkeleton /></div>}>
                <ShopPageContent />
            </Suspense>
            <Footer />
        </div>
    );
}
