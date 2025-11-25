import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/frogwigal";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to, subject, htmlBody, textBody } = body;

        if (!to || !subject || !htmlBody) {
            return NextResponse.json(
                { error: "Recipient, subject, and HTML body are required" },
                { status: 400 }
            );
        }

        const result = await sendEmail(to, subject, htmlBody, textBody);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: result.message,
            });
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Email API error:", error);
        return NextResponse.json(
            { error: "Failed to send email", details: error.message },
            { status: 500 }
        );
    }
}
