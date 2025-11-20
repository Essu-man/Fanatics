import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { reference } = body;

        if (!reference) {
            return NextResponse.json(
                { error: "Payment reference is required" },
                { status: 400 }
            );
        }

        const secretKey = process.env.PAYSTACK_SECRET_KEY;

        if (!secretKey) {
            return NextResponse.json(
                { error: "Paystack configuration missing" },
                { status: 500 }
            );
        }

        // Verify payment with Paystack
        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: "Payment verification failed", details: data },
                { status: response.status }
            );
        }

        // Check if payment was successful
        if (data.status && data.data.status === "success") {
            return NextResponse.json({
                success: true,
                data: {
                    reference: data.data.reference,
                    amount: data.data.amount / 100, // Convert from kobo to cedis
                    status: data.data.status,
                    paidAt: data.data.paid_at,
                    channel: data.data.channel,
                    customer: data.data.customer,
                    metadata: data.data.metadata,
                },
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: "Payment not successful",
                    status: data.data.status,
                },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Error verifying payment:", error);
        return NextResponse.json(
            { error: "Failed to verify payment", details: error.message },
            { status: 500 }
        );
    }
}
