import { NextResponse } from "next/server";
import { requireVendorAuthDetailed } from "@/lib/api-auth";
import { getAdminDb } from "@/lib/firestore-admin";
import { Timestamp } from "firebase-admin/firestore";
import { sendEmail, getPayoutRequestBreakdownEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: Request) {
    const authResult = await requireVendorAuthDetailed(request);
    if (!authResult.ok) {
        return NextResponse.json(
            { success: false, error: authResult.error, code: authResult.code },
            { status: authResult.status }
        );
    }
    const auth = authResult.auth;

    try {
        const db = getAdminDb();

        // Retrieve fresh vendor document to get current balances
        const vendorDoc = await db.collection("vendors").doc(auth.vendorId).get();
        if (!vendorDoc.exists) {
            return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });
        }

        const vendor = vendorDoc.data()!;
        const balanceAvailable = vendor.balanceAvailable ?? 0;
        const balancePending = vendor.balancePending ?? 0;

        // Fetch ledger entries
        const entriesSnap = await db.collection("vendor_ledger_entries")
            .where("vendorId", "==", auth.vendorId)
            .limit(100)
            .get();

        const history = entriesSnap.docs.map((doc) => {
            const data = doc.data();
            const date = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now());
            return {
                id: doc.id,
                orderId: data.orderId || null,
                type: data.type,
                amount: data.amount,
                status: data.status,
                createdAt: date.toISOString(),
                createdAtDate: date,
                description: data.description || "",
            };
        });
        history.sort((a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime());

        // Fetch pending payout requests
        const requestsSnap = await db.collection("payout_requests")
            .where("vendorId", "==", auth.vendorId)
            .limit(50)
            .get();

        const payoutRequests = requestsSnap.docs.map((doc) => {
            const data = doc.data();
            const date = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now());
            return {
                id: doc.id,
                amount: data.amount,
                status: data.status,
                payoutMethod: data.payoutMethod,
                payoutDetails: data.payoutDetails || {},
                createdAt: date.toISOString(),
                createdAtDate: date,
            };
        });
        payoutRequests.sort((a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime());

        const commissionRate = typeof vendor.commissionRate === "number" ? vendor.commissionRate : 10;

        return NextResponse.json({
            success: true,
            commissionRate,
            balances: {
                available: balanceAvailable,
                pending: balancePending,
            },
            payoutSettings: {
                payoutMethod: vendor.payoutMethod ?? null,
                bankName: vendor.bankName ?? null,
                branch: vendor.branch ?? null,
                accountNumber: vendor.accountNumber ?? null,
                accountName: vendor.accountName ?? null,
                momoNetwork: vendor.momoNetwork ?? null,
                momoNumber: vendor.momoNumber ?? null,
            },
            history,
            payoutRequests,
        });
    } catch (error: any) {
        console.error("Vendor payouts GET error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to load payouts data" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const authResult = await requireVendorAuthDetailed(request);
    if (!authResult.ok) {
        return NextResponse.json(
            { success: false, error: authResult.error, code: authResult.code },
            { status: authResult.status }
        );
    }
    const auth = authResult.auth;

    try {
        const body = await request.json();
        const { amount } = body;

        const requestAmount = Number(amount);
        const MIN_PAYOUT_AMOUNT = 20.00;
        if (isNaN(requestAmount) || requestAmount <= 0) {
            return NextResponse.json(
                { success: false, error: "Invalid payout request amount" },
                { status: 400 }
            );
        }

        if (requestAmount < MIN_PAYOUT_AMOUNT) {
            return NextResponse.json(
                { success: false, error: `Minimum payout request amount is GH₵ ${MIN_PAYOUT_AMOUNT.toFixed(2)}` },
                { status: 400 }
            );
        }

        const db = getAdminDb();

        // Check fresh vendor balances
        const vendorDoc = await db.collection("vendors").doc(auth.vendorId).get();
        if (!vendorDoc.exists) {
            return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });
        }

        const vendor = vendorDoc.data()!;
        const balanceAvailable = vendor.balanceAvailable ?? 0;

        if (balanceAvailable < requestAmount) {
            return NextResponse.json(
                { success: false, error: `Insufficient balance. Available: GH₵ ${balanceAvailable.toFixed(2)}` },
                { status: 400 }
            );
        }

        if (!vendor.payoutMethod) {
            return NextResponse.json(
                { success: false, error: "Please configure your payout settings before requesting a withdrawal." },
                { status: 400 }
            );
        }

        // Retrieve owner user details for notifications
        let email = "";
        let contactName = vendor.businessName || "Seller Store";
        if (vendor.ownerUserId) {
            try {
                const userDoc = await db.collection("users").doc(vendor.ownerUserId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data()!;
                    email = userData.email || "";
                    contactName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || contactName;
                }
            } catch (e) {
                console.error("Failed to fetch vendor owner user profile:", e);
            }
        }

        // Create payout request document
        const requestData = {
            vendorId: auth.vendorId,
            businessName: vendor.businessName || "Seller Store",
            email: email,
            contactName: contactName,
            amount: requestAmount,
            status: "pending",
            payoutMethod: vendor.payoutMethod,
            payoutDetails: vendor.payoutMethod === "Bank Transfer" ? {
                bankName: vendor.bankName,
                branch: vendor.branch,
                accountNumber: vendor.accountNumber,
                accountName: vendor.accountName,
            } : {
                momoNetwork: vendor.momoNetwork,
                momoNumber: vendor.momoNumber,
            },
            createdAt: new Date(),
        };

        const docRef = await db.collection("payout_requests").add(requestData);

        const detailsString = vendor.payoutMethod === "Bank Transfer"
            ? `Bank: ${vendor.bankName}, Branch: ${vendor.branch}, Acc #: ${vendor.accountNumber}, Holder: ${vendor.accountName}`
            : `Network: ${vendor.momoNetwork}, Number: ${vendor.momoNumber}`;

        // Compute complete financial breakdown metrics for notification emails
        let netSaleTotal = 0;
        let totalPaidOut = 0;
        try {
            const ledgerSnap = await db.collection("vendor_ledger_entries")
                .where("vendorId", "==", auth.vendorId)
                .get();
            ledgerSnap.forEach(doc => {
                const d = doc.data();
                if (d.type === "sale" && (d.status === "available" || d.status === "completed" || d.status === "pending")) {
                    netSaleTotal += Number(d.amount) || 0;
                }
                if (d.type === "payout" && d.status === "completed") {
                    totalPaidOut += Math.abs(Number(d.amount) || 0);
                }
            });
        } catch (e) {
            console.error("Failed to fetch ledger for payout email breakdown:", e);
        }

        const commissionRate = typeof vendor.commissionRate === "number" ? vendor.commissionRate : 10;
        const grossSales = commissionRate < 100 ? netSaleTotal / (1 - commissionRate / 100) : netSaleTotal;
        const platformFeeAmount = grossSales - netSaleTotal;
        const remainingAvailableBalance = Math.max(0, balanceAvailable - requestAmount);
        const balancePending = vendor.balancePending ?? 0;

        const emailParamsBase = {
            vendorBusinessName: vendor.businessName || "Seller Store",
            requestId: docRef.id,
            requestedAmount: requestAmount,
            remainingAvailableBalance,
            grossSales: Number(grossSales.toFixed(2)),
            commissionRate,
            platformFeeAmount: Number(platformFeeAmount.toFixed(2)),
            netPayableRevenue: Number(netSaleTotal.toFixed(2)),
            totalPaidOut: Number(totalPaidOut.toFixed(2)),
            balancePending,
            payoutMethod: vendor.payoutMethod,
            payoutDetailsString: detailsString,
        };

        // 1. Send detailed breakdown email to Vendor (non-blocking)
        if (email) {
            const vendorEmailHtml = getPayoutRequestBreakdownEmail({
                ...emailParamsBase,
                recipientType: "vendor",
                recipientName: contactName,
            });
            sendEmail(
                email,
                `Payout Request Confirmation - ${vendor.businessName || "Seller Store"}`,
                vendorEmailHtml
            ).catch(err => console.error("Failed to send vendor payout breakdown email:", err));
        }

        // 2. Send detailed breakdown email to Admin (non-blocking)
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        if (adminEmail) {
            const adminEmailHtml = getPayoutRequestBreakdownEmail({
                ...emailParamsBase,
                recipientType: "admin",
                recipientName: "Admin",
            });
            sendEmail(
                adminEmail,
                `New Payout Request - ${vendor.businessName || "Seller Store"} (GH₵ ${requestAmount.toFixed(2)})`,
                adminEmailHtml
            ).catch(err => console.error("Failed to send admin payout request email:", err));
        }

        return NextResponse.json({
            success: true,
            requestId: docRef.id,
            message: "Payout request submitted successfully.",
        });
    } catch (error: any) {
        console.error("Vendor payouts POST error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to submit payout request" },
            { status: 500 }
        );
    }
}
