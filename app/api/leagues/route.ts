import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
    // Get custom leagues from custom_leagues collection
    let customLeaguesFromDb: any[] = [];
    try {
        const customLeaguesRef = collection(db, "custom_leagues");
        const snapshot = await getDocs(customLeaguesRef);
        customLeaguesFromDb = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            sport: doc.data().sport || "football",
            logoUrl: doc.data().logoUrl,
            teamCount: 0, // Will be updated below
        }));
    } catch (error) {
        console.error("Error fetching custom leagues from db:", error);
    }

    // Get custom teams to update league team counts
    try {
        const customTeamsRef = collection(db, "custom_teams");
        const snapshot = await getDocs(customTeamsRef);
        const customTeams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Update team counts for custom leagues
        customLeaguesFromDb.forEach(league => {
            league.teamCount = customTeams.filter((t: any) => t.leagueId === league.id).length;
        });
    } catch (error) {
        console.error("Error fetching custom teams:", error);
    }

    // Define desired order
    const leagueOrder = [
        "English Premier League",
        "Spain la liga",
        "German bundesliga",
        "Ghana premier league",
        "International",
        "Seria A",
        "French ligue 1",
        "Eredivisie",
        "Others"
    ];

    // Sort leagues by defined order
    const sortedLeagues = customLeaguesFromDb.sort((a, b) => {
        const indexA = leagueOrder.findIndex(name =>
            a.name.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(a.name.toLowerCase())
        );
        const indexB = leagueOrder.findIndex(name =>
            b.name.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(b.name.toLowerCase())
        );

        // If both found in order list, sort by order
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        // If only A found, it comes first
        if (indexA !== -1) return -1;
        // If only B found, it comes first
        if (indexB !== -1) return 1;
        // If neither found, maintain original order
        return 0;
    });

    return NextResponse.json({
        leagues: sortedLeagues,
    });
}

