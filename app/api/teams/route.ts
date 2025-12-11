import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport");
    const showAll = searchParams.get("showAll") === "true";

    let teams: any[] = [];

    try {
        // Get hardcoded teams from the "teams" collection
        const teamsRef = collection(db, "teams");
        let teamsQuery;

        if (showAll) {
            teamsQuery = sport
                ? query(teamsRef, where("sport", "==", sport))
                : teamsRef;
            console.log(`[/api/teams] DEBUG: ShowAll=true, sport=${sport}`);
        } else if (sport) {
            teamsQuery = query(
                teamsRef,
                where("sport", "==", sport),
                where("enabled", "==", true)
            );
            console.log(`[/api/teams] Filtering: sport=${sport}, enabled=true`);
        } else {
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
                isHardcoded: true,
                enabled: data.enabled,
            };
        });

        // Get custom teams from "custom_teams" collection
        try {
            const customTeamsRef = collection(db, "custom_teams");
            let customTeamsQuery;

            if (showAll) {
                customTeamsQuery = sport
                    ? query(customTeamsRef, where("sport", "==", sport))
                    : customTeamsRef;
            } else if (sport) {
                customTeamsQuery = query(
                    customTeamsRef,
                    where("sport", "==", sport),
                    where("enabled", "==", true)
                );
            } else {
                customTeamsQuery = query(customTeamsRef, where("enabled", "==", true));
            }

            const customSnapshot = await getDocs(customTeamsQuery);

            const customTeams = customSnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    league: data.league,
                    leagueId: data.leagueId,
                    logo: data.logoUrl,
                    sport: data.sport || "football",
                    isHardcoded: false,
                    enabled: data.enabled !== false,
                };
            });

            teams = [...teams, ...customTeams];
        } catch (error) {
            console.error("Error fetching custom teams:", error);
        }

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

