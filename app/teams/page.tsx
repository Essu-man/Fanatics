"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import SportsNav from "../components/SportsNav";
import Footer from "../components/Footer";
import { footballTeams, basketballTeams, internationalTeams, type Team } from "@/lib/teams";
import { ChevronRight, Store, Shirt } from "lucide-react";
import HomeProductSections from "../components/HomeProductSections";
import NewArrivals from "../components/NewArrivals";
import LeagueTeamsModal from "../components/LeagueTeamsModal";

function TeamsPageContent() {
    const searchParams = useSearchParams();
    const selectedLeagueParam = searchParams.get("league");

    const [customTeams, setCustomTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [leagues, setLeagues] = useState<any[]>([]);
    const [loadingLeagues, setLoadingLeagues] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);

    useEffect(() => {
        // Fetch custom teams from API
        const fetchCustomTeams = async () => {
            try {
                const response = await fetch("/api/admin/teams");
                const data = await response.json();
                if (data.success && data.teams) {
                    setCustomTeams(data.teams);
                }
            } catch (error) {
                console.error("Error fetching custom teams:", error);
            } finally {
                setLoading(false);
            }
        };

        // Fetch leagues from API
        const fetchLeagues = async () => {
            try {
                const response = await fetch("/api/leagues");
                const data = await response.json();
                if (data.leagues) {
                    setLeagues(data.leagues);
                }
            } catch (error) {
                console.error("Error fetching leagues:", error);
            } finally {
                setLoadingLeagues(false);
            }
        };

        fetchCustomTeams();
        fetchLeagues();
    }, []);

    // Open modal if league is in URL
    useEffect(() => {
        if (selectedLeagueParam && leagues.length > 0) {
            const league = leagues.find(l => 
                (l.slug || l.name).toLowerCase().replace(/\s+/g, "-") === selectedLeagueParam.toLowerCase()
            );
            if (league) {
                setSelectedLeagueId(league.id);
                setIsModalOpen(true);
            }
        }
    }, [selectedLeagueParam, leagues]);

    const handleLeagueClick = (leagueId: string) => {
        setSelectedLeagueId(leagueId);
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

    const TeamSection = ({ title, teams, icon }: { title: string; teams: Team[]; icon?: string }) => (
        <div className="mb-16">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-zinc-900">{title}</h2>
                    <span className="text-2xl">{icon}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {teams.map((team) => (
                    <Link
                        key={team.id}
                        href={`/teams/${team.id}`}
                        className="group flex flex-col items-center gap-4 rounded-[2rem] border border-zinc-100 bg-white p-6 transition-all hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-zinc-50 flex items-center justify-center p-3 group-hover:bg-emerald-50 transition-colors">
                            {team.logo ? (
                                <img
                                    src={team.logo}
                                    alt={team.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = "none";
                                    }}
                                />
                            ) : (
                                <Shirt className="h-8 w-8 text-zinc-300" />
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{team.name}</p>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">{team.league}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );


    return (
        <div className="min-h-screen bg-white text-zinc-900">
            <Header />
            <SportsNav />

            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Store Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 pb-12">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-4 uppercase tracking-widest">
                            <Store className="h-4 w-4" /> Official Store
                        </div>
                        <h1 className="text-5xl font-black text-zinc-900 mb-4 tracking-tight">Cediman Jersey Store</h1>
                        <p className="text-xl text-zinc-600 max-w-2xl font-medium leading-relaxed">
                            The ultimate destination for authentic fan gear. Shop official jerseys, 
                            training kits, and retro classics.
                        </p>
                    </div>
                </div>

                {/* Shop Your Teams Section */}
                <div className="mb-16 border-b border-zinc-100 pb-10">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Shop Your Teams</h2>
                        <Link 
                            href="/teams" 
                            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                            See All
                        </Link>
                    </div>

                    <div className="flex items-center gap-5 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 snap-x">
                        {leagues.map((league) => (
                            <button
                                key={league.id || league.name}
                                onClick={() => handleLeagueClick(league.id)}
                                className="group flex flex-col items-center gap-3 snap-start flex-shrink-0"
                            >
                                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center p-2 group-hover:border-zinc-400 group-hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                    {league.logoUrl ? (
                                        <img 
                                            src={league.logoUrl} 
                                            alt={league.name}
                                            className="h-[85%] w-[85%] object-contain transition-transform group-hover:scale-110"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = "none";
                                                const parent = target.parentElement;
                                                if (parent && !parent.querySelector('.fallback-initials')) {
                                                    const fallback = document.createElement('span');
                                                    fallback.className = 'fallback-initials text-lg font-black text-zinc-200';
                                                    fallback.textContent = getLeagueInitials(league.name);
                                                    parent.appendChild(fallback);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <span className="text-lg font-black text-zinc-200">
                                            {getLeagueInitials(league.name)}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors text-center max-w-[80px] leading-tight">
                                    {league.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-24 mb-24">
                    <HomeProductSections />
                    <NewArrivals />
                </div>

            </div>

            <LeagueTeamsModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedLeagueId={selectedLeagueId}
            />

            <Footer />
        </div>
    );
}

export default function TeamsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TeamsPageContent />
        </Suspense>
    );
}
