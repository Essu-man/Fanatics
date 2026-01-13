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

const celtaVigo = {
    id: "celta-vigo",
    name: "Celta Vigo",
    league: "La Liga",
    country: "Spain",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Celta-Vigo-Logo.png",
    sport: "football",
    enabled: true
};

async function addCeltaVigo() {
    console.log('Starting to add Celta Vigo to La Liga...');

    try {
        // Check if team already exists
        const existingTeam = await db.collection('teams').doc(celtaVigo.id).get();

        if (existingTeam.exists) {
            console.log('⚠️  Celta Vigo already exists. Updating...');
            await db.collection('teams').doc(celtaVigo.id).update({
                league: celtaVigo.league,
                country: celtaVigo.country,
                logo: celtaVigo.logo,
                sport: celtaVigo.sport,
                enabled: true
            });
            console.log('✅ Updated Celta Vigo successfully!');
        } else {
            // Create new team
            await db.collection('teams').doc(celtaVigo.id).set(celtaVigo);
            console.log('✅ Added Celta Vigo to La Liga successfully!');
        }

        console.log('\nTeam Details:');
        console.log('ID:', celtaVigo.id);
        console.log('Name:', celtaVigo.name);
        console.log('League:', celtaVigo.league);
        console.log('Country:', celtaVigo.country);
        console.log('Sport:', celtaVigo.sport);
        console.log('\n✅ Celta Vigo is now available in the teams dropdown for adding new products!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding Celta Vigo:', error);
        process.exit(1);
    }
}

addCeltaVigo();
