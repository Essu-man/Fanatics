import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, updateDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const runtime = "nodejs";

/**
 * API Route to fix orders with userId: null
 * Matches orders to users by email and updates them
 * 
 * POST /api/admin/fix-user-orders
 */
export async function POST(request: NextRequest) {
    try {
        console.log("🔍 Starting order migration...");

        // Step 1: Get all orders with userId: null
        console.log("📦 Fetching orders with userId: null...");
        const ordersQuery = query(
            collection(db, "orders"),
            where("userId", "==", null)
        );
        const ordersSnapshot = await getDocs(ordersQuery);

        if (ordersSnapshot.empty) {
            return NextResponse.json({
                success: true,
                message: "No orders found with userId: null. Nothing to fix!",
                stats: {
                    total: 0,
                    matched: 0,
                    notMatched: 0,
                    updated: 0,
                },
            });
        }

        console.log(`   Found ${ordersSnapshot.size} orders without userId`);

        // Step 2: Get all users
        console.log("👥 Fetching all users...");
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        const usersMap = new Map<string, { uid: string; email: string }>();

        usersSnapshot.forEach((userDoc) => {
            const data = userDoc.data();
            if (data.email) {
                usersMap.set(data.email.toLowerCase(), {
                    uid: userDoc.id,
                    email: data.email,
                });
            }
        });

        console.log(`   Found ${usersMap.size} users`);

        // Step 3: Match orders to users by email
        console.log("🔗 Matching orders to users...");
        let matched = 0;
        let notMatched = 0;
        const updates: Array<{ orderId: string; userId: string; email: string }> = [];

        ordersSnapshot.forEach((orderDoc) => {
            const orderData = orderDoc.data();
            const orderId = orderDoc.id;

            // Get email from order (try guestEmail first, then shipping.email)
            const orderEmail = orderData.guestEmail || orderData.shipping?.email;

            if (!orderEmail) {
                console.log(`   ⚠️  Order ${orderId}: No email found, skipping`);
                notMatched++;
                return;
            }

            // Find matching user by email (case-insensitive)
            const user = usersMap.get(orderEmail.toLowerCase());

            if (user) {
                console.log(`   ✅ Order ${orderId}: Matched to user ${user.uid} (${user.email})`);
                updates.push({
                    orderId,
                    userId: user.uid,
                    email: orderEmail,
                });
                matched++;
            } else {
                console.log(`   ❌ Order ${orderId}: No user found for email ${orderEmail}`);
                notMatched++;
            }
        });

        console.log(`   Matched: ${matched} orders`);
        console.log(`   Not matched: ${notMatched} orders`);

        if (updates.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No orders to update. All done!",
                stats: {
                    total: ordersSnapshot.size,
                    matched: 0,
                    notMatched,
                    updated: 0,
                },
            });
        }

        // Step 4: Update orders in batches
        console.log("💾 Updating orders...");
        const BATCH_SIZE = 500; // Firestore batch limit
        let updated = 0;

        for (let i = 0; i < updates.length; i += BATCH_SIZE) {
            const batch = writeBatch(db);
            const batchUpdates = updates.slice(i, i + BATCH_SIZE);

            for (const update of batchUpdates) {
                const orderRef = doc(db, "orders", update.orderId);
                batch.update(orderRef, {
                    userId: update.userId,
                });
            }

            await batch.commit();
            updated += batchUpdates.length;
            console.log(`   ✅ Committed batch: ${batchUpdates.length} updates (${updated}/${updates.length} total)`);
        }

        console.log(`✅ Successfully updated ${updated} orders!`);

        return NextResponse.json({
            success: true,
            message: `Successfully updated ${updated} orders!`,
            stats: {
                total: ordersSnapshot.size,
                matched,
                notMatched,
                updated,
            },
            updates: updates.map((u) => ({
                orderId: u.orderId,
                userId: u.userId,
                email: u.email,
            })),
        });
    } catch (error: any) {
        console.error("❌ Error during migration:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fix user orders",
            },
            { status: 500 }
        );
    }
}

