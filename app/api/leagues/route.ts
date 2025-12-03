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
            sport: doc.data().sport || "custom",
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

    return NextResponse.json({
        leagues: customLeaguesFromDb,
    });
}

