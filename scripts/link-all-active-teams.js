// scripts/link-all-active-teams.js
// This script links all active teams in Firestore to their correct leagues based on the hardcoded list in lib/teams.ts.
// It ensures that:
// - Al Nassr and Inter Miami are in 'Others'
// - Turkish teams are in 'Others'
// - Portuguese teams are in 'Portuguese Liga'
// - All other teams are linked to their correct league

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

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

// Load hardcoded teams from lib/teams.ts
const teamsPath = path.join(__dirname, '../lib/teams.ts');
const teamsFile = fs.readFileSync(teamsPath, 'utf-8');

// Simple regex to extract team objects from the footballTeams array
const teamRegex = /\{\s*id: "([^"]+)",\s*name: "([^"]+)",\s*league: "([^"]+)",\s*country: "([^"]+)",\s*logo: "([^"]+)"/g;
const hardcodedTeams = [];
let match;
while ((match = teamRegex.exec(teamsFile)) !== null) {
    hardcodedTeams.push({
        id: match[1],
        name: match[2],
        league: match[3],
        country: match[4],
        logo: match[5],
    });
}

async function linkAllActiveTeams() {
    for (const team of hardcodedTeams) {
        const snapshot = await db.collection('teams').where('id', '==', team.id).get();
        for (const doc of snapshot.docs) {
            await doc.ref.update({
                league: team.league,
                country: team.country,
                logo: team.logo,
                enabled: true,
            });
            console.log(`Linked ${team.name} to ${team.league}`);
        }
    }
    console.log('All active teams linked to their correct leagues.');
    process.exit(0);
}

linkAllActiveTeams().catch(e => { console.error(e); process.exit(1); });
