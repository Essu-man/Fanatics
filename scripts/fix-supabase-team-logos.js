// scripts/fix-supabase-team-logos.js
// This script fetches all files from the Supabase 'product-images/team-logos' folder,
// matches them to teams in Firestore by id or name, and updates the logo URL in Firestore.

const { createClient } = require('@supabase/supabase-js');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');


// --- CONFIG ---
const SUPABASE_URL = 'https://vjhkurmmzgudtzgxgijb.supabase.co';
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'product-images';
const FOLDER = 'team-logos';
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${FOLDER}`;

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

initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore();

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    // 1. List all files in the Supabase folder
    const { data: files, error } = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 200 });
    if (error) throw error;
    if (!files || files.length === 0) {
        console.log('No files found in Supabase bucket.');
        process.exit(0);
    }
    console.log('Found files in Supabase:', files.map(f => f.name));


    // 2. Fetch all teams from Firestore
    const snapshot = await db.collection('teams').get();
    const teams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), ref: doc.ref }));

    // 3. Try to match files to teams by id or name
    let updated = 0;
    for (const file of files) {
        if (!file.name) continue;

        // Remove timestamp prefix (assuming it's a number followed by a dash)
        const namePart = file.name.substring(file.name.indexOf('-') + 1).toLowerCase();
        const baseNameNoExt = namePart.replace(/\.[^/.]+$/, '');
        const cleanBaseName = baseNameNoExt.replace(/[^a-z0-9]/g, '');

        // Try to match by id in the name part
        let team = teams.find(t => namePart.includes(t.id.toLowerCase()));

        // If not found, try by clean name match
        if (!team) {
            team = teams.find(t => {
                if (!t.name) return false;
                const cleanTeamName = t.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                return cleanBaseName.includes(cleanTeamName) || cleanTeamName.includes(cleanBaseName);
            });
        }

        if (team) {
            const logoUrl = `${PUBLIC_BASE}/${file.name}`;
            await team.ref.update({ logo: logoUrl });
            console.log(`✅ Matched ${file.name} to ${team.name}. Updated logo to ${logoUrl}`);
            updated++;
        } else {
            console.log(`❌ No match found for: ${file.name}`);
        }
    }

    console.log(`Updated ${updated} team logos from Supabase.`);
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
