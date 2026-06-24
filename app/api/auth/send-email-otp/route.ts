import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { sendEmail, getOtpVerificationEmail } from "@/lib/email";

export const runtime = "nodejs";

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/send-email-otp
// Body: { email: string, firstName?: string }
// Public — no auth required. Used by the vendor application form before account creation.
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, firstName } = body;

        if (!email || typeof email !== "string" || !email.includes("@")) {
            return NextResponse.json(
                { success: false, error: "A valid email address is required" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        const db = getFirestore(getFirebaseAdminApp());
        const docId = Buffer.from(normalizedEmail).toString("base64");
        const ref = db.collection("email_otps").doc(docId);

        // Rate limiting: allow only one send per 60 seconds
        const existing = await ref.get();
        if (existing.exists) {
            const data = existing.data()!;
            const createdAt: Date =
                data.createdAt && typeof data.createdAt.toDate === "function"
                    ? data.createdAt.toDate()
                    : new Date(0);
            const secondsAgo = (Date.now() - createdAt.getTime()) / 1000;
            if (secondsAgo < 60) {
                const remaining = Math.ceil(60 - secondsAgo);
                return NextResponse.json(
                    {
                        success: false,
                        error: `Please wait ${remaining}s before requesting a new code`,
                        retryAfter: remaining,
                    },
                    { status: 429 }
                );
            }
        }

        // Generate OTP and expiry (15 min)
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await ref.set({
            email: normalizedEmail,
            code: otp,
            expiresAt,
            used: false,
            createdAt: FieldValue.serverTimestamp(),
        });

        const name = (firstName || "").trim() || "there";
        const htmlBody = getOtpVerificationEmail(name, otp);
        const textBody = `Hi ${name},\n\nYour Cediman verification code is: ${otp}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this, please ignore this email.`;

        const emailResult = await sendEmail(
            normalizedEmail,
            `Your Cediman verification code: ${otp}`,
            htmlBody,
            textBody
        );

        if (!emailResult.success) {
            console.error("Failed to send OTP email:", emailResult.error);
            return NextResponse.json(
                { success: false, error: "Failed to send code. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: "Verification code sent" });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("send-email-otp error:", message);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
