import { NextResponse } from "next/server";
import { enablePremierLeagueTeams } from "@/lib/enable-premier-league";

export async function POST() {
    try {
        const result = await enablePremierLeagueTeams();
        return NextResponse.json({
            success: true,
            message: `Enabled ${result.updated} Premier League teams`,
            result,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to enable Premier League teams",
            },
            { status: 500 }
        );
    }
}
