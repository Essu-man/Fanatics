import { NextResponse } from "next/server";
import { getProducts, getProductsByTeam, createProduct } from "@/lib/firestore";
import { footballTeams, basketballTeams } from "@/lib/teams";

const allTeams = [...footballTeams, ...basketballTeams];

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
        const { name, price, stock, available = true, category, teamId, customTeam, description, images, colors } = body;

        if (!name || typeof price === "undefined" || !teamId || !images || images.length === 0) {
            return NextResponse.json(
                { success: false, error: "Name, price, team, and at least one image are required" },
                { status: 400 }
            );
        }

        let teamName: string;
        let league: string;
        let actualTeamId: string;

        // Handle custom team
        if (customTeam && customTeam.name && customTeam.league) {
            teamName = customTeam.name.trim();
            league = customTeam.league.trim();
            actualTeamId = teamId; // Already formatted as kebab-case from frontend
        } else {
            // Handle predefined team
            const team = allTeams.find((t) => t.id === teamId);
            if (!team) {
                return NextResponse.json(
                    { success: false, error: "Selected team is not recognized" },
                    { status: 400 }
                );
            }
            teamName = team.name;
            league = team.league;
            actualTeamId = team.id;
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


