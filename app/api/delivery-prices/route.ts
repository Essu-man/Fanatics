import { NextResponse } from "next/server";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const runtime = "nodejs";

// GET delivery price for a location
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const location = searchParams.get("location");

        if (!location) {
            return NextResponse.json(
                { success: false, error: "Location is required" },
                { status: 400 }
            );
        }

        // Query for the specific location (case-insensitive)
        const deliveryPricesRef = collection(db, "delivery_prices");
        const q = query(
            deliveryPricesRef,
            where("location", "==", location.trim())
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // Return default price if location not found
            return NextResponse.json({
                success: true,
                price: 0,
                location: location,
                found: false,
            });
        }

        const doc = querySnapshot.docs[0];
        const data = doc.data();

        return NextResponse.json({
            success: true,
            price: data.price || 0,
            location: data.location,
            found: true,
        });
    } catch (error: any) {
        console.error("Failed to fetch delivery price:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to fetch delivery price" },
            { status: 500 }
        );
    }
}
