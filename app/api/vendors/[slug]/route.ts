import { NextResponse } from "next/server";
import { getProductsByVendorId } from "@/lib/firestore";
import { adminGetVendorBySlug } from "@/lib/firestore-admin";
import { serializePublicVendor } from "@/lib/vendor-public";

export const runtime = "nodejs";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
    try {
        const { slug } = await Promise.resolve(params);
        const vendor = await adminGetVendorBySlug(slug);

        if (!vendor || vendor.status !== "active") {
            return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
        }

        const products = await getProductsByVendorId(vendor.id);

        return NextResponse.json({
            success: true,
            vendor: serializePublicVendor(vendor),
            products,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to load store";
        console.error("GET /api/vendors/[slug]:", error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
