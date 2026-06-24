import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";

// POST /api/auth/verify-email-otp
// Body: { email: string, code: string }
// Public — no auth required. Used by the vendor application form.
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, code } = body;

        if (!email || typeof email !== "string" || !email.includes("@")) {
            return NextResponse.json(
                { success: false, error: "A valid email is required" },
                { status: 400 }
            );
        }

        if (!code || typeof code !== "string" || code.trim().length !== 6) {
            return NextResponse.json(
                { success: false, error: "A valid 6-digit code is required" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        const docId = Buffer.from(normalizedEmail).toString("base64");
        const db = getFirestore(getFirebaseAdminApp());
        const ref = db.collection("email_otps").doc(docId);
        const snap = await ref.get();

        if (!snap.exists) {
            return NextResponse.json(
                { success: false, error: "No code found for this email. Please request a new one." },
                { status: 404 }
            );
        }

        const data = snap.data()!;

        if (data.used === true) {
            return NextResponse.json(
                { success: false, error: "This code was already used. Please request a new one." },
                { status: 400 }
            );
        }

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

        if (data.code !== code.trim()) {
            return NextResponse.json(
                { success: false, error: "Incorrect code. Please try again." },
                { status: 400 }
            );
        }

        // Mark as used
        await ref.update({ used: true });

        return NextResponse.json({ success: true, message: "Email verified" });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("verify-email-otp error:", message);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
