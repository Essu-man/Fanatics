"use client";

import { useState, useEffect } from "react";
import { X, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Team {
    id: string;
    name: string;
    league: string;
    logo?: string;
}


interface TeamSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLeague?: string | null;
}

export default function TeamSelectionModal({ isOpen, onClose, selectedLeague }: TeamSelectionModalProps) {
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [activeLeague, setActiveLeague] = useState("Football");
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [leagues, setLeagues] = useState<{ id: string; name: string; sport: string }[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            // Fetch leagues first
            fetch("/api/leagues")
                .then((res) => res.json())
                .then((data) => {
                    const leaguesData = data.leagues || [];
                    setLeagues(leaguesData);

                    // If a league is selected, find its sport and set active league
                    if (selectedLeague) {
                        const league = leaguesData.find((l: { id: string }) => l.id === selectedLeague);
                        if (league) {
                            const sport = league.sport === "football" ? "Football" : "Basketball";
                            setActiveLeague(sport);

                            // Fetch and filter teams for the selected league
                            setLoading(true);
                            fetch(`/api/teams?sport=${league.sport}`)
                                .then((res) => res.json())
                                .then((data) => {
                                    const filteredTeams = (data.teams || []).filter(
                                        (team: Team) => team.league === league.name
                                    );
                                    setTeams(filteredTeams);
                                    setLoading(false);
                                })
                                .catch(() => {
                                    setLoading(false);
                                });
                        } else {
                            // No league selected, fetch all teams for active league
                            const sport = activeLeague.toLowerCase();
                            setLoading(true);
                            fetch(`/api/teams?sport=${sport}`)
                                .then((res) => res.json())
                                .then((data) => {
                                    setTeams(data.teams || []);
                                    setLoading(false);
                                })
                                .catch(() => {
                                    setLoading(false);
                                });
                        }
                    } else {
                        // No league selected, fetch all teams for active league
                        const sport = activeLeague.toLowerCase();
                        setLoading(true);
                        fetch(`/api/teams?sport=${sport}`)
                            .then((res) => res.json())
                            .then((data) => {
                                setTeams(data.teams || []);
                                setLoading(false);
                            })
                            .catch(() => {
                                setLoading(false);
                            });
                    }
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [isOpen, selectedLeague]);

    useEffect(() => {
        if (isOpen && !selectedLeague) {
            // When active league changes and no league is selected, fetch all teams
            const sport = activeLeague.toLowerCase();
            setLoading(true);
            fetch(`/api/teams?sport=${sport}`)
                .then((res) => res.json())
                .then((data) => {
                    setTeams(data.teams || []);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [activeLeague, isOpen, selectedLeague]);

    if (!isOpen) return null;

    const handleTeamClick = (teamId: string, teamName: string) => {
        router.push(`/teams/${teamId}`);
        onClose();
    };

    const toggleTeamSelection = (teamId: string) => {
        setSelectedTeams((prev) =>
            prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
        );
    };

    const removeTeam = (teamId: string) => {
        setSelectedTeams((prev) => prev.filter((id) => id !== teamId));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 md:p-4">
            <div className="relative w-full h-full md:h-auto md:max-w-5xl md:max-h-[90vh] overflow-hidden bg-white md:rounded-lg shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 md:right-4 md:top-4 z-10 rounded-full bg-white p-2 shadow-md hover:bg-zinc-100 transition-colors"
                >
                    <X className="h-5 w-5 md:h-5 md:w-5 text-zinc-700" />
                </button>

                <div className="overflow-y-auto h-full md:max-h-[90vh] p-4 md:p-6">
                    {/* Your Teams Section */}
                    <div className="mb-6 md:mb-8">
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                            <h2 className="text-xl md:text-2xl font-bold text-zinc-900">Your Teams</h2>
                            <button className="text-xs md:text-sm text-zinc-600 underline hover:text-[var(--brand-red)] transition-colors">
                                Save
                            </button>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                            {selectedTeams.slice(0, 8).map((teamId) => {
                                const team = teams.find((t) => t.id === teamId);
                                return (
                                    <div key={teamId} className="relative flex-shrink-0">
                                        <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full border-2 border-zinc-200 bg-white overflow-hidden">
                                            {team?.logo ? (
                                                <img
                                                    src={team.logo}
                                                    alt={team.name}
                                                    className="h-12 w-12 md:h-16 md:w-16 object-contain"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        if (target.parentElement) {
                                                            target.parentElement.innerHTML = `<span class="text-xs font-bold text-zinc-700">${team.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</span>`;
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-xs font-bold text-zinc-700">
                                                    {team?.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .slice(0, 2)
                                                        .toUpperCase() || "T"}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeTeam(teamId)}
                                            className="absolute -right-1 -top-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-zinc-700 text-white hover:bg-zinc-900 transition-colors"
                                        >
                                            <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                        </button>
                                    </div>
                                );
                            })}
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={`placeholder-${i}`}
                                    className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-white flex-shrink-0"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="mb-6 md:mb-8 h-px bg-zinc-200" />

                    {/* All Leagues and Teams Section */}
                    <div>
                        <h2 className="mb-3 md:mb-4 text-xl md:text-2xl font-bold text-zinc-900">All Leagues and Teams</h2>

                        {/* League Navigation */}
                        <div className="mb-4 md:mb-6 flex items-center gap-2 md:gap-4 overflow-x-auto border-b border-zinc-200 pb-2 -mx-1 px-1 scrollbar-hide">
                            <button
                                onClick={() => setActiveLeague("Football")}
                                className={`whitespace-nowrap px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-colors ${activeLeague === "Football"
                                    ? "border-b-2 border-zinc-900 text-zinc-900 font-bold"
                                    : "border-b-2 border-transparent text-zinc-600 hover:text-zinc-900"
                                    }`}
                            >
                                Football
                            </button>
                            <button
                                onClick={() => setActiveLeague("Basketball")}
                                className={`whitespace-nowrap px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-colors ${activeLeague === "Basketball"
                                    ? "border-b-2 border-zinc-900 text-zinc-900 font-bold"
                                    : "border-b-2 border-transparent text-zinc-600 hover:text-zinc-900"
                                    }`}
                            >
                                Basketball
                            </button>
                            {leagues
                                .filter((l) => l.sport === activeLeague.toLowerCase())
                                .map((league) => (
                                    <button
                                        key={league.id}
                                        onClick={() => {
                                            const sport = league.sport === "football" ? "Football" : "Basketball";
                                            setActiveLeague(sport);
                                            // Filter teams by league
                                            fetch(`/api/teams?sport=${league.sport}`)
                                                .then((res) => res.json())
                                                .then((data) => {
                                                    const filteredTeams = (data.teams || []).filter(
                                                        (team: Team) => team.league === league.name
                                                    );
                                                    setTeams(filteredTeams);
                                                });
                                        }}
                                        className={`whitespace-nowrap px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-colors ${selectedLeague === league.id
                                            ? "border-b-2 border-[var(--brand-red)] text-[var(--brand-red)] font-bold"
                                            : "text-zinc-600 hover:text-zinc-900"
                                            }`}
                                    >
                                        {league.name}
                                    </button>
                                ))}
                        </div>

                        {/* Team Grid */}
                        {loading ? (
                            <div className="py-8 md:py-12 text-center text-xs md:text-sm text-zinc-500">Loading teams...</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 overflow-y-auto max-h-[50vh] md:max-h-[400px] pr-1 md:pr-2">
                                {teams.map((team) => (
                                    <div
                                        key={team.id}
                                        className="group relative cursor-pointer rounded-lg border border-zinc-200 bg-white p-2 md:p-4 transition-all hover:border-[var(--brand-red)] hover:shadow-md"
                                        onClick={() => handleTeamClick(team.id, team.name)}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleTeamSelection(team.id);
                                            }}
                                            className="absolute right-1.5 top-1.5 md:right-2 md:top-2 rounded-full bg-white p-1 md:p-1.5 shadow-sm hover:bg-zinc-50 z-10 transition-colors"
                                        >
                                            <Heart
                                                className={`h-3 w-3 md:h-4 md:w-4 ${selectedTeams.includes(team.id)
                                                    ? "fill-[var(--brand-red)] text-[var(--brand-red)]"
                                                    : "text-zinc-400"
                                                    }`}
                                            />
                                        </button>
                                        <div className="flex h-12 w-12 md:h-16 md:w-16 mx-auto items-center justify-center rounded-full bg-white border border-zinc-200 mb-2 md:mb-3 overflow-hidden">
                                            {team.logo ? (
                                                <img
                                                    src={team.logo}
                                                    alt={team.name}
                                                    className="h-12 w-12 md:h-16 md:w-16 object-contain"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        if (target.parentElement) {
                                                            target.parentElement.innerHTML = `<span class="text-sm md:text-lg font-bold text-zinc-700">${team.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>`;
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-sm md:text-lg font-bold text-zinc-700">
                                                    {team.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .slice(0, 2)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-center text-xs md:text-sm font-medium text-zinc-900 line-clamp-2">{team.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

