import { NextResponse } from "next/server";
import { getProduct } from "@/lib/firestore";

export const runtime = "nodejs";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ productId: string }> | { productId: string } }
) {
    try {
        const { productId } = await Promise.resolve(params);
        const product = await getProduct(productId);

        if (!product) {
            return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error("Failed to fetch product:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to load product" },
            { status: 500 }
        );
    }
}

