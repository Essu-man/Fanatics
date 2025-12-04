import { NextResponse } from "next/server";
import {
    collection,
    getDocs,
    addDoc,
    Timestamp,
    orderBy,
    query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadImage } from "@/lib/supabase-storage";
import { footballTeams, basketballTeams } from "@/lib/teams";

export const runtime = "nodejs";

// GET all teams (hardcoded + custom)
export async function GET() {
    try {
        let teams: any[] = [];

        // Get hardcoded teams from "teams" collection
        try {
            const teamsSnapshot = await getDocs(collection(db, "teams"));
            teamsSnapshot.docs.forEach((doc) => {
                const data = doc.data();
                teams.push({
                    id: data.id,
                    name: data.name,
                    league: data.league,
                    sport: data.sport,
                    logo: data.logo,
                    logoUrl: data.logo,
                    enabled: data.enabled || false,
                    isHardcoded: true,
                    createdAt: data.createdAt?.toDate() || new Date(),
                });
            });
        } catch (error) {
            console.error("Error fetching hardcoded teams:", error);
        }

        // Get custom teams
        try {
            const q = query(collection(db, "custom_teams"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            querySnapshot.docs.forEach((doc) => {
                const data = doc.data();
                teams.push({
                    id: doc.id,
                    name: data.name,
                    league: data.league,
                    leagueId: data.leagueId,
                    logoUrl: data.logoUrl,
                    sport: data.sport || "football",
                    enabled: data.enabled !== false, // Custom teams enabled by default
                    isHardcoded: false,
                    createdAt: data.createdAt?.toDate() || new Date(),
                });
            });
        } catch (error) {
            console.error("Error fetching custom teams:", error);
        }

        // Sort: enabled first, then by name
        teams.sort((a, b) => {
            if (a.enabled === b.enabled) {
                return a.name.localeCompare(b.name);
            }
            return a.enabled ? -1 : 1;
        });

        // Remove duplicates by ID (keep first occurrence)
        const seenIds = new Set<string>();
        const uniqueTeams = teams.filter((team) => {
            if (seenIds.has(team.id)) {
                return false;
            }
            seenIds.add(team.id);
            return true;
        });

        return NextResponse.json({ success: true, teams: uniqueTeams });
    } catch (error: any) {
        console.error("Failed to fetch teams:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to load teams" },
            { status: 500 }
        );
    }
}

// POST - Create a new custom team
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const league = formData.get("league") as string;
        const leagueId = formData.get("leagueId") as string;
        const logoFile = formData.get("logo") as File | null;

        if (!name || !league) {
            return NextResponse.json(
                { success: false, error: "Team name and league are required" },
                { status: 400 }
            );
        }

        let logoUrl = "";

        // Upload logo if provided
        if (logoFile && logoFile.size > 0) {
            const fileName = `team-logos/${Date.now()}-${logoFile.name}`;
            const result = await uploadImage(logoFile, fileName);

            if (!result.success || !result.url) {
                return NextResponse.json(
                    { success: false, error: result.error || 'Failed to upload logo' },
                    { status: 500 }
                );
            }

            logoUrl = result.url;
        }

        const teamData = {
            name: name.trim(),
            league: league.trim(),
            leagueId: leagueId || "",
            logoUrl,
            enabled: true, // New custom teams are enabled by default
            isHardcoded: false,
            createdAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, "custom_teams"), teamData);

        return NextResponse.json({
            success: true,
            team: {
                id: docRef.id,
                ...teamData,
            },
        });
    } catch (error: any) {
        console.error("Failed to create custom team:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to create team" },
            { status: 500 }
        );
    }
}
