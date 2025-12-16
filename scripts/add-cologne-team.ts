import admin from 'firebase-admin';
import * as fs from 'fs';

// Initialize Firebase Admin with your credentials
const serviceAccountPath = 'C:\\KEYS\\CEDIMAN.json';

let serviceAccount;
try {
    const data = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(data);
    console.log('✅ Credentials loaded successfully');
} catch (error) {
    console.error('❌ Error loading credentials:', error);
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

// FC Cologne team data
const cologneTeam = {
    id: 'cologne',
    name: 'FC Cologne',
    league: 'Bundesliga',
    sport: 'football',
    country: 'Germany',
    logo: 'https://logos-world.net/wp-content/uploads/2020/06/FC-Cologne-Logo.png',
    enabled: true,
};

async function addCologneTeam() {
    try {
        console.log('\n🔄 Adding FC Cologne to Firestore...\n');

        const teamsRef = db.collection('teams').doc(cologneTeam.id);
        const docSnapshot = await teamsRef.get();

        if (docSnapshot.exists) {
            console.log(`⚠️  Team already exists: ${cologneTeam.name}`);
            console.log('📋 Existing data:', docSnapshot.data());
            
            // Ask if user wants to update
            console.log('\n💡 To update this team, run with --force flag');
            return false;
        } else {
            await teamsRef.set(cologneTeam);
            console.log(`✅ Successfully added: ${cologneTeam.name}`);
            console.log(`   League: ${cologneTeam.league}`);
            console.log(`   Country: ${cologneTeam.country}`);
            console.log(`   Enabled: ${cologneTeam.enabled}`);
            return true;
        }
    } catch (error) {
        console.error('❌ Error adding team:', error);
        process.exit(1);
    }
}

async function verifyTeam() {
    try {
        console.log('\n✔️  Verifying FC Cologne in database...\n');

        const teamsRef = db.collection('teams');
        
        // Check if Cologne exists
        const cologneDoc = await teamsRef.doc('cologne').get();
        if (cologneDoc.exists) {
            console.log('✅ FC Cologne found in database:');
            console.log(JSON.stringify(cologneDoc.data(), null, 2));
        } else {
            console.log('❌ FC Cologne not found in database');
        }

        // Show all Bundesliga teams
        console.log('\n📊 All Bundesliga teams in database:');
        const bundesligaQuery = teamsRef.where('league', '==', 'Bundesliga');
        const snapshot = await bundesligaQuery.get();

        if (snapshot.empty) {
            console.log('❌ No Bundesliga teams found');
        } else {
            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const status = data.enabled ? '✅' : '❌';
                console.log(`   ${status} ${data.name} (ID: ${doc.id})`);
            });
        }
    } catch (error) {
        console.error('❌ Error verifying team:', error);
        process.exit(1);
    }
}

// Main
const command = process.argv[2];

(async () => {
    if (command === 'add') {
        const added = await addCologneTeam();
        if (added) {
            await verifyTeam();
        }
    } else if (command === 'verify') {
        await verifyTeam();
    } else {
        console.log(`
📖 FC Cologne Team Addition Script

Usage:
  ts-node scripts/add-cologne-team.ts add     - Add FC Cologne to Firestore
  ts-node scripts/add-cologne-team.ts verify  - Verify FC Cologne and show all Bundesliga teams

Examples:
  npx ts-node scripts/add-cologne-team.ts add
  npx ts-node scripts/add-cologne-team.ts verify
        `);
    }
    process.exit(0);
})();
