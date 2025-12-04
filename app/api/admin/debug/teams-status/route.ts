import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export const runtime = "nodejs";

export async function GET() {
    try {
        // Get man-city and man-utd from teams collection
        const teamsRef = collection(db, "teams");
        const snapshot = await getDocs(teamsRef);

        const teamStats = {
            totalTeamsInCollection: snapshot.size,
            manCityStatus: null as any,
            manUtdStatus: null as any,
            allTeams: []
        };

        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const teamInfo = {
                id: data.id,
                name: data.name,
                enabled: data.enabled,
                sport: data.sport
            };

            if (data.id === "man-city") {
                teamStats.manCityStatus = teamInfo;
            }
            if (data.id === "man-utd") {
                teamStats.manUtdStatus = teamInfo;
            }
        });

        // Get all products to see what teams they belong to
        const productsRef = collection(db, "products");
        const productsSnapshot = await getDocs(productsRef);

        const productsByTeam: any = {};
        productsSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (!productsByTeam[data.teamId]) {
                productsByTeam[data.teamId] = [];
            }
            productsByTeam[data.teamId].push({
                name: data.name,
                teamId: data.teamId,
                team: data.team
            });
        });

        return NextResponse.json({
            success: true,
            teamStats,
            productsByTeam
        });
    } catch (error: any) {
        console.error("Debug error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
