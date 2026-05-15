import { NextResponse } from "next/server";
import { createVendor, getAllVendors, updateUserProfile } from "@/lib/firestore";
import { assertSlugUnique } from "@/lib/products-shared";
import type { VendorStatus } from "@/lib/firestore";

export const runtime = "nodejs";

export async function GET() {
    try {
        const vendors = await getAllVendors();
        return NextResponse.json({ success: true, vendors });
    } catch (error: any) {
        console.error("GET /api/admin/vendors:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to load vendors" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            slug,
            businessName,
            ownerUserId,
            description,
            logoUrl,
            status = "pending",
            linkUserProfile = true,
        } = body;

        if (!slug || typeof slug !== "string" || !businessName || typeof businessName !== "string") {
            return NextResponse.json(
                { success: false, error: "slug and businessName are required" },
                { status: 400 }
            );
        }

        if (!ownerUserId || typeof ownerUserId !== "string") {
            return NextResponse.json(
                { success: false, error: "ownerUserId (Firebase uid) is required" },
                { status: 400 }
            );
        }

        const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");
        const unique = await assertSlugUnique(normalizedSlug);
        if (!unique) {
            return NextResponse.json({ success: false, error: "Slug already in use" }, { status: 400 });
        }

        const allowed: VendorStatus[] = ["pending", "active", "suspended"];
        const vendorStatus: VendorStatus = allowed.includes(status) ? status : "pending";

        const result = await createVendor({
            slug: normalizedSlug,
            businessName: businessName.trim(),
            ownerUserId: ownerUserId.trim(),
            status: vendorStatus,
            description: typeof description === "string" ? description.trim() : undefined,
            logoUrl: typeof logoUrl === "string" ? logoUrl.trim() : undefined,
        });

        if (!result.success || !result.id) {
            throw new Error(result.error || "Failed to create vendor");
        }

        if (linkUserProfile) {
            await updateUserProfile(ownerUserId.trim(), {
                role: "vendor",
                vendorId: result.id,
            });
        }

        return NextResponse.json({ success: true, vendorId: result.id });
    } catch (error: any) {
        console.error("POST /api/admin/vendors:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to create vendor" },
            { status: 500 }
        );
    }
}
