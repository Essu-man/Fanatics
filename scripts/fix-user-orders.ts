/**
 * Migration Script: Fix User Orders
 * 
 * This script finds all orders with userId: null and matches them to users
 * by email address, then updates the orders with the correct userId.
 * 
 * Run with: npx tsx scripts/fix-user-orders.ts
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

// Initialize Firebase Admin
if (!initializeApp.length) {
    // Only initialize if not already initialized
    try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (serviceAccount) {
            initializeApp({
                credential: cert(JSON.parse(serviceAccount)),
            });
        } else {
            // Use default credentials (for local development with gcloud auth)
            initializeApp();
        }
    } catch (error) {
        console.error("Error initializing Firebase Admin:", error);
        process.exit(1);
    }
}

const db = getFirestore();

interface Order {
    id: string;
    userId: string | null;
    guestEmail: string | null;
    guestPhone: string | null;
    shipping?: {
        email?: string;
    };
}

interface UserProfile {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

async function fixUserOrders() {
    console.log("🔍 Starting order migration...\n");

    try {
        // Step 1: Get all orders with userId: null
        console.log("📦 Fetching orders with userId: null...");
        const ordersSnapshot = await db.collection("orders")
            .where("userId", "==", null)
            .get();

        if (ordersSnapshot.empty) {
            console.log("✅ No orders found with userId: null. Nothing to fix!");
            return;
        }

        console.log(`   Found ${ordersSnapshot.size} orders without userId\n`);

        // Step 2: Get all users
        console.log("👥 Fetching all users...");
        const usersSnapshot = await db.collection("users").get();
        const usersMap = new Map<string, UserProfile>();

        usersSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.email) {
                usersMap.set(data.email.toLowerCase(), {
                    uid: doc.id,
                    email: data.email,
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    role: data.role || "customer",
                });
            }
        });

        console.log(`   Found ${usersMap.size} users\n`);

        // Step 3: Match orders to users by email
        console.log("🔗 Matching orders to users...");
        let matched = 0;
        let notMatched = 0;
        const updates: Array<{ orderId: string; userId: string; email: string }> = [];

        ordersSnapshot.forEach((orderDoc) => {
            const orderData = orderDoc.data() as Order;
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

        console.log(`\n   Matched: ${matched} orders`);
        console.log(`   Not matched: ${notMatched} orders\n`);

        if (updates.length === 0) {
            console.log("✅ No orders to update. All done!");
            return;
        }

        // Step 4: Update orders
        console.log("💾 Updating orders...");
        const batch = db.batch();
        let batchCount = 0;
        const BATCH_SIZE = 500; // Firestore batch limit

        for (const update of updates) {
            const orderRef = db.collection("orders").doc(update.orderId);
            batch.update(orderRef, {
                userId: update.userId,
            });
            batchCount++;

            // Firestore batches are limited to 500 operations
            if (batchCount >= BATCH_SIZE) {
                await batch.commit();
                console.log(`   ✅ Committed batch of ${batchCount} updates`);
                batchCount = 0;
            }
        }

        // Commit remaining updates
        if (batchCount > 0) {
            await batch.commit();
            console.log(`   ✅ Committed final batch of ${batchCount} updates`);
        }

        console.log(`\n✅ Successfully updated ${updates.length} orders!`);
        console.log(`\n📊 Summary:`);
        console.log(`   - Total orders processed: ${ordersSnapshot.size}`);
        console.log(`   - Orders matched and updated: ${matched}`);
        console.log(`   - Orders not matched: ${notMatched}`);

    } catch (error) {
        console.error("❌ Error during migration:", error);
        process.exit(1);
    }
}

// Run the migration
fixUserOrders()
    .then(() => {
        console.log("\n🎉 Migration completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Migration failed:", error);
        process.exit(1);
    });

