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

        const secretKey = process.env.PAYSTACK_SECRET_KEY;

        // Detect the correct app URL based on environment
        // Priority: 1) Request origin (for localhost), 2) NEXT_PUBLIC_APP_URL, 3) Default based on NODE_ENV
        const origin = request.headers.get("origin") || request.headers.get("referer")?.split("/").slice(0, 3).join("/");
        let appUrl = process.env.NEXT_PUBLIC_APP_URL;

        // If no explicit URL set, or if origin contains localhost, use origin or localhost
        if (!appUrl || (origin && origin.includes("localhost"))) {
            appUrl = origin || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://www.cediman.com");
        }

        // Ensure we don't use production URL in development
        if (process.env.NODE_ENV === "development" && appUrl?.includes("cediman.com")) {
            appUrl = "http://localhost:3000";
        }

        if (!secretKey) {
            return NextResponse.json(
                { error: "Paystack configuration missing" },
                { status: 500 }
            );
        }

        const reference = generatePaymentReference();
        const amountInKobo = cedisToKobo(amount);

        // Initialize transaction with Paystack API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
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
                        callback_url: `${appUrl}/checkout/callback`,
                        metadata,
                    }),
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);
            const paystackData = await paystackResponse.json();

            if (!paystackData.status) {
                return NextResponse.json(
                    { error: paystackData.message || "Failed to initialize payment" },
                    { status: 400 }
                );
            }

            // Return authorization URL for redirect
            return NextResponse.json({
                success: true,
                data: {
                    authorization_url: paystackData.data.authorization_url,
                    access_code: paystackData.data.access_code,
                    reference: paystackData.data.reference,
                },
            });
        } catch (fetchError: any) {
            clearTimeout(timeoutId);

            if (fetchError.name === 'AbortError') {
                console.error("Payment initialization timeout");
                return NextResponse.json(
                    { error: "Payment initialization timed out. Please check your connection and try again." },
                    { status: 408 }
                );
            }

            throw fetchError; // Re-throw other errors to be caught by outer try-catch
        }
    } catch (error: any) {
        console.error("Error initializing payment:", error);
        return NextResponse.json(
            { error: "Failed to initialize payment", details: error.message },
            { status: 500 }
        );
    }
}
