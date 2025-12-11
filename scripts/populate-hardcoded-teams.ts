import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, setDoc, doc, getDocs } from "firebase/firestore";
import { footballTeams, basketballTeams, internationalTeams } from "../lib/teams";

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function populateHardcodedTeams() {
    try {
        const teamsRef = collection(db, "teams");

        // Check if teams already exist
        const existingTeams = await getDocs(teamsRef);
        if (existingTeams.size > 0) {
            console.log(`Teams collection already has ${existingTeams.size} documents. Skipping population.`);
            return;
        }

        // Add football teams
        for (const team of footballTeams) {
            await setDoc(doc(teamsRef, team.id), {
                id: team.id,
                name: team.name,
                league: team.league,
                country: team.country,
                logo: team.logo,
                sport: "football",
                enabled: false, // Default to disabled, admin must enable
                isHardcoded: true,
                createdAt: new Date(),
            });
            console.log(`Added football team: ${team.name}`);
        }

        // Add basketball teams
        for (const team of basketballTeams) {
            await setDoc(doc(teamsRef, team.id), {
                id: team.id,
                name: team.name,
                league: team.league,
                logo: team.logo,
                sport: "basketball",
                enabled: false, // Default to disabled, admin must enable
                isHardcoded: true,
                createdAt: new Date(),
            });
            console.log(`Added basketball team: ${team.name}`);
        }

        // Add international teams
        for (const team of internationalTeams) {
            await setDoc(doc(teamsRef, team.id), {
                id: team.id,
                name: team.name,
                league: team.league,
                country: team.country,
                logo: team.logo,
                sport: "football",
                enabled: false, // Default to disabled, admin must enable
                isHardcoded: true,
                createdAt: new Date(),
            });
            console.log(`Added international team: ${team.name}`);
        }

        console.log("✅ Successfully populated all hardcoded teams!");
    } catch (error) {
        console.error("❌ Error populating teams:", error);
        process.exit(1);
    }
}

populateHardcodedTeams();
