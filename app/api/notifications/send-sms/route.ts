import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/frogwigal";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phoneNumber, message, sandbox } = body;

        if (!phoneNumber || !message) {
            return NextResponse.json(
                { error: "Phone number and message are required" },
                { status: 400 }
            );
        }

        const result = await sendSMS(phoneNumber, message, sandbox);

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
        console.error("SMS API error:", error);
        return NextResponse.json(
            { error: "Failed to send SMS", details: error.message },
            { status: 500 }
        );
    }
}
