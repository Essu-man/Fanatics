import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const reference = searchParams.get("reference");

        if (!reference) {
            return NextResponse.json(
                { exists: false, error: "Reference is required" },
                { status: 400 }
            );
        }

        // Check if an order with this paystack reference already exists
        const q = query(
            collection(db, "orders"),
            where("paystackReference", "==", reference),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const orderDoc = querySnapshot.docs[0];
            return NextResponse.json({
                exists: true,
                orderId: orderDoc.id,
            });
        }

        return NextResponse.json({
            exists: false,
        });
    } catch (error: any) {
        console.error("Error checking order reference:", error);
        return NextResponse.json(
            { exists: false, error: error.message },
            { status: 500 }
        );
    }
}

