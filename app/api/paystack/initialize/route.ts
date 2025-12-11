import { NextRequest, NextResponse } from "next/server";
import { cedisToKobo, generatePaymentReference } from "@/lib/paystack";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, amount, metadata } = body;

        if (!email || !amount) {
            console.error("Payment initialize: Missing email or amount");
            return NextResponse.json(
                { error: "Email and amount are required" },
                { status: 400 }
            );
        }

        const secretKey = process.env.PAYSTACK_SECRET_KEY;

        if (!secretKey) {
            console.error("Payment initialize: Paystack secret key missing");
            return NextResponse.json(
                { error: "Paystack configuration missing" },
                { status: 500 }
            );
        }

        // Determine callback URL - prioritize NEXT_PUBLIC_APP_URL for consistency
        let appUrl = process.env.NEXT_PUBLIC_APP_URL;

        // Fallback to environment-based URL if not set
        if (!appUrl) {
            if (process.env.NODE_ENV === "development") {
                appUrl = "http://localhost:3000";
            } else {
                appUrl = "https://www.cediman.com";
            }
        }

        // Clean up URL - remove trailing slashes
        appUrl = appUrl.replace(/\/$/, "");

        const callbackUrl = `${appUrl}/checkout/callback`;
        const reference = generatePaymentReference();
        const amountInKobo = cedisToKobo(amount);

        console.log("Payment initialize request:", {
            email,
            amount,
            reference,
            callbackUrl,
            currency: "GHS",
        });

        // Initialize transaction with Paystack API
        const paystackResponse = await fetch(
            "https://api.paystack.co/transaction/initialize",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    amount: amountInKobo,
                    currency: "GHS",
                    reference,
                    callback_url: callbackUrl,
                    metadata: metadata || {},
                }),
            }
        );

        const paystackData = await paystackResponse.json();

        console.log("Paystack initialize response status:", paystackResponse.status);

        if (!paystackData.status) {
            console.error("Paystack initialization failed:", paystackData);
            return NextResponse.json(
                { error: paystackData.message || "Failed to initialize payment" },
                { status: 400 }
            );
        }

        console.log("Payment initialized successfully. Reference:", reference);

        // Return authorization URL for redirect
        return NextResponse.json({
            success: true,
            data: {
                authorization_url: paystackData.data.authorization_url,
                access_code: paystackData.data.access_code,
                reference: paystackData.data.reference,
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
