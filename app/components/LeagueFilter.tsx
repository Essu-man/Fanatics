"use client";

import { useState } from "react";
import Image from "next/image";

const leagues = [
    {
        id: "epl",
        name: "Premier League",
        logo: "/leagues/premier-league.png"
    },
    {
        id: "laliga",
        name: "La Liga",
        logo: "/leagues/la-liga.png"
    },
    {
        id: "bundesliga",
        name: "Bundesliga",
        logo: "/leagues/bundesliga.png"
    },
    {
        id: "seriea",
        name: "Serie A",
        logo: "/leagues/serie-a.png"
    },
    {
        id: "ligue1",
        name: "Ligue 1",
        logo: "/leagues/ligue-1.png"
    },
    {
        id: "ucl",
        name: "Champions League",
        logo: "/leagues/champions-league.png"
    },
    {
        id: "all",
        name: "All Leagues",
        icon: "🌍"
    },
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
                        {league.logo ? (
                            <div className="relative h-6 w-6 flex-shrink-0">
                                <Image
                                    src={league.logo}
                                    alt={league.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ) : (
                            <span className="text-base">{league.icon}</span>
                        )}
                        {league.name}
                    </button>
                ))}
            </div>
        </div>
    );
}