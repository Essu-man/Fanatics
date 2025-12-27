const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Firebase service account
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else {
    const localPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'C:/Keys/cediman.json';
    if (!fs.existsSync(localPath)) {
        throw new Error('Firebase Service Account not found. Set FIREBASE_SERVICE_ACCOUNT_JSON or ensure file exists.');
    }
    serviceAccount = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
}

if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && !serviceAccount.project_id) {
    throw new Error('Firebase Project ID not found.');
}

initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const db = getFirestore();

const portugueseTeams = [
    { id: "benfica", name: "Benfica" },
    { id: "porto", name: "Porto" },
    { id: "sporting-cp", name: "Sporting CP" },
    { id: "braga", name: "Braga" },
    { id: "v-guimaraes", name: "V. Guimarães" },
    { id: "famalicao", name: "Famalicão" },
    { id: "rio-ave", name: "Rio Ave" },
    { id: "arouca", name: "Arouca" },
    { id: "gil-vicente", name: "Gil Vicente" },
    { id: "avs-futebol", name: "AVS Futebol SAD" }
];


const TARGET_LEAGUE = "Portuguese Liga";

async function linkTeams() {
    console.log(`Starting to link teams to ${TARGET_LEAGUE}...`);
    let linkedCount = 0;

    for (const team of portugueseTeams) {
        // Try to find by ID first
        let teamDoc = await db.collection('teams').doc(team.id).get();

        if (!teamDoc.exists) {
            // Try to find by name if ID doesn't match
            const snapshot = await db.collection('teams').where('name', '==', team.name).get();
            if (!snapshot.empty) {
                teamDoc = snapshot.docs[0];
            } else if (team.name === "FC Porto") {
                // Try just "Porto"
                const portoSnapshot = await db.collection('teams').where('name', '==', 'Porto').get();
                if (!portoSnapshot.empty) teamDoc = portoSnapshot.docs[0];
            } else if (team.name === "Vitoria Guimarães") {
                // Try "V. Guimarães"
                const vSnapshot = await db.collection('teams').where('name', '==', 'V. Guimarães').get();
                if (!vSnapshot.empty) teamDoc = vSnapshot.docs[0];
            }
        }

        if (teamDoc.exists || (teamDoc.docs && teamDoc.docs.length > 0)) {
            const docRef = teamDoc.ref || teamDoc;
            await docRef.update({
                league: TARGET_LEAGUE,
                enabled: true
            });
            console.log(`✅ Linked ${team.name} to ${TARGET_LEAGUE}`);
            linkedCount++;
        } else {
            console.log(`❌ Team ${team.name} not found in database. Skipping.`);
        }
    }

    console.log(`\nFinished! Total teams linked: ${linkedCount}`);
    process.exit(0);
}

linkTeams().catch(err => {
    console.error('Error linking teams:', err);
    process.exit(1);
});
