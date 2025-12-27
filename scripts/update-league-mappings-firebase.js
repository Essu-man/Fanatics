// scripts/update-league-mappings-firebase.js
// Script to update Firestore teams to reflect new league mappings (collapse Turkish, Scottish, etc. to 'Others')

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

// Load service account
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

initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const db = getFirestore();

const OTHERS_LEAGUES = [
    'Süper Lig', 'Super Lig', 'Turkey', 'Turkish',
    'Scottish League', 'Scottish Premiership',
    'Primeira Liga', 'Portugal',
    'Eredivisie', 'Dutch', 'Netherlands'
];

const GHANA_LEAGUE = 'Ghana Premier League';
const GHANA_TEAMS = [
    'Asante Kotoko',
    'Hearts of Oak',
    // Add more Ghana teams here if needed
];

async function updateLeagues() {
    // 1. Update all teams in OTHERS_LEAGUES to 'Others'
    for (const league of OTHERS_LEAGUES) {
        const snapshot = await db.collection('teams').where('league', '==', league).get();
        for (const doc of snapshot.docs) {
            await doc.ref.update({ league: 'Others' });
            console.log(`Updated team ${doc.id} (${doc.data().name}) to 'Others'`);
        }
    }

    // 2. Ensure only Ghana teams are in Ghana Premier League
    const ghanaSnapshot = await db.collection('teams').where('league', '==', GHANA_LEAGUE).get();
    for (const doc of ghanaSnapshot.docs) {
        if (!GHANA_TEAMS.includes(doc.data().name)) {
            await doc.ref.update({ league: 'Others' });
            console.log(`Moved ${doc.data().name} from Ghana Premier League to 'Others'`);
        }
    }

    console.log('League update complete.');
    process.exit(0);
}

updateLeagues().catch(e => { console.error(e); process.exit(1); });
