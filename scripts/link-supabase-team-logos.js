// scripts/link-supabase-team-logos.js
// This script updates all team logo URLs in Firestore to use the Supabase bucket 'team-logos'.
// It assumes the logo file is named <team-id>.png in the bucket.

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

// Supabase public URL pattern (replace <project-ref> with your actual project ref)
const SUPABASE_PROJECT_REF = '<your-project-ref>';
const SUPABASE_BUCKET = 'team-logos';
const SUPABASE_BASE = `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/${SUPABASE_BUCKET}`;
const LOGO_EXT = 'png';

async function updateTeamLogos() {
    const snapshot = await db.collection('teams').get();
    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (!data.id) continue;
        const newLogo = `${SUPABASE_BASE}/${data.id}.${LOGO_EXT}`;
        await doc.ref.update({ logo: newLogo });
        console.log(`Updated ${data.name} logo to ${newLogo}`);
    }
    console.log('All team logos updated to Supabase URLs.');
    process.exit(0);
}

updateTeamLogos().catch(e => { console.error(e); process.exit(1); });
