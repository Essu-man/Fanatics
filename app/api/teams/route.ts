import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport");
    const showAll = searchParams.get("showAll") === "true";

    let teams: any[] = [];

    try {
        // Get all teams from the "teams" collection (both hardcoded and custom)
        const teamsRef = collection(db, "teams");
        let teamsQuery;

        if (showAll) {
            // Return all teams regardless of enabled status (DEBUG MODE)
            teamsQuery = sport
                ? query(teamsRef, where("sport", "==", sport))
                : teamsRef;
            console.log(`[/api/teams] DEBUG: ShowAll=true, sport=${sport}`);
        } else if (sport) {
            // Filter by sport and enabled status
            teamsQuery = query(
                teamsRef,
                where("sport", "==", sport),
                where("enabled", "==", true)
            );
            console.log(`[/api/teams] Filtering: sport=${sport}, enabled=true`);
        } else {
            // Only get enabled teams
            teamsQuery = query(teamsRef, where("enabled", "==", true));
            console.log(`[/api/teams] Filtering: enabled=true (no sport filter)`);
        }

        const snapshot = await getDocs(teamsQuery);

        teams = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: data.id,
                name: data.name,
                league: data.league,
                logo: data.logo || data.logoUrl,
                sport: data.sport,
                isHardcoded: data.isHardcoded || false,
                enabled: data.enabled,
            };
        });

        console.log(`[/api/teams] Query completed: ${teams.length} teams found`);
        if (teams.length > 0) {
            console.log(
                `[/api/teams] Sample teams:`,
                teams.slice(0, 3).map((t) => ({ id: t.id, name: t.name, enabled: t.enabled }))
            );
        }
    } catch (error) {
        console.error("Error fetching teams:", error);
        return NextResponse.json(
            { error: "Failed to fetch teams" },
            { status: 500 }
        );
    }

    return NextResponse.json({ teams });
}

