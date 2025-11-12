"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Header from "../components/Header";
import SportsNav from "../components/SportsNav";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { TeamPageSkeleton } from "../components/ui/Skeleton";
import { products } from "../../lib/products";
import { footballTeams, basketballTeams } from "../../lib/teams";
import type { Product } from "../../lib/products";
import Link from "next/link";

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<{
        products: Product[];
        teams: Array<{ id: string; name: string; league: string }>;
    }>({ products: [], teams: [] });

    useEffect(() => {
        if (query) {
            setLoading(true);
            const q = query.toLowerCase();
            
            const matchingProducts = products.filter(
                (p) => p.name.toLowerCase().includes(q) || p.team?.toLowerCase().includes(q)
            );

            const allTeams = [...footballTeams, ...basketballTeams];
            const matchingTeams = allTeams.filter((team) => team.name.toLowerCase().includes(q));

            setResults({ products: matchingProducts, teams: matchingTeams });
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [query]);

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-6 py-12">
                <TeamPageSkeleton />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 mb-2">
                    {query ? `Search Results for "${query}"` : "Search"}
                </h1>
                <p className="text-zinc-600">
                    {results.products.length + results.teams.length} result{results.products.length + results.teams.length !== 1 ? "s" : ""} found
                </p>
            </div>

            {results.teams.length > 0 && (
                <div className="mb-12">
                    <h2 className="mb-4 text-xl font-semibold text-zinc-900">Teams</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {results.teams.map((team) => (
                            <Link
                                key={team.id}
                                href={`/teams/${team.id}`}
                                className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 hover:border-[var(--brand-red)] hover:shadow-md transition-all"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold">
                                    {team.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-zinc-900">{team.name}</div>
                                    <div className="text-xs text-zinc-500">{team.league}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {results.products.length > 0 && (
                <div>
                    <h2 className="mb-4 text-xl font-semibold text-zinc-900">Products</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {results.products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            )}

            {results.products.length === 0 && results.teams.length === 0 && query && (
                <div className="py-12 text-center">
                    <div className="mb-4 text-5xl">🔍</div>
                    <p className="mb-2 text-lg font-medium text-zinc-900">No results found</p>
                    <p className="mb-6 text-sm text-zinc-500">
                        Try searching for a team, player, or product name
                    </p>
                    <Link
                        href="/"
                        className="inline-block rounded-lg bg-[var(--brand-red)] px-6 py-2 text-white font-medium hover:bg-[var(--brand-red-dark)] transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <div className="min-h-screen bg-white text-zinc-900">
            <Header />
            <SportsNav />
            <Suspense fallback={
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <TeamPageSkeleton />
                </div>
            }>
                <SearchContent />
            </Suspense>
            <Footer />
        </div>
    );
}

