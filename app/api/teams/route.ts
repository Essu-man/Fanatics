import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport");

    // Get custom teams from database
    let customTeams: any[] = [];
    try {
        const customTeamsRef = collection(db, "custom_teams");
        const snapshot = await getDocs(customTeamsRef);
        customTeams = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            league: doc.data().league,
            leagueId: doc.data().leagueId,
            logo: doc.data().logoUrl,
        }));
    } catch (error) {
        console.error("Error fetching custom teams:", error);
    }

    // If sport filter is provided, you can filter by league if needed
    // For now, return all custom teams regardless of sport
    return NextResponse.json({ teams: customTeams });
}

