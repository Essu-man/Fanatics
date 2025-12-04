import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function GET() {
    try {
        // Get all football teams
        const teamsRef = collection(db, "teams");
        const footballQuery = query(teamsRef, where("sport", "==", "football"));
        const footballSnap = await getDocs(footballQuery);

        const premierLeagueTeams = footballSnap.docs
            .filter((doc) => doc.data().league === "Premier League")
            .map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    league: data.league,
                    enabled: data.enabled,
                    sport: data.sport,
                    isHardcoded: data.isHardcoded,
                };
            });

        // Get all products for man-city and man-utd
        const productsRef = collection(db, "products");
        const allProducts = await getDocs(productsRef);
        const premierProducts = allProducts.docs
            .filter((doc) => {
                const data = doc.data();
                return (
                    data.teamId === "man-city" ||
                    data.teamId === "man-utd"
                );
            })
            .map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    teamId: data.teamId,
                    team: data.team,
                    league: data.league,
                };
            });

        return NextResponse.json({
            premierLeagueTeams,
            premierProductsCount: premierProducts.length,
            premierProducts,
            diagnosis: {
                manCityExists: premierLeagueTeams.some((t) => t.id === "man-city"),
                manCityEnabled: premierLeagueTeams.find((t) => t.id === "man-city")?.enabled,
                manUtdExists: premierLeagueTeams.some((t) => t.id === "man-utd"),
                manUtdEnabled: premierLeagueTeams.find((t) => t.id === "man-utd")?.enabled,
                productCount: premierProducts.length,
            },
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
