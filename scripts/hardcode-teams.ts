import admin from 'firebase-admin';
import * as fs from 'fs';
import path from 'path';

// Initialize Firebase Admin with your credentials
const serviceAccountPath = 'C:\\KEYS\\CEDIMAN.json';

let serviceAccount;
try {
    const data = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(data);
    console.log('Credentials loaded successfully');
} catch (error) {
    console.error('Error loading credentials:', error);
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

// New teams to add
const newTeams = [
    // Rest of World / Others
    {
        id: 'al-nassr',
        name: 'Al Nassr',
        league: 'Others',
        sport: 'football',
        country: 'Saudi Arabia',
        logo: 'https://upload.wikimedia.org/wikipedia/en/8/8d/Al_Nassr_FC_Logo.png',
        enabled: true,
    },
    {
        id: 'inter-miami',
        name: 'Inter Miami',
        league: 'Others',
        sport: 'football',
        country: 'United States',
        logo: 'https://upload.wikimedia.org/wikipedia/en/a/a8/Inter_Miami_CF_logo.svg',
        enabled: true,
    },
    // Ghana Premier
    {
        id: 'kotoko',
        name: 'Asante Kotoko',
        league: 'Ghana Premier League',
        sport: 'football',
        country: 'Ghana',
        logo: 'https://upload.wikimedia.org/wikipedia/en/5/5e/Asante_Kotoko_Logo.png',
        enabled: true,
    },
    {
        id: 'hearts-of-oak',
        name: 'Hearts of Oak',
        league: 'Ghana Premier League',
        sport: 'football',
        country: 'Ghana',
        logo: 'https://upload.wikimedia.org/wikipedia/en/3/39/Accra_Hearts_of_Oak_Logo.png',
        enabled: true,
    },
];

async function addNewTeams() {
    try {
        console.log('🔄 Adding new teams to Firestore...\n');

        let added = 0;
        for (const team of newTeams) {
            try {
                const teamsRef = db.collection('teams').doc(team.id);
                const docSnapshot = await teamsRef.get();

                if (docSnapshot.exists) {
                    console.log(`⚠️  Team already exists: ${team.name}`);
                } else {
                    await teamsRef.set(team);
                    console.log(`✅ Added: ${team.name} (${team.league})`);
                    added++;
                }
            } catch (error) {
                console.error(`❌ Error adding ${team.name}:`, error);
            }
        }

        console.log(`\n✅ Successfully added ${added} new teams!`);
        return added;
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

async function enablePremierLeagueTeams() {
    try {
        console.log('🔄 Enabling Premier League teams...\n');

        const teamsRef = db.collection('teams');
        const premierQuery = teamsRef.where('league', '==', 'Premier League');
        const snapshot = await premierQuery.get();

        let updated = 0;
        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (!data.enabled) {
                await doc.ref.update({ enabled: true });
                console.log(`✅ Enabled: ${data.name}`);
                updated++;
            }
        }

        console.log(`\n✅ Successfully enabled ${updated} Premier League teams!`);
        return updated;
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

async function enableAllLeagueTeams() {
    try {
        console.log('🔄 Enabling all league teams...\n');

        const teamsRef = db.collection('teams');
        const allTeams = await teamsRef.get();

        let updated = 0;
        for (const doc of allTeams.docs) {
            const data = doc.data();
            if (!data.enabled) {
                await doc.ref.update({ enabled: true });
                console.log(`✅ Enabled: ${data.name}`);
                updated++;
            }
        }

        console.log(`\n✅ Successfully enabled ${updated} teams total!`);
        return updated;
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

async function showTeamStatus() {
    try {
        console.log('📊 Current team status:\n');

        const teamsRef = db.collection('teams');
        const allTeams = await teamsRef.get();

        // Group by league
        const byLeague: Record<string, any[]> = {};
        allTeams.docs.forEach((doc) => {
            const data = doc.data();
            const league = data.league || 'Unknown';
            if (!byLeague[league]) {
                byLeague[league] = [];
            }
            byLeague[league].push({
                id: doc.id,
                name: data.name,
                enabled: data.enabled,
            });
        });

        // Show summary
        Object.entries(byLeague).forEach(([league, teams]) => {
            const enabledCount = teams.filter((t) => t.enabled).length;
            const disabledCount = teams.filter((t) => !t.enabled).length;
            console.log(`\n${league}:`);
            console.log(`  Total: ${teams.length} | Enabled: ${enabledCount} | Disabled: ${disabledCount}`);

            teams.forEach((team) => {
                const status = team.enabled ? '✅' : '❌';
                console.log(`    ${status} ${team.name}`);
            });
        });

        return byLeague;
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Main
const command = process.argv[2];

if (command === 'add') {
    addNewTeams().then(() => process.exit(0));
} else if (command === 'enable-premier') {
    enablePremierLeagueTeams().then(() => process.exit(0));
} else if (command === 'enable-all') {
    enableAllLeagueTeams().then(() => process.exit(0));
} else if (command === 'status' || !command) {
    showTeamStatus().then(() => process.exit(0));
} else {
    console.log(`Usage:
  npm run teams-status              - Show current team status
  npm run add-new-teams             - Add new teams (Al Nassr, Inter Miami, Kotoko, Hearts of Oak)
  npm run enable-premier-league     - Enable Premier League teams
  npm run enable-all-teams          - Enable all teams
    `);
    process.exit(0);
}
