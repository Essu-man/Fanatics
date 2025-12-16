import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";

export async function enablePremierLeagueTeams() {
    try {
        // Get all Premier League teams from hardcoded teams
        const teamsRef = collection(db, "teams");
        const premierQuery = query(
            teamsRef,
            where("league", "==", "Premier League")
        );
        const snapshot = await getDocs(premierQuery);

        console.log(`Found ${snapshot.docs.length} Premier League teams`);

        let updated = 0;
        for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            console.log(
                `Updating team: ${data.name} (enabled: ${data.enabled} -> true)`
            );
            await updateDoc(doc(db, "teams", docSnapshot.id), {
                enabled: true,
            });
            updated++;
        }

        console.log(`✅ Successfully enabled ${updated} Premier League teams`);
        return { success: true, updated };
    } catch (error) {
        console.error("❌ Error enabling Premier League teams:", error);
        throw error;
    }
}

// This can be called from an API endpoint or script
// Example: Call this in your admin panel or API
