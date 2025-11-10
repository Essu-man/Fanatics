"use client";

import ProductGrid from "./ProductGrid";
import LeagueFilter from "./LeagueFilter";

export default function ProductSection() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Featured jerseys</h2>
                <a className="text-sm font-medium text-indigo-600 hover:underline" href="#">
                    View all
                </a>
            </div>

            <LeagueFilter
                onFilterChange={(league) => {
                    // Will implement filtering logic in ProductGrid
                    console.log('Selected league:', league);
                }}
            />

            <ProductGrid />
        </div>
    );
}