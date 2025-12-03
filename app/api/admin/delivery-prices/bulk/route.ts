import { NextResponse } from "next/server";
import { collection, addDoc, Timestamp, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const runtime = "nodejs";

// POST - Bulk create delivery prices
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { prices, clearExisting } = body;

        if (!Array.isArray(prices) || prices.length === 0) {
            return NextResponse.json(
                { success: false, error: "Prices array is required" },
                { status: 400 }
            );
        }

        // Clear existing prices if requested
        if (clearExisting) {
            const existingPrices = await getDocs(collection(db, "delivery_prices"));
            const deletePromises = existingPrices.docs.map((doc) => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
        }

        // Add new prices
        const addPromises = prices.map((item: { location: string; price: number }) => {
            const priceData = {
                location: item.location.trim(),
                price: parseFloat(String(item.price)),
                createdAt: Timestamp.now(),
            };
            return addDoc(collection(db, "delivery_prices"), priceData);
        });

        await Promise.all(addPromises);

        return NextResponse.json({
            success: true,
            message: `Successfully added ${prices.length} delivery prices`,
            count: prices.length,
        });
    } catch (error: any) {
        console.error("Failed to bulk create delivery prices:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to create delivery prices" },
            { status: 500 }
        );
    }
}
