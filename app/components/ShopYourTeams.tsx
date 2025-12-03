"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import TeamSelectionModal from "./TeamSelectionModal";

interface League {
    id: string;
    name: string;
    sport: string;
    teamCount: number;
    logoUrl?: string;
}

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
        if (league.logoUrl) {
            return (
                <img
                    src={league.logoUrl}
                    alt={league.name}
                    className="h-full w-full object-contain p-2"
                    loading="lazy"
                    onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('span')) {
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
        // Fallback to initials if no logo URL
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

