import { getAdminDb } from "./firestore-admin";

export interface LedgerEntryData {
    vendorId: string;
    orderId?: string;
    type: "sale" | "payout" | "refund" | "adjustment";
    amount: number;
    status: "pending" | "available" | "completed" | "cancelled";
    createdAt: Date;
    description: string;
    payoutMethod?: string;
    payoutDetails?: any;
}

/**
 * Credits the pending balance of each vendor associated with items in the paid order.
 * Creates a "pending" sale ledger entry for each vendor's total share.
 */
export async function creditPendingBalanceForOrder(order: any): Promise<{ success: boolean; message?: string; error?: string }> {
    const db = getAdminDb();
    const vendorShares: Record<string, { amount: number; description: string }> = {};

    // Fetch vendor commission rates first to support customization
    const rawVendorIds = Array.from(new Set((order.items || []).map((item: any) => item.vendorId).filter(Boolean)));
    const vendorCommissionRates: Record<string, number> = {};
    try {
        const vendorDocs = await Promise.all(rawVendorIds.map(id => db.collection("vendors").doc(id as string).get()));
        vendorDocs.forEach((doc, idx) => {
            if (doc.exists) {
                vendorCommissionRates[rawVendorIds[idx] as string] = typeof doc.data()?.commissionRate === "number"
                    ? doc.data()?.commissionRate
                    : 10;
            } else {
                vendorCommissionRates[rawVendorIds[idx] as string] = 10;
            }
        });
    } catch (e) {
        console.error("Error fetching vendor commission rates in ledger credit:", e);
    }

    for (const item of order.items || []) {
        const vendorId = item.vendorId;
        if (!vendorId) continue;
        
        const itemPrice = Number(item.price) || 0;
        const qty = Number(item.quantity) || 1;
        
        const itemSubtotal = itemPrice * qty;
        const commissionRate = vendorCommissionRates[vendorId] !== undefined ? vendorCommissionRates[vendorId] : 10;
        
        // Customization fee belongs to admin, so it's excluded from vendorAmount
        const platformFee = item.platformFee !== undefined ? Number(item.platformFee) : (itemSubtotal * (commissionRate / 100));
        const vendorAmount = item.vendorAmount !== undefined ? Number(item.vendorAmount) : (itemSubtotal - platformFee);

        if (!vendorShares[vendorId]) {
            vendorShares[vendorId] = { amount: 0, description: "" };
        }
        vendorShares[vendorId].amount += vendorAmount;
        const desc = `${item.name || item.productName || "Product"} x${qty}`;
        vendorShares[vendorId].description = vendorShares[vendorId].description 
            ? `${vendorShares[vendorId].description}, ${desc}` 
            : desc;
    }

    const vendorIds = Object.keys(vendorShares);
    if (vendorIds.length === 0) return { success: true, message: "No vendors to credit" };

    try {
        await db.runTransaction(async (transaction) => {
            // 1. Read phase
            const existingChecks = [];
            for (const vendorId of vendorIds) {
                const q = db.collection("vendor_ledger_entries")
                    .where("orderId", "==", order.id)
                    .where("vendorId", "==", vendorId)
                    .where("type", "==", "sale");
                existingChecks.push(transaction.get(q));
            }
            const checkSnaps = await Promise.all(existingChecks);

            const pendingCredits: string[] = [];
            for (let i = 0; i < vendorIds.length; i++) {
                if (checkSnaps[i].empty) {
                    pendingCredits.push(vendorIds[i]);
                }
            }

            if (pendingCredits.length === 0) {
                console.log(`Order ${order.id} already credited for all vendors.`);
                return;
            }

            const vendorRefs = pendingCredits.map(id => db.collection("vendors").doc(id));
            const vendorSnaps = await Promise.all(vendorRefs.map(ref => transaction.get(ref)));

            // 2. Write phase
            for (let i = 0; i < pendingCredits.length; i++) {
                const vendorId = pendingCredits[i];
                const vendorRef = vendorRefs[i];
                const share = vendorShares[vendorId];
                
                const balancePending = vendorSnaps[i].exists ? (vendorSnaps[i].data()?.balancePending || 0) : 0;
                const balanceAvailable = vendorSnaps[i].exists ? (vendorSnaps[i].data()?.balanceAvailable || 0) : 0;

                transaction.set(vendorRef, {
                    balancePending: balancePending + share.amount,
                    balanceAvailable: balanceAvailable,
                    updatedAt: new Date()
                }, { merge: true });

                const entryRef = db.collection("vendor_ledger_entries").doc();
                transaction.set(entryRef, {
                    vendorId,
                    orderId: order.id,
                    type: "sale",
                    amount: share.amount,
                    status: "pending",
                    createdAt: new Date(),
                    description: `Gross sale for items: ${share.description}. Less 10% platform fee.`
                });
            }
        });
        return { success: true };
    } catch (error: any) {
        console.error("creditPendingBalanceForOrder transaction failed:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Moves a vendor's share for an order from "Pending" to "Available" when delivery is confirmed.
 */
export async function clearPendingBalanceToAvailable(orderId: string): Promise<{ success: boolean; error?: string }> {
    const db = getAdminDb();
    try {
        await db.runTransaction(async (transaction) => {
            const entriesQuery = db.collection("vendor_ledger_entries")
                .where("orderId", "==", orderId)
                .where("type", "==", "sale")
                .where("status", "==", "pending");
            const entriesSnap = await transaction.get(entriesQuery);

            if (entriesSnap.empty) {
                console.log(`No pending ledger entries found for order ${orderId} to clear.`);
                return;
            }

            const vendorIds = Array.from(new Set(entriesSnap.docs.map(doc => doc.data().vendorId)));
            const vendorRefs = vendorIds.map(id => db.collection("vendors").doc(id));
            const vendorSnaps = await Promise.all(vendorRefs.map(ref => transaction.get(ref)));

            const vendorDataMap: Record<string, any> = {};
            for (let i = 0; i < vendorIds.length; i++) {
                const snap = vendorSnaps[i];
                vendorDataMap[vendorIds[i]] = snap.exists ? snap.data() : { balancePending: 0, balanceAvailable: 0 };
            }

            for (const entryDoc of entriesSnap.docs) {
                const entry = entryDoc.data();
                const vendorId = entry.vendorId;
                const amount = entry.amount;

                const vendorRef = db.collection("vendors").doc(vendorId);
                const vendorInfo = vendorDataMap[vendorId];
                
                const newPending = Math.max(0, (vendorInfo.balancePending || 0) - amount);
                const newAvailable = (vendorInfo.balanceAvailable || 0) + amount;

                transaction.set(vendorRef, {
                    balancePending: newPending,
                    balanceAvailable: newAvailable,
                    updatedAt: new Date()
                }, { merge: true });

                transaction.update(entryDoc.ref, {
                    status: "available",
                    clearedAt: new Date()
                });

                vendorInfo.balancePending = newPending;
                vendorInfo.balanceAvailable = newAvailable;
            }
        });
        return { success: true };
    } catch (error: any) {
        console.error("clearPendingBalanceToAvailable transaction failed:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Deducts the order share from pending balance and marks the sale ledger entry as "cancelled".
 */
export async function cancelPendingBalanceForOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    const db = getAdminDb();
    try {
        await db.runTransaction(async (transaction) => {
            const entriesQuery = db.collection("vendor_ledger_entries")
                .where("orderId", "==", orderId)
                .where("type", "==", "sale")
                .where("status", "==", "pending");
            const entriesSnap = await transaction.get(entriesQuery);

            if (entriesSnap.empty) {
                console.log(`No pending ledger entries found for order ${orderId} to cancel.`);
                return;
            }

            const vendorIds = Array.from(new Set(entriesSnap.docs.map(doc => doc.data().vendorId)));
            const vendorRefs = vendorIds.map(id => db.collection("vendors").doc(id));
            const vendorSnaps = await Promise.all(vendorRefs.map(ref => transaction.get(ref)));

            const vendorDataMap: Record<string, any> = {};
            for (let i = 0; i < vendorIds.length; i++) {
                const snap = vendorSnaps[i];
                vendorDataMap[vendorIds[i]] = snap.exists ? snap.data() : { balancePending: 0, balanceAvailable: 0 };
            }

            for (const entryDoc of entriesSnap.docs) {
                const entry = entryDoc.data();
                const vendorId = entry.vendorId;
                const amount = entry.amount;

                const vendorRef = db.collection("vendors").doc(vendorId);
                const vendorInfo = vendorDataMap[vendorId];
                
                const newPending = Math.max(0, (vendorInfo.balancePending || 0) - amount);

                transaction.set(vendorRef, {
                    balancePending: newPending,
                    updatedAt: new Date()
                }, { merge: true });

                transaction.update(entryDoc.ref, {
                    status: "cancelled",
                    cancelledAt: new Date()
                });

                vendorInfo.balancePending = newPending;
            }
        });
        return { success: true };
    } catch (error: any) {
        console.error("cancelPendingBalanceForOrder transaction failed:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Deducts from the vendor's available balance and creates a negative payout ledger entry.
 */
export async function payoutVendor(
    vendorId: string,
    amount: number,
    details: any
): Promise<{ success: boolean; newAvailable?: number; error?: string }> {
    const db = getAdminDb();
    try {
        const result = await db.runTransaction(async (transaction) => {
            const vendorRef = db.collection("vendors").doc(vendorId);
            const vendorSnap = await transaction.get(vendorRef);

            if (!vendorSnap.exists) {
                throw new Error("Vendor not found");
            }

            const vendorData = vendorSnap.data();
            const balanceAvailable = vendorData?.balanceAvailable || 0;

            if (balanceAvailable < amount) {
                throw new Error(`Insufficient funds. Available: GH₵ ${balanceAvailable.toFixed(2)}, Requesting: GH₵ ${amount.toFixed(2)}`);
            }

            const newAvailable = balanceAvailable - amount;

            transaction.update(vendorRef, {
                balanceAvailable: newAvailable,
                updatedAt: new Date()
            });

            const entryRef = db.collection("vendor_ledger_entries").doc();
            transaction.set(entryRef, {
                vendorId,
                type: "payout",
                amount: -amount,
                status: "completed",
                createdAt: new Date(),
                description: `Payout processed via ${details.payoutMethod}. Details: ${details.payoutAccount}`,
                payoutMethod: details.payoutMethod,
                payoutDetails: details
            });

            return { success: true, newAvailable };
        });
        return result;
    } catch (error: any) {
        console.error("payoutVendor transaction failed:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Processes a refund for an order.
 * Reverts any pending or available sale ledger entries associated with this order.
 */
export async function refundOrderBalances(orderId: string): Promise<{ success: boolean; error?: string }> {
    const db = getAdminDb();
    try {
        await db.runTransaction(async (transaction) => {
            // 1. Fetch all non-cancelled sale ledger entries for this order
            const entriesQuery = db.collection("vendor_ledger_entries")
                .where("orderId", "==", orderId)
                .where("type", "==", "sale");
            const entriesSnap = await transaction.get(entriesQuery);

            if (entriesSnap.empty) {
                console.log(`No sale ledger entries found for order ${orderId} to refund.`);
                return;
            }

            // Group entries that are active (pending or available)
            const activeEntries = entriesSnap.docs.filter(doc => {
                const status = doc.data().status;
                return status === "pending" || status === "available";
            });

            if (activeEntries.length === 0) {
                console.log(`No active (pending/available) sale ledger entries for order ${orderId} to refund.`);
                return;
            }

            const vendorIds = Array.from(new Set(activeEntries.map(doc => doc.data().vendorId)));
            const vendorRefs = vendorIds.map(id => db.collection("vendors").doc(id as string));
            const vendorSnaps = await Promise.all(vendorRefs.map(ref => transaction.get(ref)));

            const vendorDataMap: Record<string, any> = {};
            for (let i = 0; i < vendorIds.length; i++) {
                const snap = vendorSnaps[i];
                vendorDataMap[vendorIds[i] as string] = snap.exists ? snap.data() : { balancePending: 0, balanceAvailable: 0 };
            }

            for (const entryDoc of activeEntries) {
                const entry = entryDoc.data();
                const vendorId = entry.vendorId;
                const amount = entry.amount;
                const status = entry.status;

                const vendorRef = db.collection("vendors").doc(vendorId);
                const vendorInfo = vendorDataMap[vendorId];

                if (status === "pending") {
                    // Revert pending balance
                    const newPending = Math.max(0, (vendorInfo.balancePending || 0) - amount);
                    transaction.set(vendorRef, {
                        balancePending: newPending,
                        updatedAt: new Date()
                    }, { merge: true });

                    // Mark the original entry as cancelled
                    transaction.update(entryDoc.ref, {
                        status: "cancelled",
                        refundedAt: new Date()
                    });

                    // Log a refund ledger entry
                    const refundEntryRef = db.collection("vendor_ledger_entries").doc();
                    transaction.set(refundEntryRef, {
                        vendorId,
                        orderId,
                        type: "refund",
                        amount: -amount,
                        status: "cancelled",
                        createdAt: new Date(),
                        description: `Reverted pending sale credit due to order refund. Original ref: ${entryDoc.id}`
                    });

                    vendorInfo.balancePending = newPending;
                } else if (status === "available") {
                    // Revert available balance
                    const newAvailable = (vendorInfo.balanceAvailable || 0) - amount;
                    transaction.set(vendorRef, {
                        balanceAvailable: newAvailable,
                        updatedAt: new Date()
                    }, { merge: true });

                    // Mark the original entry as refunded
                    transaction.update(entryDoc.ref, {
                        refundedAt: new Date()
                    });

                    // Log a completed refund ledger entry
                    const refundEntryRef = db.collection("vendor_ledger_entries").doc();
                    transaction.set(refundEntryRef, {
                        vendorId,
                        orderId,
                        type: "refund",
                        amount: -amount,
                        status: "completed",
                        createdAt: new Date(),
                        description: `Deducted available balance due to order refund. Original ref: ${entryDoc.id}`
                    });

                    vendorInfo.balanceAvailable = newAvailable;
                }
            }
        });
        return { success: true };
    } catch (error: any) {
        console.error("refundOrderBalances transaction failed:", error);
        return { success: false, error: error.message };
    }
}
