"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Filter, SortAsc, ShoppingBag } from "lucide-react";
import Header from "../../components/Header";
import SportsNav from "../../components/SportsNav";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { TeamPageSkeleton } from "../../components/ui/Skeleton";
import type { Product } from "../../../lib/products";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";

interface Team {
    id: string;
    name: string;
    league: string;
    country?: string;
    logo?: string;
}

export default function TeamPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.teamId as string;
    const [team, setTeam] = useState<Team | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name">("name");
    const [filterType, setFilterType] = useState<string>("all");

    useEffect(() => {
        fetch(`/api/teams/${teamId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.team) {
                    setTeam(data.team);
                    setProducts(data.products || []);
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [teamId]);

    // Filter and sort products
    const filteredAndSortedProducts = products
        .filter((product) => {
            if (filterType === "all") return true;
            const productType = product.name.toLowerCase();
            if (filterType === "jerseys") return productType.includes("jersey");
            if (filterType === "apparel") return productType.includes("hoodie") || productType.includes("shirt") || productType.includes("shorts");
            if (filterType === "accessories") return productType.includes("cap");
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "price-asc") return a.price - b.price;
            if (sortBy === "price-desc") return b.price - a.price;
            return a.name.localeCompare(b.name);
        });

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

    if (!team) {
        return (
            <div className="min-h-screen bg-white text-zinc-900">
                <Header />
                <SportsNav />
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <div className="text-center py-12">
                        <p className="text-lg text-zinc-600 mb-4">Team not found.</p>
                        <button
                            onClick={() => router.back()}
                            className="text-[var(--brand-red)] hover:underline"
                        >
                            Go back
                        </button>
                    </div>
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
                {/* Breadcrumb Navigation */}
                <div className="mb-6 flex items-center gap-2 text-sm">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1 text-zinc-600 hover:text-[var(--brand-red)] transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back</span>
                    </button>
                    <span className="text-zinc-400">/</span>
                    <Link
                        href={`/search?q=${encodeURIComponent(team.league)}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        {team.league}
                    </Link>
                    <span className="text-zinc-400">/</span>
                    <span className="text-zinc-900">{team.name}</span>
                </div>

                {/* Team Header */}
                <div className="mb-8 flex items-start gap-4">
                    {team.logo && (
                        <img
                            src={team.logo}
                            alt={team.name}
                            className="h-20 w-20 rounded-lg object-contain border border-zinc-200"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                            }}
                        />
                    )}
                    <div>
                        <h1 className="text-4xl font-bold text-zinc-900 mb-2">{team.name} Apparel</h1>
                        <p className="text-zinc-600">Shop official {team.name} jerseys, gear, and more</p>
                    </div>
                </div>

                {/* Filters and Sort */}
                <div className="mb-6 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-zinc-500" />
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Products</SelectItem>
                                <SelectItem value="jerseys">Jerseys</SelectItem>
                                <SelectItem value="apparel">Apparel</SelectItem>
                                <SelectItem value="accessories">Accessories</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4 text-zinc-500" />
                        <Select
                            value={sortBy}
                            onValueChange={(value) => setSortBy(value as "price-asc" | "price-desc" | "name")}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Sort by Name</SelectItem>
                                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="ml-auto text-sm text-zinc-600">
                        {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? "s" : ""}
                    </div>
                </div>

                {/* Products Grid */}
                {filteredAndSortedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {filteredAndSortedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                            <ShoppingBag className="h-8 w-8 text-zinc-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-zinc-900">No products found</h3>
                        <p className="mb-6 text-sm text-zinc-600">
                            We couldn't find any products matching your filters. Try adjusting your search criteria.
                        </p>
                        <button
                            onClick={() => {
                                setFilterType("all");
                                setSortBy("name");
                            }}
                            className="rounded-lg bg-[var(--brand-red)] px-6 py-2 text-white font-medium hover:bg-[var(--brand-red-dark)] transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

