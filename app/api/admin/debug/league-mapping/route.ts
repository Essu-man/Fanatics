import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
    try {
        // Get custom leagues
        const customLeaguesRef = collection(db, "custom_leagues");
        const leaguesSnap = await getDocs(customLeaguesRef);
        const customLeagues = leaguesSnap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                sport: data.sport,
                logoUrl: data.logoUrl,
            };
        });

        // Get football teams (hardcoded)
        const teamsRef = collection(db, "teams");
        const teamsSnap = await getDocs(teamsRef);
        const allTeams = teamsSnap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                league: data.league,
                sport: data.sport,
                enabled: data.enabled,
            };
        });

        // Group teams by league
        const teamsByLeague: Record<string, any[]> = {};
        allTeams.forEach((team) => {
            if (!teamsByLeague[team.league]) {
                teamsByLeague[team.league] = [];
            }
            teamsByLeague[team.league].push(team);
        });

        // Get custom teams
        const customTeamsRef = collection(db, "custom_teams");
        const customTeamsSnap = await getDocs(customTeamsRef);
        const customTeams = customTeamsSnap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                league: data.league,
                leagueId: data.leagueId,
                sport: data.sport,
                enabled: data.enabled,
            };
        });

        // Group custom teams by leagueId
        const customTeamsByLeagueId: Record<string, any[]> = {};
        customTeams.forEach((team) => {
            if (!customTeamsByLeagueId[team.leagueId]) {
                customTeamsByLeagueId[team.leagueId] = [];
            }
            customTeamsByLeagueId[team.leagueId].push(team);
        });

        return NextResponse.json({
            customLeagues: customLeagues.map((league) => ({
                ...league,
                teamCount: customTeamsByLeagueId[league.id]?.length || 0,
            })),
            hardcodedTeamsByLeague: Object.entries(teamsByLeague).map(([league, teams]) => ({
                league,
                teamCount: teams.length,
                enabledCount: teams.filter((t) => t.enabled).length,
                teams: teams.map((t) => ({ id: t.id, name: t.name, enabled: t.enabled })),
            })),
            customTeamsByLeagueId,
            summary: {
                totalCustomLeagues: customLeagues.length,
                totalHardcodedTeams: allTeams.length,
                totalCustomTeams: customTeams.length,
                leaguesWithPremier: customLeagues.filter((l) =>
                    l.name.toLowerCase().includes("premier")
                ),
                hardcodedPremierTeams: teamsByLeague["Premier League"] || [],
            },
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
