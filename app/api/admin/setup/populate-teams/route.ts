import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, setDoc, doc, getDocs } from "firebase/firestore";
import { footballTeams, basketballTeams, internationalTeams } from "@/lib/teams";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const teamsRef = collection(db, "teams");

        // Check if teams already exist
        const existingTeams = await getDocs(teamsRef);
        if (existingTeams.size > 0) {
            return NextResponse.json({
                success: false,
                message: `Teams collection already has ${existingTeams.size} documents. Skipping population.`
            });
        }

        let addedCount = 0;

        // Add football teams
        for (const team of footballTeams) {
            await setDoc(doc(teamsRef, team.id), {
                id: team.id,
                name: team.name,
                league: team.league,
                country: team.country,
                logo: team.logo,
                sport: "football",
                enabled: false,
                isHardcoded: true,
                createdAt: new Date(),
            });
            addedCount++;
        }

        // Add basketball teams
        for (const team of basketballTeams) {
            await setDoc(doc(teamsRef, team.id), {
                id: team.id,
                name: team.name,
                league: team.league,
                logo: team.logo,
                sport: "basketball",
                enabled: false,
                isHardcoded: true,
                createdAt: new Date(),
            });
            addedCount++;
        }

        // Add international teams
        for (const team of internationalTeams) {
            await setDoc(doc(teamsRef, team.id), {
                id: team.id,
                name: team.name,
                league: team.league,
                country: team.country,
                logo: team.logo,
                sport: "football",
                enabled: false,
                isHardcoded: true,
                createdAt: new Date(),
            });
            addedCount++;
        }

        return NextResponse.json({
            success: true,
            message: `✅ Successfully populated ${addedCount} hardcoded teams!`
        });
    } catch (error: any) {
        console.error("❌ Error populating teams:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to populate teams" },
            { status: 500 }
        );
    }
}
