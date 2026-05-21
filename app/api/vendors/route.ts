import { NextResponse } from "next/server";
import { getActiveVendors } from "@/lib/firestore";

export const runtime = "nodejs";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q")?.trim().toLowerCase() || "";

        let vendors = await getActiveVendors();

        if (q) {
            vendors = vendors.filter((v) => {
                const haystack = [v.businessName, v.slug, v.description || ""]
                    .join(" ")
                    .toLowerCase();
                return haystack.includes(q);
            });
        }

        return NextResponse.json({
            success: true,
            vendors: vendors.map((v) => ({
                id: v.id,
                slug: v.slug,
                businessName: v.businessName,
                description: v.description,
                logoUrl: v.logoUrl,
                status: v.status,
            })),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to load stores";
        console.error("GET /api/vendors:", error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
