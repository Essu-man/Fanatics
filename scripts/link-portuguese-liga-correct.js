// scripts/link-portuguese-liga-correct.js
// Script to update Firestore teams to set league to 'Portuguese Liga' for Portuguese teams

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

const PORTUGUESE_TEAMS = [
    'Benfica', 'Porto', 'Sporting CP', 'Braga', 'V. Guimarães', 'Famalicão', 'Gil Vicente', 'Moreirense', 'Boavista', 'Rio Ave', 'Estoril', 'Arouca', 'Santa Clara', 'Casa Pia', 'Farense', 'Portimonense', 'Chaves', 'Estrela Amadora', 'Vizela'
];

async function linkPortugueseLiga() {
    for (const name of PORTUGUESE_TEAMS) {
        const snapshot = await db.collection('teams').where('name', '==', name).get();
        for (const doc of snapshot.docs) {
            await doc.ref.update({ league: 'Portuguese Liga' });
            console.log(`Linked ${name} to Portuguese Liga`);
        }
    }
    console.log('Portuguese Liga linking complete.');
    process.exit(0);
}

linkPortugueseLiga().catch(e => { console.error(e); process.exit(1); });
