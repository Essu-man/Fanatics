"use client";

import { useState } from "react";

const leagues = [
    { id: "epl", name: "Premier League", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { id: "laliga", name: "La Liga", icon: "🇪🇸" },
    { id: "bundesliga", name: "Bundesliga", icon: "🇩🇪" },
    { id: "seriea", name: "Serie A", icon: "🇮🇹" },
    { id: "ligue1", name: "Ligue 1", icon: "🇫🇷" },
    { id: "all", name: "All Leagues", icon: "🌍" },
];

export default function LeagueFilter({ onFilterChange }: { onFilterChange?: (league: string) => void }) {
    const [activeLeague, setActiveLeague] = useState("all");

    function handleLeagueClick(leagueId: string) {
        setActiveLeague(leagueId);
        onFilterChange?.(leagueId);
    }

    return (
        <div className="mb-8">
            <div className="mb-3 text-sm font-medium text-zinc-500">Filter by league</div>
            <div className="flex flex-wrap gap-3">
                {leagues.map((league) => (
                    <button
                        key={league.id}
                        onClick={() => handleLeagueClick(league.id)}
                        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all hover:border-[var(--brand-red)] hover:bg-red-50 hover:text-[var(--brand-red)] 
                            ${activeLeague === league.id
                                ? "border-[var(--brand-red)] bg-red-50 text-[var(--brand-red)]"
                                : "border-zinc-200 text-zinc-600"
                            }`}
                    >
                        <span className="text-base">{league.icon}</span>
                        {league.name}
                    </button>
                ))}
            </div>
        </div>
    );
}