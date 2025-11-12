import { NextResponse } from "next/server";
import { footballTeams, basketballTeams } from "../../../../lib/teams";
import { generateTeamProducts } from "../../../../lib/teamProducts";

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

    // Generate products for the team
    const products = generateTeamProducts(team.id, team.name, team.league);

    return NextResponse.json({
        team,
        products,
    });
}

