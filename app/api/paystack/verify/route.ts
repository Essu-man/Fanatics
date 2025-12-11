import { NextRequest, NextResponse } from "next/server";

// Helper function to verify with timeout
async function verifyWithTimeout(
    reference: string,
    secretKey: string,
    timeoutMs: number = 10000
): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json",
                },
                signal: controller.signal,
            }
        );

        return { response, error: null };
    } catch (error: any) {
        return { response: null, error };
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { reference } = body;

        if (!reference) {
            console.error("Payment verification: No reference provided");
            return NextResponse.json(
                { success: false, error: "Payment reference is required" },
                { status: 400 }
            );
        }

        const secretKey = process.env.PAYSTACK_SECRET_KEY;

        if (!secretKey) {
            console.error("Payment verification: Paystack secret key missing");
            return NextResponse.json(
                { success: false, error: "Paystack configuration missing" },
                { status: 500 }
            );
        }

        console.log("Verifying payment with reference:", reference);

        // Verify payment with Paystack - with timeout
        const { response, error } = await verifyWithTimeout(reference, secretKey, 15000);

        if (error) {
            if (error.name === "AbortError") {
                console.error("Paystack verification timeout for reference:", reference);
                return NextResponse.json(
                    { success: false, error: "Verification timeout. Please try again." },
                    { status: 504 }
                );
            }
            console.error("Paystack verification network error:", error);
            return NextResponse.json(
                { success: false, error: "Network error during verification" },
                { status: 503 }
            );
        }

        const data = await response!.json();

        console.log("Paystack response status:", response!.status, "Data status:", data.status);

        if (!response!.ok) {
            console.error("Paystack verification failed:", data);
            return NextResponse.json(
                { success: false, error: "Payment verification failed", details: data },
                { status: response!.status }
            );
        }

        // Check if payment was successful - Paystack returns status: true for successful requests
        if (data.status === true && data.data?.status === "success") {
            console.log("Payment verified successfully for reference:", reference);
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
            const paymentStatus = data.data?.status || "unknown";
            console.error("Payment not successful. Status:", paymentStatus);
            return NextResponse.json(
                {
                    success: false,
                    error: "Payment not successful",
                    status: paymentStatus,
                },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Error verifying payment:", error);
        return NextResponse.json(
            { success: false, error: "Failed to verify payment", details: error.message },
            { status: 500 }
        );
    }
}
