import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
    try {
        const productsRef = collection(db, "products");
        const productsSnap = await getDocs(productsRef);
        const products = productsSnap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || "",
                teamId: data.teamId || "",
                team: data.team || "",
                price: data.price || 0,
            };
        });

        const teamsRef = collection(db, "teams");
        const teamsSnap = await getDocs(teamsRef);
        const teams = teamsSnap.docs.slice(0, 20).map((doc) => {
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

        const manCityDoc = teamsSnap.docs.find((d) => d.id === "man-city");
        const manUtdDoc = teamsSnap.docs.find((d) => d.id === "man-utd");

        const productsArray = products.map((p) => ({
            id: p.id,
            name: p.name,
            teamId: p.teamId,
            team: p.team,
            price: p.price,
        }));

        const manCityStatus = manCityDoc
            ? {
                id: manCityDoc.id,
                name: manCityDoc.data().name,
                enabled: manCityDoc.data().enabled,
                sport: manCityDoc.data().sport,
                isHardcoded: manCityDoc.data().isHardcoded,
            }
            : null;

        const manUtdStatus = manUtdDoc
            ? {
                id: manUtdDoc.id,
                name: manUtdDoc.data().name,
                enabled: manUtdDoc.data().enabled,
                sport: manUtdDoc.data().sport,
                isHardcoded: manUtdDoc.data().isHardcoded,
            }
            : null;

        return NextResponse.json({
            summary: {
                totalProducts: products.length,
                totalTeams: teamsSnap.size,
            },
            products: productsArray,
            teamsSample: teams,
            manCityStatus,
            manUtdStatus,
        });
    } catch (error) {
        console.error("Error fetching debug data:", error);
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        );
    }
}
