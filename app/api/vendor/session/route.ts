import { NextResponse } from "next/server";
import { requireVendorAuthDetailed } from "@/lib/api-auth";
import { adminGetUserProfile } from "@/lib/firestore-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
    const result = await requireVendorAuthDetailed(request);
    if (!result.ok) {
        return NextResponse.json({
            success: true,
            canSell: false,
            error: result.error,
            code: result.code,
        });
    }

    const profile = await adminGetUserProfile(result.auth.uid);

    return NextResponse.json({
        success: true,
        canSell: true,
        vendorId: result.auth.vendorId,
        businessName: result.auth.vendor.businessName,
        slug: result.auth.vendor.slug,
        user: profile
            ? {
                  id: profile.uid,
                  email: profile.email,
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  role: profile.role,
                  phone: profile.phone,
                  vendorId: profile.vendorId ?? result.auth.vendorId,
              }
            : {
                  id: result.auth.uid,
                  email: "",
                  firstName: "",
                  lastName: "",
                  role: "vendor" as const,
                  vendorId: result.auth.vendorId,
              },
    });
}
