"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Heart, Zap, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface Team {
    id: string;
    name: string;
    league: string;
    leagueId?: string;
    logo?: string;
    logoUrl?: string;
    sport?: string;
}

interface League {
    id: string;
    name: string;
    sport: string;
    logoUrl?: string;
    teamCount?: number;
}

interface LeagueTeamsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLeagueId?: string | null;
}

const gradients = {
    "English Premier League": "from-purple-600 to-purple-400",
    "Spain la liga": "from-orange-600 to-orange-400",
    "German bundesliga": "from-yellow-600 to-yellow-400",
    "Ghana premier league": "from-red-600 to-red-400",
    "International": "from-blue-600 to-blue-400",
    "Seria A": "from-green-600 to-green-400",
    "French ligue 1": "from-indigo-600 to-indigo-400",
    "Eredivisie": "from-rose-600 to-rose-400",
    "Rest of World(Others)": "from-slate-600 to-slate-400",
};

const getGradient = (leagueName: string): string => {
    return (gradients as Record<string, string>)[leagueName] || "from-slate-600 to-slate-400";
};

export default function LeagueTeamsModal({ isOpen, onClose, selectedLeagueId }: LeagueTeamsModalProps) {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [currentLeagueIndex, setCurrentLeagueIndex] = useState(0);
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [leaguesLoading, setLeaguesLoading] = useState(true);
    const [selectedTeamsData, setSelectedTeamsData] = useState<Team[]>([]);
    const router = useRouter();

    // Fetch all leagues
    useEffect(() => {
        if (isOpen) {
            setLeaguesLoading(true);
            fetch("/api/leagues")
                .then((res) => res.json())
                .then((data) => {
                    const leaguesData = data.leagues || [];
                    console.log(`[LeagueTeamsModal] Fetched ${leaguesData.length} leagues:`,
                        leaguesData.map((l: League) => ({ id: l.id, name: l.name, sport: l.sport }))
                    );
                    setLeagues(leaguesData);

                    // If a league is pre-selected, find its index
                    if (selectedLeagueId) {
                        const index = leaguesData.findIndex((l: League) => l.id === selectedLeagueId);
                        if (index !== -1) {
                            setCurrentLeagueIndex(index);
                            fetchTeamsForLeague(leaguesData[index]);
                        }
                    } else if (leaguesData.length > 0) {
                        setCurrentLeagueIndex(0);
                        fetchTeamsForLeague(leaguesData[0]);
                    }
                    setLeaguesLoading(false);
                })
                .catch((err) => {
                    console.error(`[LeagueTeamsModal] Error fetching leagues:`, err);
                    setLeaguesLoading(false);
                });
        }
    }, [isOpen, selectedLeagueId]);

    // Helper function to normalize league names for matching
    const normalizeLeagueName = (name: string): string => {
        return name
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    };

    // League name mapping - EXPLICIT mapping from Firebase custom_leagues to hardcoded team league names
    // This ensures proper matching between:
    // - Custom leagues (stored in Firebase custom_leagues collection)
    // - Hardcoded teams (stored in Firebase teams collection with 'league' field)
    const leagueNameMap: Record<string, string[]> = {
        // English leagues
        "English Premier League": ["Premier League", "EPL", "Premier", "english premier"],

        // Spanish leagues
        "Spain la liga": ["La Liga", "LaLiga", "Spanish la liga", "spain"],

        // German leagues
        "German bundesliga": ["Bundesliga", "German bundesliga", "germany"],

        // Italian leagues
        "Seria A": ["Serie A", "SerieA", "Serie a", "Seriea", "italian", "italy"],

        // French leagues
        "French ligue 1": ["Ligue 1", "Ligue1", "French ligue", "France"],

        // Dutch leagues
        "Eredivisie": ["Eredivisie", "Dutch", "Netherlands"],

        // African leagues
        "Ghana premier league": ["Ghana Premier League", "Ghana", "GPL"],

        // International
        "International": ["International", "International Teams", "International Clubs"],

        // Catch-all
        "Rest of the World": ["Other", "Unknown", "Miscellaneous", "Others"],
    };

    // Check if two league names match (handles variations like "Premier League" vs "English Premier League")
    const leaguesMatch = (teamLeague: string, leagueName: string): boolean => {
        const normalized1 = normalizeLeagueName(teamLeague);
        const normalized2 = normalizeLeagueName(leagueName);

        // 1. Exact match after normalization
        if (normalized1 === normalized2) {
            console.log(`[LeagueTeamsModal] Exact match: "${teamLeague}" === "${leagueName}"`);
            return true;
        }

        // 2. Check explicit mapping
        for (const [customName, hardcodedNames] of Object.entries(leagueNameMap)) {
            const normalizedCustom = normalizeLeagueName(customName);
            const normalizedLeagueName = normalizeLeagueName(leagueName);

            // If this custom league matches the one we're looking for
            const customMatch =
                normalizedCustom === normalizedLeagueName ||
                normalizedCustom.includes(normalizedLeagueName) ||
                normalizedLeagueName.includes(normalizedCustom);

            if (customMatch) {
                // Check if the team league is in the hardcoded names for this custom league
                for (const hardcodedName of hardcodedNames) {
                    const normalizedHardcoded = normalizeLeagueName(hardcodedName);
                    if (normalized1 === normalizedHardcoded ||
                        normalized1.includes(normalizedHardcoded) ||
                        normalizedHardcoded.includes(normalized1)) {
                        console.log(`[LeagueTeamsModal] Mapping match: "${teamLeague}" -> custom league "${customName}"`);
                        return true;
                    }
                }
            }
        }

        // 3. Fallback to partial match (one contains the other)
        if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
            console.log(`[LeagueTeamsModal] Partial match: "${teamLeague}" contains or is contained in "${leagueName}"`);
            return true;
        }

        return false;
    };

    // Fetch teams for a specific league
    const fetchTeamsForLeague = (league: League) => {
        setLoading(true);
        console.log(`[LeagueTeamsModal] Fetching teams for league:`, {
            id: league.id,
            name: league.name,
            sport: league.sport
        });

        // Fetch teams and products in parallel
        Promise.all([
            fetch(`/api/teams?sport=${league.sport}`).then((res) => res.json()),
            fetch(`/api/admin/products?limit=10000`).then((res) => res.json()).catch(() => ({ products: [] }))
        ])
            .then(([teamData, productData]) => {
                const allTeams = teamData.teams || [];
                const allProducts = productData.products || [];

                // Create a set of teamIds that have products
                const teamIdsWithProducts = new Set<string>();
                allProducts.forEach((product: any) => {
                    if (product.teamId) {
                        teamIdsWithProducts.add(product.teamId);
                    }
                });

                console.log(`[LeagueTeamsModal] API returned ${allTeams.length} teams total for sport "${league.sport}"`);
                console.log(`[LeagueTeamsModal] Found ${teamIdsWithProducts.size} teams with products`);
                console.log(`[LeagueTeamsModal] Sample teams from API:`, allTeams.slice(0, 3).map((t: Team) => ({
                    id: t.id,
                    name: t.name,
                    league: t.league,
                    leagueId: t.leagueId
                })));

                const filteredTeams = allTeams.filter((team: Team) => {
                    // First, check if team matches the league
                    const matchesLeague = team.leagueId === league.id ||
                        (team.league && leaguesMatch(team.league, league.name));

                    if (!matchesLeague) return false;

                    // Then, check if team has products
                    const hasProducts = teamIdsWithProducts.has(team.id);
                    if (!hasProducts) {
                        console.log(`[LeagueTeamsModal] Excluding team with no products: ${team.name}`);
                    } else {
                        if (team.leagueId === league.id) {
                            console.log(`[LeagueTeamsModal] Match by leagueId: ${team.name}`);
                        } else if (team.league && leaguesMatch(team.league, league.name)) {
                            console.log(`[LeagueTeamsModal] Match by league name: ${team.name} (team.league="${team.league}" vs league.name="${league.name}")`);
                        }
                    }
                    return hasProducts;
                });
                console.log(`[LeagueTeamsModal] Filtered to ${filteredTeams.length} teams with products for league "${league.name}"`);
                setTeams(filteredTeams);
            })
            .catch((err) => {
                console.error(`[LeagueTeamsModal] Error fetching teams:`, err);
                setTeams([]);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Update teams when current league changes
    useEffect(() => {
        if (leagues.length > 0 && currentLeagueIndex >= 0 && currentLeagueIndex < leagues.length) {
            fetchTeamsForLeague(leagues[currentLeagueIndex]);
        }
    }, [currentLeagueIndex, leagues]);

    // Update selected teams data when selectedTeams changes
    useEffect(() => {
        const data = teams.filter((t) => selectedTeams.includes(t.id));
        setSelectedTeamsData(data);
    }, [selectedTeams, teams]);

    if (!isOpen) return null;

    const currentLeague = leagues[currentLeagueIndex];
    const leagueCount = leagues.length;

    const handleNavigate = (direction: "prev" | "next") => {
        if (direction === "prev" && currentLeagueIndex > 0) {
            setCurrentLeagueIndex(currentLeagueIndex - 1);
        } else if (direction === "next" && currentLeagueIndex < leagueCount - 1) {
            setCurrentLeagueIndex(currentLeagueIndex + 1);
        }
    };

    const toggleTeamSelection = (teamId: string) => {
        setSelectedTeams((prev) =>
            prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
        );
    };

    const removeTeam = (teamId: string) => {
        setSelectedTeams((prev) => prev.filter((id) => id !== teamId));
    };

    const handleTeamClick = (teamId: string) => {
        router.push(`/teams/${teamId}`);
        onClose();
    };

    const handleSave = () => {
        // TODO: Save selected teams to user preferences/cart
        onClose();
    };

    if (leaguesLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex h-screen md:h-[80vh] items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-12 w-12 border-4 border-slate-200 border-t-[var(--brand-red)] rounded-full animate-spin" />
                            <p className="text-slate-600">Loading leagues...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8">
                {/* Close Button - Positioned absolutely over the modal */}
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 md:right-4 md:top-4 z-50 rounded-full bg-slate-100 hover:bg-slate-200 p-2 shadow-lg transition-all hover:scale-110"
                >
                    <X className="h-6 w-6 text-slate-700" />
                </button>

                <div className="overflow-y-auto max-h-[85vh] md:max-h-[90vh]">
                    {/* Hero Section with League Header */}
                    {currentLeague && (
                        <div className={`relative bg-gradient-to-br ${getGradient(currentLeague.name)} text-white p-6 md:p-8 overflow-hidden`}>
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20" />

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex-1 pr-8">
                                        <div className="inline-flex items-center gap-2 mb-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                            <Crown className="h-4 w-4" />
                                            <span className="text-xs md:text-sm font-semibold">League {currentLeagueIndex + 1} of {leagueCount}</span>
                                        </div>
                                        <h1 className="text-3xl md:text-4xl font-black mb-2">{currentLeague.name}</h1>
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4" />
                                            <p className="text-sm md:text-base opacity-90">{teams.length} Teams Available</p>
                                        </div>
                                    </div>

                                    {/* League Logo */}
                                    {currentLeague.logoUrl && (
                                        <div className="flex-shrink-0">
                                            <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white/20 backdrop-blur-sm rounded-xl p-2 border border-white/30 overflow-hidden shadow-lg">
                                                <img
                                                    src={currentLeague.logoUrl}
                                                    alt={currentLeague.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* League Navigation Pills */}
                    <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 md:px-8 py-4 backdrop-blur-sm bg-white/95">
                        <div className="flex items-center justify-between gap-2">
                            <button
                                onClick={() => handleNavigate("prev")}
                                disabled={currentLeagueIndex === 0}
                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                            >
                                <ChevronLeft className="h-5 w-5 text-slate-700" />
                            </button>

                            {/* League pills scroll container */}
                            <div className="flex-1 overflow-x-auto scrollbar-hide">
                                <div className="flex gap-2">
                                    {leagues.map((league, index) => (
                                        <button
                                            key={league.id}
                                            onClick={() => setCurrentLeagueIndex(index)}
                                            className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${index === currentLeagueIndex
                                                ? "bg-[var(--brand-red)] text-white shadow-lg scale-105"
                                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                }`}
                                        >
                                            {league.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => handleNavigate("next")}
                                disabled={currentLeagueIndex === leagueCount - 1}
                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                            >
                                <ChevronRight className="h-5 w-5 text-slate-700" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {/* Selected Teams Section */}
                        {selectedTeamsData.length > 0 && (
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg md:text-xl font-bold text-slate-900">Your Selection</h2>
                                        <p className="text-sm text-slate-500 mt-1">{selectedTeamsData.length} team{selectedTeamsData.length !== 1 ? "s" : ""} selected</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {selectedTeamsData.map((team) => (
                                        <div
                                            key={team.id}
                                            className="relative group inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-full pl-2 pr-3 py-2"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-blue-200 overflow-hidden flex-shrink-0">
                                                {team.logo || team.logoUrl ? (
                                                    <img
                                                        src={team.logo || team.logoUrl}
                                                        alt={team.name}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-xs font-bold text-blue-600">
                                                        {team.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")
                                                            .slice(0, 2)
                                                            .toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{team.name}</span>
                                            <button
                                                onClick={() => removeTeam(team.id)}
                                                className="ml-1 p-0.5 rounded-full bg-blue-200 hover:bg-blue-300 transition-colors"
                                            >
                                                <X className="h-3 w-3 text-blue-700" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Teams Grid Section */}
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Available Teams</h2>
                            <p className="text-sm text-slate-500 mb-4">Click to view team details, or use the heart to save</p>

                            {loading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="aspect-square rounded-xl bg-slate-200 animate-pulse" />
                                    ))}
                                </div>
                            ) : teams.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                                    {teams.map((team) => {
                                        const isSelected = selectedTeams.includes(team.id);
                                        return (
                                            <div
                                                key={team.id}
                                                className="group relative cursor-pointer"
                                            >
                                                <div
                                                    onClick={() => handleTeamClick(team.id)}
                                                    className="relative h-full rounded-xl overflow-hidden border-2 border-slate-200 bg-white transition-all duration-300 hover:border-[var(--brand-red)] hover:shadow-lg hover:scale-105"
                                                >
                                                    {/* Background with gradient overlay on hover */}
                                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/5 group-hover:to-slate-900/20 transition-all" />

                                                    {/* Team Logo Container */}
                                                    <div className="flex h-32 md:h-40 items-center justify-center bg-slate-50 p-3 overflow-hidden">
                                                        {team.logo || team.logoUrl ? (
                                                            <img
                                                                src={team.logo || team.logoUrl}
                                                                alt={team.name}
                                                                className="h-full w-full object-contain transition-transform group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center text-center">
                                                                <span className="text-2xl md:text-3xl font-black text-slate-400">
                                                                    {team.name
                                                                        .split(" ")
                                                                        .map((n) => n[0])
                                                                        .join("")
                                                                        .slice(0, 2)
                                                                        .toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Team Name */}
                                                    <div className="p-3 md:p-4">
                                                        <p className="text-xs md:text-sm font-bold text-slate-900 line-clamp-2 text-center group-hover:text-[var(--brand-red)] transition-colors">
                                                            {team.name}
                                                        </p>
                                                    </div>

                                                    {/* Save/Like Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleTeamSelection(team.id);
                                                        }}
                                                        className="absolute right-2 top-2 p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all hover:scale-110 z-10"
                                                    >
                                                        <Heart
                                                            className={`h-4 w-4 md:h-5 md:w-5 transition-all ${isSelected
                                                                ? "fill-[var(--brand-red)] text-[var(--brand-red)]"
                                                                : "text-slate-300 hover:text-[var(--brand-red)]"
                                                                }`}
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Zap className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No teams available for this league</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Action Bar - Sticky */}
                <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 md:px-8 py-4 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 rounded-lg bg-[var(--brand-red)] text-white font-medium hover:bg-[var(--brand-red-dark)] transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        <Heart className="h-4 w-4" />
                        {selectedTeamsData.length > 0
                            ? `Save ${selectedTeamsData.length} Team${selectedTeamsData.length !== 1 ? "s" : ""}`
                            : "Explore Teams"}
                    </button>
                </div>
            </div>
        </div>
    );
}
