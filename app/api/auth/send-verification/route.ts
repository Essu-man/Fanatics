import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken, getFirebaseAdminApp } from "@/lib/firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { sendEmail, getOtpVerificationEmail } from "@/lib/email";
import { adminGetUserProfile } from "@/lib/firestore-admin";

export const runtime = "nodejs";

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

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

        // Get user profile to get email and name
        const profile = await adminGetUserProfile(uid);
        if (!profile) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        if (profile.emailVerified) {
            return NextResponse.json({ success: false, error: "Email is already verified" }, { status: 400 });
        }

        // Rate limiting: check if a code was sent in the last 60 seconds
        const db = getFirestore(getFirebaseAdminApp());
        const verifyRef = db.collection("email_verifications").doc(uid);
        const existing = await verifyRef.get();
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
                    { success: false, error: `Please wait ${remaining}s before requesting a new code` },
                    { status: 429 }
                );
            }
        }

        // Generate OTP and compute expiry (15 minutes)
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Store in Firestore
        await verifyRef.set({
            email: profile.email,
            code: otp,
            expiresAt,
            used: false,
            createdAt: FieldValue.serverTimestamp(),
        });

        // Send OTP email
        const firstName = profile.firstName || "there";
        const htmlBody = getOtpVerificationEmail(firstName, otp);
        const textBody = `Hi ${firstName},\n\nYour Cediman verification code is: ${otp}\n\nThis code expires in 15 minutes.\n\nIf you didn't create a Cediman account, please ignore this email.`;

        const emailResult = await sendEmail(
            profile.email,
            `Your Cediman verification code: ${otp}`,
            htmlBody,
            textBody
        );

        if (!emailResult.success) {
            console.error("Failed to send OTP email:", emailResult.error);
            return NextResponse.json(
                { success: false, error: "Failed to send verification email. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: "Verification code sent" });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("send-verification error:", message);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
