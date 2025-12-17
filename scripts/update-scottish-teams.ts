import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, updateDoc } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateScottishTeams() {
    try {
        const teams = [
            { id: "celtic", name: "Celtic", league: "Scottish League", country: "Scotland" },
            { id: "rangers", name: "Rangers", league: "Scottish League", country: "Scotland" }
        ];

        for (const team of teams) {
            const teamRef = doc(db, "teams", team.id);
            await updateDoc(teamRef, {
                league: "Scottish League"
            });
            console.log(`✓ Updated ${team.name} to Scottish League`);
        }

        console.log("\n✓ Successfully updated all Scottish teams!");
        process.exit(0);
    } catch (error) {
        console.error("Error updating Scottish teams:", error);
        process.exit(1);
    }
}

updateScottishTeams();
