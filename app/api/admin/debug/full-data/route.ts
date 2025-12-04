import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
    try {
        // Get ALL products
        const productsRef = collection(db, "products");
        const allProductsSnap = await getDocs(productsRef);
        const allProducts = allProductsSnap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                teamId: data.teamId,
                team: data.team,
                league: data.league,
            };
        });

        // Get ALL teams
        const teamsRef = collection(db, "teams");
        const allTeamsSnap = await getDocs(teamsRef);
        const allTeams = allTeamsSnap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                league: data.league,
                sport: data.sport,
                enabled: data.enabled,
                isHardcoded: data.isHardcoded,
            };
        });

        // Check specific teams
        const manCityTeam = allTeams.find((t) => t.id === "man-city");
        const manUtdTeam = allTeams.find((t) => t.id === "man-utd");

        // Group products by team
        const productsByTeam: { [key: string]: any[] } = {};
        allProducts.forEach((p) => {
            if (!productsByTeam[p.teamId]) {
                productsByTeam[p.teamId] = [];
            }
            productsByTeam[p.teamId].push(p);
        });

        return NextResponse.json({
            summary: {
                totalProducts: allProducts.length,
                totalTeams: allTeams.length,
                premierLeagueTeams: allTeams.filter((t) => t.league === "Premier League").length,
            },
            allProducts,
            manCityTeam,
            manUtdTeam,
            productsByTeam,
            allTeamsIds: allTeams.map((t) => t.id),
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
