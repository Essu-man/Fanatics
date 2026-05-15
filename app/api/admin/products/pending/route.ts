import { NextResponse } from "next/server";
import { getPendingProducts } from "@/lib/firestore";

export async function GET() {
    try {
        const products = await getPendingProducts();
        return NextResponse.json({ success: true, products });
    } catch (error: any) {
        console.error("Error fetching pending products:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
