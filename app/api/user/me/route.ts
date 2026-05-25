import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { handleApiAuthError } from "@/lib/api-error";
import { adminGetUserProfile } from "@/lib/firestore-admin";

export const runtime = "nodejs";

function bearerToken(request: Request): string | null {
    const h = request.headers.get("authorization");
    if (!h?.startsWith("Bearer ")) return null;
    return h.slice(7).trim() || null;
}

export async function GET(request: Request) {
    const token = bearerToken(request);
    if (!token) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const decoded = await verifyFirebaseIdToken(token);
        const profile = await adminGetUserProfile(decoded.uid);

        if (!profile) {
            const displayName = decoded.name || "";
            const nameParts = displayName.split(" ");
            return NextResponse.json({
                success: true,
                user: {
                    id: decoded.uid,
                    email: decoded.email || "",
                    firstName: nameParts[0] || "",
                    lastName: nameParts.slice(1).join(" ") || "",
                    role: "customer" as const,
                },
            });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: profile.uid,
                email: profile.email,
                firstName: profile.firstName,
                lastName: profile.lastName,
                role: profile.role,
                phone: profile.phone,
                ...(profile.vendorId ? { vendorId: profile.vendorId } : {}),
            },
        });
    } catch (error: unknown) {
        const configResponse = handleApiAuthError(error, "GET /api/user/me");
        if (configResponse) return configResponse;
        console.error("GET /api/user/me:", error);
        const message = error instanceof Error ? error.message : "Unable to load profile";
        return NextResponse.json({ success: false, error: message }, { status: 401 });
    }
}
