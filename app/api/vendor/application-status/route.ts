import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { adminGetUserProfile } from "@/lib/firestore-admin";
import { getLatestVendorApplicationForUser } from "@/lib/vendor-application-status";

export const runtime = "nodejs";

function bearerToken(request: Request): string | null {
    const h = request.headers.get("authorization");
    if (!h?.startsWith("Bearer ")) return null;
    return h.slice(7).trim() || null;
}

export async function GET(request: Request) {
    try {
        const token = bearerToken(request);
        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyFirebaseIdToken(token);
        const profile = await adminGetUserProfile(decoded.uid);
        const application = await getLatestVendorApplicationForUser(
            decoded.uid,
            profile?.email || decoded.email
        );

        return NextResponse.json({
            success: true,
            application: application
                ? {
                      ...application,
                      appliedAt: application.appliedAt?.toISOString() ?? null,
                      reviewedAt: application.reviewedAt?.toISOString() ?? null,
                  }
                : null,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to load application status";
        console.error("GET /api/vendor/application-status:", error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
