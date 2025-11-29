"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import TeamSelectionModal from "./TeamSelectionModal";

interface League {
    id: string;
    name: string;
    sport: string;
    teamCount: number;
}

// Map league names to their actual logo image URLs (using reliable CDN sources)
const getLeagueLogoUrl = (leagueName: string): string | null => {
    // Using a reliable sports logo CDN service
    const logoMap: Record<string, string> = {
        "Premier League": "https://media.api-sports.io/football/leagues/39.png",
        "La Liga": "https://media.api-sports.io/football/leagues/140.png",
        "Serie A": "https://media.api-sports.io/football/leagues/135.png",
        "Bundesliga": "https://media.api-sports.io/football/leagues/78.png",
        "Ligue 1": "https://media.api-sports.io/football/leagues/61.png",
        "UEFA": "https://media.api-sports.io/football/leagues/2.png",
        "Champions League": "https://media.api-sports.io/football/leagues/2.png",
        "Eredivisie": "https://media.api-sports.io/football/leagues/88.png",
        "Primeira Liga": "https://media.api-sports.io/football/leagues/94.png",
        "Scottish Premiership": "https://media.api-sports.io/football/leagues/179.png",
        "Süper Lig": "https://media.api-sports.io/football/leagues/203.png",
        "NFL": "https://a.espncdn.com/i/leaguelogos/nfl/500/nfl.png",
        "NBA": "https://cdn.nba.com/logos/nba/nba-logoman-75-word.svg",
        "EuroLeague": "https://www.euroleaguebasketball.net/euroleague/wp-content/uploads/2020/10/el-logo.svg",
        "WNBA": "https://a.espncdn.com/i/leaguelogos/wnba/500/wnba.png",
    };

    return logoMap[leagueName] || null;
};

export default function ShopYourTeams() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/leagues")
            .then((res) => res.json())
            .then((data) => {
                setLeagues(data.leagues || []);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const handleLeagueClick = (leagueId: string) => {
        setSelectedLeague(leagueId);
        setIsModalOpen(true);
    };

    const getLeagueInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 3)
            .toUpperCase();
    };

    const renderLeagueLogo = (league: League) => {
        const logoUrl = getLeagueLogoUrl(league.name);
        if (logoUrl) {
            return (
                <img
                    src={logoUrl}
                    alt={league.name}
                    className="h-full w-full object-contain p-2"
                    loading="lazy"
                    onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('span')) {
                            console.warn(`Failed to load logo for ${league.name} from ${logoUrl}`);
                            target.style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'text-lg font-bold text-zinc-700';
                            fallback.textContent = getLeagueInitials(league.name);
                            parent.appendChild(fallback);
                        }
                    }}
                />
            );
        }
        // Fallback to initials if no logo URL found
        console.warn(`No logo URL found for league: ${league.name}`);
        return (
            <span className="text-lg font-bold text-zinc-700">
                {getLeagueInitials(league.name)}
            </span>
        );
    };

    return (
        <>
            <section className="border-b border-zinc-200 bg-white py-3">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-2xl font-bold text-zinc-900">Shop Your Teams</h2>
                        <Link href="#" className="text-sm font-medium text-zinc-700 hover:text-[var(--brand-red)]">
                            See All
                        </Link>
                    </div>
                    {loading ? (
                        <div className="flex snap-x gap-4 overflow-x-auto pb-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex min-w-[80px] snap-start flex-col items-center gap-2">
                                    <div className="flex h-16 w-16 items-center justify-center animate-pulse rounded-full bg-zinc-200">
                                        <div className="h-14 w-14 animate-pulse rounded-full bg-zinc-300" />
                                    </div>
                                    <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex snap-x gap-4 overflow-x-auto pb-2">
                            {leagues.map((league) => (
                                <button
                                    key={league.id}
                                    onClick={() => handleLeagueClick(league.id)}
                                    className="flex min-w-[80px] snap-start flex-col items-center gap-2"
                                >
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-zinc-300 bg-white shadow-sm hover:border-[var(--brand-red)] transition-colors">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-zinc-200 bg-white overflow-hidden">
                                            {renderLeagueLogo(league)}
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-zinc-700 text-center">{league.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            <TeamSelectionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedLeague(null);
                }}
                selectedLeague={selectedLeague}
            />
        </>
    );
}

