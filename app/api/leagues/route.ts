import { NextResponse } from "next/server";
import { footballTeams, basketballTeams } from "../../../lib/teams";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

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

    // Get custom leagues from custom_leagues collection
    let customLeaguesFromDb: any[] = [];
    try {
        const customLeaguesRef = collection(db, "custom_leagues");
        const snapshot = await getDocs(customLeaguesRef);
        customLeaguesFromDb = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            sport: doc.data().sport || "custom",
            logoUrl: doc.data().logoUrl,
            teamCount: 0, // Will be updated below
        }));
    } catch (error) {
        console.error("Error fetching custom leagues from db:", error);
    }

    // Get custom leagues from custom teams (for backwards compatibility)
    let customLeaguesFromTeams: any[] = [];
    try {
        const customTeamsRef = collection(db, "custom_teams");
        const snapshot = await getDocs(customTeamsRef);
        const customTeams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Update team counts for custom leagues
        customLeaguesFromDb.forEach(league => {
            league.teamCount = customTeams.filter((t: any) => t.leagueId === league.id).length;
        });

        // Get unique leagues from custom teams that don't have a leagueId (legacy teams)
        const uniqueCustomLeagues = Array.from(
            new Set(customTeams
                .filter((team: any) => !team.leagueId && team.league)
                .map((team: any) => team.league))
        ).filter(league => league); // Filter out empty/null values

        customLeaguesFromTeams = uniqueCustomLeagues.map((league) => ({
            id: (league as string).toLowerCase().replace(/\s+/g, "-") + "-legacy",
            name: league,
            sport: "custom",
            teamCount: customTeams.filter((t: any) => !t.leagueId && t.league === league).length,
        }));
    } catch (error) {
        console.error("Error fetching custom teams:", error);
    }

    return NextResponse.json({
        leagues: [...footballLeagues, ...basketballLeagues, ...customLeaguesFromDb, ...customLeaguesFromTeams],
    });
}

