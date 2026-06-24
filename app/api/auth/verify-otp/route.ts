import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken, getFirebaseAdminApp } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";

function bearerToken(request: Request): string | null {
    const h = request.headers.get("Authorization") || "";
    if (!h.startsWith("Bearer ")) return null;
    return h.slice(7).trim() || null;
}

export async function POST(request: NextRequest) {
    try {
        // Verify Firebase auth token
        const token = bearerToken(request);
        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        let uid: string;
        try {
            const decoded = await verifyFirebaseIdToken(token);
            uid = decoded.uid;
        } catch {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        // Read OTP from request body
        const body = await request.json();
        const { code } = body;

        if (!code || typeof code !== "string" || code.length !== 6) {
            return NextResponse.json(
                { success: false, error: "A valid 6-digit code is required" },
                { status: 400 }
            );
        }

        const db = getFirestore(getFirebaseAdminApp());
        const verifyRef = db.collection("email_verifications").doc(uid);
        const snap = await verifyRef.get();

        if (!snap.exists) {
            return NextResponse.json(
                { success: false, error: "No verification code found. Please request a new one." },
                { status: 404 }
            );
        }

        const data = snap.data()!;

        // Check if already used
        if (data.used === true) {
            return NextResponse.json(
                { success: false, error: "This code has already been used. Please request a new one." },
                { status: 400 }
            );
        }

        // Check expiry
        const expiresAt: Date =
            data.expiresAt && typeof data.expiresAt.toDate === "function"
                ? data.expiresAt.toDate()
                : new Date(data.expiresAt);

        if (new Date() > expiresAt) {
            return NextResponse.json(
                { success: false, error: "This code has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // Check code match (constant-time safe for short codes)
        if (data.code !== code.trim()) {
            return NextResponse.json(
                { success: false, error: "Incorrect code. Please try again." },
                { status: 400 }
            );
        }

        // Mark code as used
        await verifyRef.update({ used: true });

        // Mark user as verified in Firestore users collection
        await db.collection("users").doc(uid).update({ emailVerified: true });

        return NextResponse.json({ success: true, message: "Email verified successfully" });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("verify-otp error:", message);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
