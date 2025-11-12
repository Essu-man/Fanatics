"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TeamSelectionModal from "./TeamSelectionModal";
import {
    PremierLeagueLogo,
    Ligue1Logo,
    LaLigaLogo,
    UEFALogo,
    NFLLogo,
    NBALogo,
    EuroLeagueLogo,
    WNBALogo,
    SerieALogo,
    BundesligaLogo,
    EredivisieLogo,
    PrimeiraLigaLogo,
    ScottishPremiershipLogo,
    SuperLigLogo,
} from "./LeagueLogos";

interface League {
    id: string;
    name: string;
    sport: string;
    teamCount: number;
}

// Map league names to their logo components
const getLeagueLogo = (leagueName: string) => {
    const logoMap: Record<string, () => JSX.Element> = {
        "Premier League": PremierLeagueLogo,
        "Ligue 1": Ligue1Logo,
        "La Liga": LaLigaLogo,
        "Serie A": SerieALogo,
        "Bundesliga": BundesligaLogo,
        "Eredivisie": EredivisieLogo,
        "Primeira Liga": PrimeiraLigaLogo,
        "Scottish Premiership": ScottishPremiershipLogo,
        "Süper Lig": SuperLigLogo,
        "UEFA": UEFALogo,
        "NFL": NFLLogo,
        "NBA": NBALogo,
        "EuroLeague": EuroLeagueLogo,
        "WNBA": WNBALogo,
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
        const LogoComponent = getLeagueLogo(league.name);
        if (LogoComponent) {
            return <LogoComponent />;
        }
        // Fallback to initials if no logo found
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
                        <div className="flex gap-4 pb-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex min-w-[80px] flex-col items-center gap-2">
                                    <div className="h-14 w-14 animate-pulse rounded-full bg-zinc-200" />
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
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-zinc-200 bg-white shadow-sm hover:border-[var(--brand-red)] transition-colors overflow-hidden">
                                        {renderLeagueLogo(league)}
                                    </div>
                                    <span className="text-xs font-medium text-zinc-700 text-center">{league.name}</span>
                                    <span className="text-[10px] text-zinc-500">{league.teamCount} teams</span>
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

