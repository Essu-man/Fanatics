"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import SportsNav from "../components/SportsNav";
import Footer from "../components/Footer";
import { footballTeams, basketballTeams, internationalTeams, type Team } from "@/lib/teams";
import { ChevronRight } from "lucide-react";

export default function TeamsPage() {
    const [customTeams, setCustomTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

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

        fetchCustomTeams();
    }, []);

    const TeamSection = ({ title, teams, icon }: { title: string; teams: Team[]; icon?: string }) => (
        <div className="mb-12">
            <div className="mb-6 flex items-center gap-3">
                <h2 className="text-2xl font-bold text-zinc-900">{title}</h2>
                <span className="text-3xl">{icon}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {teams.map((team) => (
                    <Link
                        key={team.id}
                        href={`/teams/${team.id}`}
                        className="group flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:border-[var(--brand-red)] hover:shadow-lg hover:scale-105"
                    >
                        {team.logo && (
                            <img
                                src={team.logo}
                                alt={team.name}
                                className="h-12 w-12 object-contain"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                }}
                            />
                        )}
                        <div className="text-center">
                            <p className="text-sm font-semibold text-zinc-900 line-clamp-2">{team.name}</p>
                            <p className="text-xs text-zinc-500">{team.league}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-400 transition-all group-hover:text-[var(--brand-red)] group-hover:translate-x-1" />
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
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-zinc-900 mb-3">Browse All Teams</h1>
                    <p className="text-lg text-zinc-600 max-w-2xl">
                        Explore our complete collection of team gear. From international national teams to club-level jerseys,
                        find authentic apparel to support your favorite team.
                    </p>
                </div>

                {/* Football Teams */}
                <TeamSection title="Football Clubs" teams={footballTeams} icon="⚽" />

                {/* International Teams */}
                <TeamSection title="International Teams" teams={internationalTeams} icon="🌍" />

                {/* Basketball Teams */}
                <TeamSection title="Basketball Teams" teams={basketballTeams} icon="🏀" />

                {/* Custom Teams */}
                {!loading && customTeams.length > 0 && (
                    <TeamSection title="Custom Teams" teams={customTeams} icon="✨" />
                )}

                {/* Call to Action */}
                <div className="mt-16 rounded-xl bg-gradient-to-r from-[var(--brand-red)] to-red-700 p-8 text-center md:p-12">
                    <h3 className="text-2xl font-bold text-white mb-3">Can't find your team?</h3>
                    <p className="text-white/90 mb-6 max-w-xl mx-auto">
                        Create a custom team and start building your unique collection. Our admins will review and approve your team.
                    </p>
                    <Link
                        href="/admin/teams"
                        className="inline-block bg-white text-[var(--brand-red)] px-8 py-3 font-bold rounded-lg hover:bg-zinc-100 transition-colors"
                    >
                        Create Custom Team
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    );
}
