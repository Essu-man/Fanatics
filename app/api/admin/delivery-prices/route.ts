import { NextResponse } from "next/server";
import {
    collection,
    getDocs,
    addDoc,
    Timestamp,
    orderBy,
    query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const runtime = "nodejs";

// GET all delivery prices
export async function GET() {
    try {
        const q = query(collection(db, "delivery_prices"), orderBy("location", "asc"));
        const querySnapshot = await getDocs(q);

        const prices = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                location: data.location,
                price: data.price,
                createdAt: data.createdAt?.toDate() || new Date(),
            };
        });

        return NextResponse.json({ success: true, prices });
    } catch (error: any) {
        console.error("Failed to fetch delivery prices:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to load delivery prices" },
            { status: 500 }
        );
    }
}

// POST - Create a new delivery price
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { location, price } = body;

        if (!location || price === undefined || price === null) {
            return NextResponse.json(
                { success: false, error: "Location and price are required" },
                { status: 400 }
            );
        }

        const priceData = {
            location: location.trim(),
            price: parseFloat(price),
            createdAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, "delivery_prices"), priceData);

        return NextResponse.json({
            success: true,
            deliveryPrice: {
                id: docRef.id,
                ...priceData,
            },
        });
    } catch (error: any) {
        console.error("Failed to create delivery price:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to create delivery price" },
            { status: 500 }
        );
    }
}
