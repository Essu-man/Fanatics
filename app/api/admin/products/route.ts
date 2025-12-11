import { NextResponse } from "next/server";
import { getProducts, getProductsByTeam, createProduct } from "@/lib/firestore";
import { footballTeams, basketballTeams, internationalTeams } from "@/lib/teams";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const allTeams = [...footballTeams, ...basketballTeams, ...internationalTeams];

export const runtime = "nodejs";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const teamId = searchParams.get("teamId");

        const products = teamId ? await getProductsByTeam(teamId) : await getProducts();

        return NextResponse.json({
            success: true,
            products,
        });
    } catch (error: any) {
        console.error("Failed to fetch admin products:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to load products" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, price, stock, available = true, category, teamId, description, images, colors } = body;

        if (!name || typeof price === "undefined" || !teamId || !images || images.length === 0) {
            return NextResponse.json(
                { success: false, error: "Name, price, team, and at least one image are required" },
                { status: 400 }
            );
        }

        let teamName: string;
        let league: string;
        let actualTeamId: string;
        let isHardcodedTeam = false;

        console.log(`[Product Creation] Received teamId: ${teamId}`);
        console.log(`[Product Creation] Total hardcoded teams available: ${allTeams.length}`);

        let team = allTeams.find((t) => t.id === teamId);

        if (team) {
            teamName = team.name;
            league = team.league;
            actualTeamId = team.id;
            isHardcodedTeam = true;
            console.log(`[Product Creation] ✅ Found hardcoded team: ${team.name} (${team.id})`);
        } else {
            console.log(`[Product Creation] Team not in hardcoded list, checking custom_teams collection...`);
            // Try to find in custom teams (Firestore)
            let customTeamSnap = await getDoc(doc(db, "custom_teams", teamId));

            if (!customTeamSnap.exists()) {
                console.error(`[Product Creation] ❌ Team ${teamId} not found in hardcoded or custom teams`);
                return NextResponse.json(
                    { success: false, error: "Selected team is not recognized" },
                    { status: 400 }
                );
            }

            const customTeam = customTeamSnap.data();
            teamName = customTeam.name;
            league = customTeam.league;
            actualTeamId = customTeamSnap.id;
            console.log(`[Product Creation] ✅ Found custom team: ${customTeam.name} (${actualTeamId})`);
        }

        // Enable the team when product is created for it
        try {
            if (isHardcodedTeam) {
                // Enable hardcoded team in "teams" collection
                const teamRef = doc(db, "teams", actualTeamId);
                const teamSnap = await getDoc(teamRef);
                if (teamSnap.exists()) {
                    const currentData = teamSnap.data();
                    console.log(`[Enable Team] Hardcoded team ${actualTeamId} found. Current enabled: ${currentData.enabled}`);
                    if (!currentData.enabled) {
                        await updateDoc(teamRef, { enabled: true });
                        console.log(`[Enable Team] ✅ Enabled hardcoded team: ${actualTeamId}`);
                    } else {
                        console.log(`[Enable Team] Team already enabled: ${actualTeamId}`);
                    }
                } else {
                    console.error(`[Enable Team] ❌ Hardcoded team ${actualTeamId} NOT found in teams collection!`);
                }
            } else {
                // Enable custom team in "custom_teams" collection
                const teamRef = doc(db, "custom_teams", actualTeamId);
                const teamSnap = await getDoc(teamRef);
                if (teamSnap.exists()) {
                    const currentData = teamSnap.data();
                    console.log(`[Enable Team] Custom team ${actualTeamId} found. Current enabled: ${currentData.enabled}`);
                    if (currentData.enabled === false) {
                        await updateDoc(teamRef, { enabled: true });
                        console.log(`[Enable Team] ✅ Enabled custom team: ${actualTeamId}`);
                    } else {
                        console.log(`[Enable Team] Team already enabled: ${actualTeamId}`);
                    }
                } else {
                    console.error(`[Enable Team] ❌ Custom team ${actualTeamId} NOT found in custom_teams collection!`);
                }
            }
        } catch (error) {
            console.error("[Enable Team] Error enabling team:", error);
        }

        const payload = {
            name: name.trim(),
            price: Number(price),
            stock: Number(stock ?? 0),
            available: Boolean(available),
            category: category || "Jersey",
            team: teamName,
            teamId: actualTeamId,
            league: league,
            description: description?.trim() || `${teamName} official merchandise`,
            images,
            colors: Array.isArray(colors) && colors.length > 0 ? colors : undefined,
        };

        const result = await createProduct(payload);
        if (!result.success) {
            throw new Error(result.error || "Failed to create product");
        }

        console.log(`[Product Creation] ✅ Successfully created product: ${result.id} for team: ${actualTeamId} (${teamName})`);

        return NextResponse.json({
            success: true,
            productId: result.id,
        });
    } catch (error: any) {
        console.error("Failed to create product:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to create product" },
            { status: 500 }
        );
    }
}


