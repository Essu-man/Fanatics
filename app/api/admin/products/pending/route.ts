import { NextResponse } from "next/server";
import { adminGetPendingProducts } from "@/lib/firestore-admin";
import { getPendingProducts } from "@/lib/firestore";

export const runtime = "nodejs";

export async function GET() {
    try {
        let products = await adminGetPendingProducts();
        if (products.length === 0) {
            const fallback = await getPendingProducts();
            products = fallback.filter((p) => Boolean(p.vendorId));
        }
        return NextResponse.json({ success: true, products });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to load pending products";
        console.error("GET /api/admin/products/pending:", error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
