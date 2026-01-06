// Script: fetch-besiktas-firestore-info.js
// Purpose: Fetch Besiktas team and product info from Firestore for debugging display issues.
// Usage: node scripts/fetch-besiktas-firestore-info.js

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

async function fetchBesiktasInfo() {
    // 1. Fetch from teams
    const teamsSnap = await db.collection('teams').where('name', '==', 'Besiktas').get();
    console.log('--- TEAMS COLLECTION ---');
    teamsSnap.forEach(doc => {
        console.log('ID:', doc.id, doc.data());
    });

    // 2. Fetch from custom_teams
    const customTeamsSnap = await db.collection('custom_teams').where('name', '==', 'Besiktas').get();
    console.log('--- CUSTOM_TEAMS COLLECTION ---');
    customTeamsSnap.forEach(doc => {
        console.log('ID:', doc.id, doc.data());
    });

    // 3. Fetch products by teamId or team name
    const productsByTeamId = await db.collection('products').where('teamId', '==', 'besiktas').get();
    const productsByTeamName = await db.collection('products').where('team', '==', 'Besiktas').get();
    console.log('--- PRODUCTS COLLECTION (teamId = besiktas) ---');
    productsByTeamId.forEach(doc => {
        console.log('ID:', doc.id, doc.data());
    });
    console.log('--- PRODUCTS COLLECTION (team = Besiktas) ---');
    productsByTeamName.forEach(doc => {
        console.log('ID:', doc.id, doc.data());
    });

    console.log('Fetch complete. Review the above output for mismatches or missing data.');
}

fetchBesiktasInfo().catch(e => { console.error(e); process.exit(1); });
