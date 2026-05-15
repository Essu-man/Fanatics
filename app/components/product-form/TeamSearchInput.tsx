"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import type { Team } from "@/lib/teams";

export interface TeamSearchInputProps {
    teams: Array<{ label: string; teams: Team[] }>;
    value: string;
    onChange: (value: string) => void;
}

export default function TeamSearchInput({ teams, value, onChange }: TeamSearchInputProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const allTeamsFlat = teams.flatMap((group) =>
        group.teams.map((team) => ({ ...team, groupLabel: group.label }))
    );

    const filteredTeams =
        searchQuery.trim() === ""
            ? allTeamsFlat
            : allTeamsFlat.filter(
                  (team) =>
                      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      team.league.toLowerCase().includes(searchQuery.toLowerCase())
              );

    const selectedTeam = allTeamsFlat.find((t) => t.id === value);

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchQuery || selectedTeam?.name || ""}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full pl-10 pr-9 py-2 rounded-lg border border-zinc-200 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => {
                            onChange("");
                            setSearchQuery("");
                            setIsOpen(false);
                        }}
                        className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg">
                    {filteredTeams.length === 0 ? (
                        <div className="px-3 py-6 text-center text-sm text-zinc-500">No teams found</div>
                    ) : (
                        filteredTeams.map((team) => (
                            <button
                                key={`${team.groupLabel}-${team.id}`}
                                type="button"
                                onClick={() => {
                                    onChange(team.id);
                                    setSearchQuery("");
                                    setIsOpen(false);
                                }}
                                className="flex w-full items-center justify-between border-b border-zinc-100 px-3 py-2 text-left last:border-b-0 hover:bg-zinc-50"
                            >
                                <div>
                                    <div className="text-sm font-medium text-zinc-900">{team.name}</div>
                                    <div className="text-xs text-zinc-500">{team.league}</div>
                                </div>
                                <div className="text-xs text-zinc-400">{team.groupLabel}</div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
