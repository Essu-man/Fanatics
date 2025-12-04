import { NextResponse } from "next/server";
import { footballTeams, basketballTeams } from "../../../../lib/teams";
import { generateTeamProducts } from "../../../../lib/teamProducts";
import { getProductsByTeam } from "@/lib/firestore";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ teamId: string }> | { teamId: string } }
) {
    const { teamId } = await Promise.resolve(params);

    // Find team in football or basketball teams
    const allTeams = [...footballTeams, ...basketballTeams];
    let team = allTeams.find((t) => t.id === teamId);

    // If not found in hardcoded teams, check custom teams
    if (!team) {
        try {
            const teamDoc = await getDoc(doc(db, "custom_teams", teamId));
            if (teamDoc.exists()) {
                const teamData = teamDoc.data();
                team = {
                    id: teamDoc.id,
                    name: teamData.name,
                    league: teamData.league,
                    logo: teamData.logoUrl,
                };
            }
        } catch (error) {
            console.error("Error fetching custom team:", error);
        }
    }

    if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const customProducts = await getProductsByTeam(teamId);
    const formattedCustom = customProducts.map((product) => ({
        id: product.id,
        name: product.name,
        team: product.team || team.name,
        price: product.price,
        images: product.images || [],
        colors: product.colors,
        stock: product.stock,
        available: product.available,
    }));

    // Only use fallback products if no custom products exist
    let products: any[] = formattedCustom;
    if (formattedCustom.length === 0) {
        const generatedProducts = generateTeamProducts(team.id, team.name, team.league);
        products = generatedProducts;
    }

    return NextResponse.json({
        team,
        products,
    });
}

