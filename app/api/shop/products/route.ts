import { NextResponse } from "next/server";
import { getProducts } from "@/lib/firestore";
import { filterShopProducts } from "@/lib/shop-products";

export const runtime = "nodejs";

/** Public catalog: Cediman inventory + approved marketplace vendor listings */
export async function GET() {
    try {
        const products = await getProducts();
        const listed = filterShopProducts(products);
        return NextResponse.json({ success: true, products: listed });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to load products";
        console.error("GET /api/shop/products:", error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
