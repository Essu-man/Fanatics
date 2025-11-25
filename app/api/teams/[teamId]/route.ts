import { NextResponse } from "next/server";
import { footballTeams, basketballTeams } from "../../../../lib/teams";
import { generateTeamProducts } from "../../../../lib/teamProducts";
import { getProductsByTeam } from "@/lib/firestore";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ teamId: string }> | { teamId: string } }
) {
    const { teamId } = await Promise.resolve(params);

    // Find team in football or basketball teams
    const allTeams = [...footballTeams, ...basketballTeams];
    const team = allTeams.find((t) => t.id === teamId);

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
    }));

    // Generate default fallback products
    const generatedProducts = generateTeamProducts(team.id, team.name, team.league);
    const products = [...formattedCustom, ...generatedProducts];

    return NextResponse.json({
        team,
        products,
    });
}

