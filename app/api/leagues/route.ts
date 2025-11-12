import { NextResponse } from "next/server";
import { footballTeams, basketballTeams } from "../../../lib/teams";

export async function GET() {
    // Get unique leagues from football teams
    const footballLeagues = Array.from(
        new Set(footballTeams.map((team) => team.league))
    ).map((league) => ({
        id: league.toLowerCase().replace(/\s+/g, "-"),
        name: league,
        sport: "football",
        teamCount: footballTeams.filter((t) => t.league === league).length,
    }));

    // Get unique leagues from basketball teams
    const basketballLeagues = Array.from(
        new Set(basketballTeams.map((team) => team.league))
    ).map((league) => ({
        id: league.toLowerCase().replace(/\s+/g, "-"),
        name: league,
        sport: "basketball",
        teamCount: basketballTeams.filter((t) => t.league === league).length,
    }));

    return NextResponse.json({
        leagues: [...footballLeagues, ...basketballLeagues],
    });
}

