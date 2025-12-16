import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";

export async function GET() {
    try {
        // Get all football teams
        const teamsRef = collection(db, "teams");
        const footballQuery = query(teamsRef, where("sport", "==", "football"));
        const footballSnap = await getDocs(footballQuery);

        const allTeams = footballSnap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                league: data.league,
                enabled: data.enabled,
                sport: data.sport,
            };
        });

        // Group by league
        const byLeague: Record<string, any[]> = {};
        allTeams.forEach((team) => {
            if (!byLeague[team.league]) {
                byLeague[team.league] = [];
            }
            byLeague[team.league].push(team);
        });

        return NextResponse.json({
            allTeams,
            byLeague,
            summary: Object.entries(byLeague).map(([league, teams]) => ({
                league,
                count: teams.length,
                enabled: teams.filter((t) => t.enabled).length,
                disabled: teams.filter((t) => !t.enabled).length,
            })),
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { league, action } = body;

        if (!league || !action) {
            return NextResponse.json(
                { error: "Missing league or action parameter" },
                { status: 400 }
            );
        }

        if (action !== "enable" && action !== "disable") {
            return NextResponse.json(
                { error: "Action must be 'enable' or 'disable'" },
                { status: 400 }
            );
        }

        // Get all teams for the league
        const teamsRef = collection(db, "teams");
        const leagueQuery = query(teamsRef, where("league", "==", league));
        const snapshot = await getDocs(leagueQuery);

        let updated = 0;
        for (const docSnapshot of snapshot.docs) {
            await updateDoc(doc(db, "teams", docSnapshot.id), {
                enabled: action === "enable",
            });
            updated++;
        }

        return NextResponse.json({
            success: true,
            message: `${action === "enable" ? "Enabled" : "Disabled"} ${updated} teams for league "${league}"`,
            updated,
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
