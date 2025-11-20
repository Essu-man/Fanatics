import { NextRequest, NextResponse } from "next/server";
import { cedisToKobo, generatePaymentReference } from "@/lib/paystack";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, amount, metadata } = body;

        if (!email || !amount) {
            return NextResponse.json(
                { error: "Email and amount are required" },
                { status: 400 }
            );
        }

        const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

        if (!publicKey) {
            return NextResponse.json(
                { error: "Paystack configuration missing" },
                { status: 500 }
            );
        }

        const reference = generatePaymentReference();
        const amountInKobo = cedisToKobo(amount);

        // Return payment configuration for client-side Paystack popup
        return NextResponse.json({
            success: true,
            data: {
                publicKey,
                email,
                amount: amountInKobo,
                reference,
                metadata,
                currency: "GHS",
            },
        });
    } catch (error: any) {
        console.error("Error initializing payment:", error);
        return NextResponse.json(
            { error: "Failed to initialize payment", details: error.message },
            { status: 500 }
        );
    }
}
