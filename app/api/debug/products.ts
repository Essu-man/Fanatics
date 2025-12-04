import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
    try {
        const snapshot = await getDocs(collection(db, "products"));
        const products = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                team: data.team,
                teamId: data.teamId,
                league: data.league,
            };
        });

        // Group by teamId to see the structure
        const grouped: { [key: string]: any[] } = {};
        products.forEach(p => {
            if (!grouped[p.teamId]) grouped[p.teamId] = [];
            grouped[p.teamId].push(p);
        });

        return NextResponse.json({
            totalProducts: products.length,
            products,
            grouped,
        });
    } catch (error: any) {
        console.error("Debug error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
