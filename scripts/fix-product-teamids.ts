import { initializeApp, getApps } from "firebase/app";
import {
    getFirestore,
    collection,
    getDocs,
    updateDoc,
    doc,
} from "firebase/firestore";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load environment variables
dotenv.config({ path: ".env.local" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const apps = getApps();
const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
const db = getFirestore(app);

/**
 * Migration script to fix existing products with incorrect teamIds
 * This script finds products with kebab-case teamIds and updates them
 * to use the correct Firestore custom_teams document IDs
 */

async function fixProductTeamIds() {
    try {
        console.log("Starting product teamId migration...\n");

        // Step 1: Get all custom teams from Firestore
        const customTeamsSnapshot = await getDocs(collection(db, "custom_teams"));
        const customTeamsMap = new Map<string, string>(); // kebab-case name -> actual ID

        customTeamsSnapshot.docs.forEach((doc) => {
            const teamData = doc.data();
            const kebabCaseName = teamData.name
                .toLowerCase()
                .replace(/\s+/g, "-");
            customTeamsMap.set(kebabCaseName, doc.id); // Map kebab-case to actual ID
            console.log(
                `Found custom team: ${teamData.name} -> ID: ${doc.id}`
            );
        });

        console.log(`\nTotal custom teams: ${customTeamsMap.size}\n`);

        // Step 2: Get all products
        const productsSnapshot = await getDocs(collection(db, "products"));
        let fixedCount = 0;
        let skippedCount = 0;

        console.log("Processing products...\n");

        // Step 3: Check each product and update if needed
        for (const productDoc of productsSnapshot.docs) {
            const productData = productDoc.data();
            const currentTeamId = productData.teamId;

            // Check if this teamId is a kebab-case name (needs fixing)
            if (customTeamsMap.has(currentTeamId)) {
                const correctTeamId = customTeamsMap.get(currentTeamId);

                console.log(`Fixing product: ${productData.name}`);
                console.log(`  Old teamId: ${currentTeamId}`);
                console.log(`  New teamId: ${correctTeamId}`);

                // Update the product with correct teamId
                await updateDoc(doc(db, "products", productDoc.id), {
                    teamId: correctTeamId,
                });

                fixedCount++;
            } else {
                // Product either has a correct ID or is for a predefined team
                skippedCount++;
            }
        }

        console.log(`\n✅ Migration complete!`);
        console.log(`   Fixed: ${fixedCount} products`);
        console.log(`   Skipped: ${skippedCount} products`);
        process.exit(0);
    } catch (error) {
        console.error("Error during migration:", error);
        process.exit(1);
    }
}

// Run the migration
fixProductTeamIds();
