"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Team {
    id: string;
    name: string;
    league?: string;
    country?: string;
    logo?: string;
}

export function FootballDropdown() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch("/api/teams?sport=football")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then((data) => {
                setTeams(data.teams || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching teams:", err);
                setError(true);
                setLoading(false);
            });
    }, []);

    const topPlayers = ["Lionel Messi", "Cristiano Ronaldo", "Kylian Mbappé", "Erling Haaland", "Kevin De Bruyne"];
    const relatedLinks = [
        { label: "Premier League", href: "#" },
        { label: "La Liga", href: "#" },
        { label: "Champions League", href: "#" },
        { label: "World Cup", href: "#" },
    ];

    return (
        <div className="absolute left-1/2 top-full w-screen -translate-x-1/2 bg-white shadow-2xl z-[100] mt-0" style={{ minHeight: '200px' }}>
            <div className="absolute left-0 right-0 top-0 h-2 -translate-y-full bg-transparent pointer-events-none"></div>
            <div className="border-t border-zinc-200">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="grid grid-cols-4 gap-8">
                        {/* Teams in 3 columns */}
                        <div className="col-span-3">
                            {loading ? (
                                <div className="py-8 text-center text-sm text-zinc-500">Loading teams...</div>
                            ) : error ? (
                                <div className="py-8 text-center text-sm text-red-500">Failed to load teams. Please refresh.</div>
                            ) : teams.length === 0 ? (
                                <div className="py-8 text-center text-sm text-zinc-500">No teams available.</div>
                            ) : (
                                <div className="grid grid-cols-3 gap-6 max-h-[500px] overflow-y-auto">
                                    {teams.map((team) => (
                                        <Link
                                            key={team.id}
                                            href={`/teams/${team.id}`}
                                            className="flex items-center gap-3 rounded-md p-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 hover:text-[var(--brand-red)]"
                                        >
                                        {team.logo ? (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-zinc-200 overflow-hidden">
                                                <img
                                                    src={team.logo}
                                                    alt={team.name}
                                                    className="h-8 w-8 object-contain"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        if (target.parentElement) {
                                                            target.parentElement.innerHTML = `<span class="text-xs font-bold">${team.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</span>`;
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold">
                                                    {team.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div>{team.name}</div>
                                                {team.league && (
                                                    <div className="text-xs text-zinc-500">{team.league}</div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="col-span-1 border-l border-zinc-200 pl-6">
                            <div className="mb-6">
                                <h3 className="mb-3 text-sm font-bold text-zinc-900">Top Football Players</h3>
                                <ul className="space-y-2">
                                    {topPlayers.map((player) => (
                                        <li key={player}>
                                            <Link href="#" className="text-sm text-zinc-700 hover:text-[var(--brand-red)]">
                                                {player}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mb-6">
                                <ul className="space-y-2">
                                    {relatedLinks.map((link) => (
                                        <li key={link.label}>
                                            <Link href={link.href} className="text-sm text-zinc-700 hover:text-[var(--brand-red)]">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-lg border-2 border-zinc-200 bg-zinc-50 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-red)] text-white text-xs font-bold">
                                        ⚽
                                    </div>
                                    <span className="text-sm font-bold text-zinc-900">Football Store</span>
                                </div>
                                <p className="text-xs text-zinc-600">A Cediman Experience</p>
                            </div>
                        </div>
                    </div>

                    {/* Historic Teams */}
                    <div className="mt-6 border-t border-zinc-200 pt-4">
                        <div className="flex gap-4 text-sm">
                            <Link href="#" className="text-zinc-600 hover:text-[var(--brand-red)]">
                                All Historic Teams
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function BasketballDropdown() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch("/api/teams?sport=basketball")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then((data) => {
                setTeams(data.teams || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching teams:", err);
                setError(true);
                setLoading(false);
            });
    }, []);

    const topPlayers = ["LeBron James", "Stephen Curry", "Kevin Durant", "Giannis Antetokounmpo", "Luka Dončić"];
    const relatedLinks = [
        { label: "NBA Finals", href: "#" },
        { label: "NBA Logo Gear", href: "#" },
        { label: "Western Conference", href: "#" },
        { label: "Eastern Conference", href: "#" },
    ];

    return (
        <div className="absolute left-1/2 top-full w-screen -translate-x-1/2 bg-white shadow-2xl z-[100] mt-0" style={{ minHeight: '200px' }}>
            <div className="absolute left-0 right-0 top-0 h-2 -translate-y-full bg-transparent pointer-events-none"></div>
            <div className="border-t border-zinc-200">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="grid grid-cols-4 gap-8">
                        {/* Teams in 3 columns */}
                        <div className="col-span-3">
                            {loading ? (
                                <div className="py-8 text-center text-sm text-zinc-500">Loading teams...</div>
                            ) : error ? (
                                <div className="py-8 text-center text-sm text-red-500">Failed to load teams. Please refresh.</div>
                            ) : teams.length === 0 ? (
                                <div className="py-8 text-center text-sm text-zinc-500">No teams available.</div>
                            ) : (
                                <div className="grid grid-cols-3 gap-6 max-h-[500px] overflow-y-auto">
                                    {teams.map((team) => (
                                        <Link
                                            key={team.id}
                                            href={`/teams/${team.id}`}
                                            className="flex items-center gap-3 rounded-md p-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 hover:text-[var(--brand-red)]"
                                        >
                                        {team.logo ? (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-zinc-200 overflow-hidden">
                                                <img
                                                    src={team.logo}
                                                    alt={team.name}
                                                    className="h-8 w-8 object-contain"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        if (target.parentElement) {
                                                            target.parentElement.innerHTML = `<span class="text-xs font-bold">${team.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</span>`;
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold">
                                                    {team.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div>{team.name}</div>
                                                {team.league && (
                                                    <div className="text-xs text-zinc-500">{team.league}</div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="col-span-1 border-l border-zinc-200 pl-6">
                            <div className="mb-6">
                                <h3 className="mb-3 text-sm font-bold text-zinc-900">Top NBA Players</h3>
                                <ul className="space-y-2">
                                    {topPlayers.map((player) => (
                                        <li key={player}>
                                            <Link href="#" className="text-sm text-zinc-700 hover:text-[var(--brand-red)]">
                                                {player}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mb-6">
                                <ul className="space-y-2">
                                    {relatedLinks.map((link) => (
                                        <li key={link.label}>
                                            <Link href={link.href} className="text-sm text-zinc-700 hover:text-[var(--brand-red)]">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-lg border-2 border-zinc-200 bg-zinc-50 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-red)] text-white text-xs font-bold">
                                        🏀
                                    </div>
                                    <span className="text-sm font-bold text-zinc-900">NBA Store</span>
                                </div>
                                <p className="text-xs text-zinc-600">A Cediman Experience</p>
                            </div>
                        </div>
                    </div>

                    {/* Historic Teams */}
                    <div className="mt-6 border-t border-zinc-200 pt-4">
                        <div className="flex gap-4 text-sm">
                            <Link href="#" className="text-zinc-600 hover:text-[var(--brand-red)]">
                                Buffalo Braves
                            </Link>
                            <Link href="#" className="text-zinc-600 hover:text-[var(--brand-red)]">
                                Charlotte Bobcats
                            </Link>
                            <Link href="#" className="text-zinc-600 hover:text-[var(--brand-red)]">
                                Chicago Stags
                            </Link>
                            <Link href="#" className="text-zinc-600 hover:text-[var(--brand-red)]">
                                Cincinnati Royals
                            </Link>
                            <Link href="#" className="text-zinc-600 hover:text-[var(--brand-red)]">
                                All Historic Teams
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

