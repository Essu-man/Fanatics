import { NextResponse } from "next/server";
import { footballTeams, basketballTeams } from "../../../lib/teams";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport");

    if (sport === "football") {
        return NextResponse.json({ teams: footballTeams });
    } else if (sport === "basketball") {
        return NextResponse.json({ teams: basketballTeams });
    } else {
        return NextResponse.json({ 
            football: footballTeams,
            basketball: basketballTeams 
        });
    }
}

