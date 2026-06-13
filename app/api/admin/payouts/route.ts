import { NextResponse } from "next/server";
import { requireAdminProfile } from "@/lib/api-auth";
import { getAdminDb, adminUpdateVendor } from "@/lib/firestore-admin";
import { payoutVendor } from "@/lib/vendor-ledger";
import { Timestamp } from "firebase-admin/firestore";
import { sendEmail, getVendorPayoutApprovedEmail, getVendorPayoutRejectedEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: Request) {
    const adminAuth = await requireAdminProfile(request);
    if (!adminAuth) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const db = getAdminDb();

        // 1. Fetch all vendors
        const vendorsSnap = await db.collection("vendors").get();
        const vendors = vendorsSnap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                businessName: data.businessName,
                slug: data.slug,
                status: data.status,
                balanceAvailable: data.balanceAvailable ?? 0,
                balancePending: data.balancePending ?? 0,
                payoutMethod: data.payoutMethod ?? null,
                bankName: data.bankName ?? null,
                branch: data.branch ?? null,
                accountNumber: data.accountNumber ?? null,
                accountName: data.accountName ?? null,
                momoNetwork: data.momoNetwork ?? null,
                momoNumber: data.momoNumber ?? null,
                commissionRate: data.commissionRate ?? 10,
            };
        });

        // 2. Fetch all payout requests
        const requestsSnap = await db.collection("payout_requests")
            .orderBy("createdAt", "desc")
            .limit(100)
            .get();

        const payoutRequests = requestsSnap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                vendorId: data.vendorId,
                businessName: data.businessName,
                amount: data.amount,
                status: data.status,
                payoutMethod: data.payoutMethod,
                payoutDetails: data.payoutDetails || {},
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
            };
        });

        // 3. Fetch past payouts ledger history
        const ledgerSnap = await db.collection("vendor_ledger_entries")
            .where("type", "==", "payout")
            .limit(100)
            .get();

        const payoutsHistory = ledgerSnap.docs.map((doc) => {
            const data = doc.data();
            const date = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now());
            return {
                id: doc.id,
                vendorId: data.vendorId,
                amount: Math.abs(data.amount), // Return absolute value for payout display
                status: data.status,
                createdAt: date.toISOString(),
                createdAtDate: date,
                description: data.description || "",
            };
        });

        payoutsHistory.sort((a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime());

        return NextResponse.json({
            success: true,
            vendors,
            payoutRequests,
            payoutsHistory,
        });
    } catch (error: any) {
        console.error("GET /api/admin/payouts error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to load payouts data" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const adminAuth = await requireAdminProfile(request);
    if (!adminAuth) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { requestId, vendorId, amount, payoutMethod, payoutDetails, action = "approve", commissionRate } = body;

        const db = getAdminDb();

        if (action === "update-commission") {
            if (!vendorId || commissionRate === undefined) {
                return NextResponse.json({ success: false, error: "vendorId and commissionRate are required" }, { status: 400 });
            }
            const rate = Number(commissionRate);
            if (isNaN(rate) || rate < 0 || rate > 100) {
                return NextResponse.json({ success: false, error: "Invalid commission rate value (must be 0-100)" }, { status: 400 });
            }
            const updateResult = await adminUpdateVendor(vendorId, { commissionRate: rate });
            if (!updateResult.success) {
                return NextResponse.json({ success: false, error: updateResult.error || "Failed to update commission rate" }, { status: 500 });
            }
            return NextResponse.json({ success: true, message: "Commission rate updated successfully." });
        }

        if (requestId) {
            // Process an existing payout request
            const requestRef = db.collection("payout_requests").doc(requestId);
            const requestDoc = await requestRef.get();

            if (!requestDoc.exists) {
                return NextResponse.json({ success: false, error: "Payout request not found" }, { status: 404 });
            }

            const requestData = requestDoc.data()!;
            if (requestData.status !== "pending") {
                return NextResponse.json({ success: false, error: "Payout request is already processed" }, { status: 400 });
            }

            if (action === "reject") {
                await requestRef.update({
                    status: "rejected",
                    processedAt: new Date(),
                });

                // Send email alert to vendor (non-blocking)
                const vendorEmail = requestData.email;
                const vendorContactName = requestData.contactName || requestData.businessName || "Vendor Owner";
                const rejectReason = body.reason || "Payout details verification issue or balance discrepancy. Please verify your billing/MoMo configuration in dashboard settings.";
                if (vendorEmail) {
                    sendEmail(
                        vendorEmail,
                        "Payout Request Declined - Cediman Marketplace",
                        getVendorPayoutRejectedEmail(vendorContactName, requestData.amount, rejectReason)
                    ).catch(err => console.error("Failed to send vendor payout rejection email:", err));
                }

                return NextResponse.json({ success: true, message: "Payout request rejected." });
            }

            // Execute payout ledger transaction
            const payoutResult = await payoutVendor(requestData.vendorId, requestData.amount, {
                payoutMethod: requestData.payoutMethod,
                payoutAccount: requestData.payoutMethod === "Bank Transfer"
                    ? `${requestData.payoutDetails.bankName} - ${requestData.payoutDetails.accountNumber}`
                    : `${requestData.payoutDetails.momoNetwork} - ${requestData.payoutDetails.momoNumber}`,
            });

            if (!payoutResult.success) {
                return NextResponse.json({ success: false, error: payoutResult.error || "Failed to process ledger payout" }, { status: 400 });
            }

            // Mark payout request as completed
            await requestRef.update({
                status: "completed",
                processedAt: new Date(),
            });

            // Send email receipt to vendor (non-blocking)
            const vendorEmail = requestData.email;
            const vendorContactName = requestData.contactName || requestData.businessName || "Vendor Owner";
            if (vendorEmail) {
                const payoutAccountStr = requestData.payoutMethod === "Bank Transfer"
                    ? `${requestData.payoutDetails.bankName} - ${requestData.payoutDetails.accountNumber}`
                    : `${requestData.payoutDetails.momoNetwork} - ${requestData.payoutDetails.momoNumber}`;
                sendEmail(
                    vendorEmail,
                    "Payout Request Processed - Cediman Marketplace",
                    getVendorPayoutApprovedEmail(vendorContactName, requestData.amount, requestData.payoutMethod, payoutAccountStr)
                ).catch(err => console.error("Failed to send vendor payout approval email:", err));
            }

            return NextResponse.json({ success: true, message: "Payout request approved and recorded." });
        } else {
            // Record a manual payout directly
            if (!vendorId || !amount || !payoutMethod) {
                return NextResponse.json({ success: false, error: "vendorId, amount, and payoutMethod are required" }, { status: 400 });
            }

            const payoutResult = await payoutVendor(vendorId, Number(amount), {
                payoutMethod,
                payoutAccount: payoutDetails || "Manual Transfer Details",
            });

            if (!payoutResult.success) {
                return NextResponse.json({ success: false, error: payoutResult.error || "Failed to record ledger payout" }, { status: 400 });
            }

            return NextResponse.json({ success: true, message: "Manual payout recorded successfully." });
        }
    } catch (error: any) {
        console.error("POST /api/admin/payouts error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to process payout" },
            { status: 500 }
        );
    }
}
