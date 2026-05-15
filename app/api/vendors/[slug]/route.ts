import { NextResponse } from "next/server";
import { getProductsByVendorId, getVendorBySlug } from "@/lib/firestore";

export const runtime = "nodejs";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
    try {
        const { slug } = await Promise.resolve(params);
        const vendor = await getVendorBySlug(slug);

        if (!vendor || vendor.status !== "active") {
            return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
        }

        const products = await getProductsByVendorId(vendor.id);

        return NextResponse.json({
            success: true,
            vendor,
            products,
        });
    } catch (error: any) {
        console.error("GET /api/vendors/[slug]:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to load store" },
            { status: 500 }
        );
    }
}
