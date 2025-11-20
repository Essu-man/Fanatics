"use client";

import { useState, useEffect } from "react";
import { Search, X, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MobileSearchModalProps {
    open: boolean;
    onClose: () => void;
}

export default function MobileSearchModal({ open, onClose }: MobileSearchModalProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        // Load recent searches from localStorage
        try {
            const stored = localStorage.getItem("cediman:recent-searches");
            if (stored) {
                setRecentSearches(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Error loading recent searches:", error);
        }
    }, []);

    const handleSearch = (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        // Save to recent searches
        const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("cediman:recent-searches", JSON.stringify(updated));

        // Navigate to search page
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        onClose();
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem("cediman:recent-searches");
    };

    if (!open) return null;

    const trendingSearches = ["Manchester United", "Barcelona", "Real Madrid", "Liverpool", "PSG"];

    return (
        <div className="fixed inset-0 z-50 bg-white">
            {/* Header */}
            <div className="border-b border-zinc-200 bg-white p-4">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="search"
                            placeholder="Search products, teams..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
                            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-base focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                            autoFocus
                        />
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-4" style={{ height: "calc(100vh - 80px)" }}>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                    <div className="mb-6">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-zinc-900">Recent Searches</h3>
                            <button
                                onClick={clearRecentSearches}
                                className="text-xs font-medium text-[var(--brand-red)] hover:text-[var(--brand-red-dark)]"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="space-y-2">
                            {recentSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSearch(search)}
                                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-zinc-50"
                                >
                                    <Clock className="h-4 w-4 text-zinc-400" />
                                    <span className="flex-1 text-sm text-zinc-900">{search}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trending Searches */}
                <div>
                    <div className="mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[var(--brand-red)]" />
                        <h3 className="text-sm font-semibold text-zinc-900">Trending Searches</h3>
                    </div>
                    <div className="space-y-2">
                        {trendingSearches.map((search, index) => (
                            <button
                                key={index}
                                onClick={() => handleSearch(search)}
                                className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-zinc-50"
                            >
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-red)] text-xs font-semibold text-white">
                                    {index + 1}
                                </div>
                                <span className="flex-1 text-sm text-zinc-900">{search}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
