import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = 'C:/KEYS/CEDIMAN.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function enablePremierLeagueTeams() {
    try {
        console.log('🔍 Fetching Premier League teams from Firestore...');

        // Get all Premier League teams
        const teamsSnapshot = await db
            .collection('teams')
            .where('league', '==', 'Premier League')
            .get();

        console.log(`Found ${teamsSnapshot.docs.length} Premier League teams`);

        if (teamsSnapshot.empty) {
            console.log('⚠️  No Premier League teams found. Checking database...');

            // List all unique leagues
            const allTeamsSnapshot = await db.collection('teams').get();
            const leagues = new Set<string>();

            allTeamsSnapshot.docs.forEach((doc) => {
                const league = doc.data().league;
                if (league) {
                    leagues.add(league);
                }
            });

            console.log('📋 Available leagues in database:');
            leagues.forEach((league) => console.log(`   - ${league}`));
            return;
        }

        // Enable all Premier League teams
        let updated = 0;
        const batch = db.batch();

        for (const doc of teamsSnapshot.docs) {
            const data = doc.data();
            console.log(`✏️  Updating: ${data.name} (enabled: ${data.enabled} → true)`);

            batch.update(doc.ref, { enabled: true });
            updated++;
        }

        await batch.commit();
        console.log(`✅ Successfully enabled ${updated} Premier League teams!\n`);

        // Show summary
        console.log('📊 Summary:');
        console.log(`   - Total teams updated: ${updated}`);
        console.log(`   - League: Premier League`);
        console.log(`   - Status: All teams are now ENABLED`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

async function checkLeagueStatus() {
    try {
        console.log('🔍 Checking league and team status...\n');

        // Get all leagues
        const customLeaguesSnapshot = await db.collection('custom_leagues').get();
        const leagues = customLeaguesSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            sport: doc.data().sport,
        }));

        console.log('📍 Custom Leagues:');
        leagues.forEach((league) => {
            console.log(`   - ${league.name} (${league.sport})`);
        });

        console.log('\n📍 Hardcoded Teams by League:');

        // Get all teams and group by league
        const teamsSnapshot = await db.collection('teams').get();
        const teamsByLeague: Record<string, any[]> = {};

        teamsSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            const league = data.league || 'Unknown';

            if (!teamsByLeague[league]) {
                teamsByLeague[league] = [];
            }

            teamsByLeague[league].push({
                id: doc.id,
                name: data.name,
                enabled: data.enabled,
                sport: data.sport,
            });
        });

        Object.entries(teamsByLeague).forEach(([league, teams]) => {
            const enabledCount = teams.filter((t) => t.enabled).length;
            console.log(`   - ${league}: ${teams.length} teams (${enabledCount} enabled)`);
            teams.forEach((team) => {
                const status = team.enabled ? '✅' : '❌';
                console.log(`      ${status} ${team.name}`);
            });
        });

        // Check for Premier League specifically
        console.log('\n🔎 Premier League Status:');
        const premierTeams = teamsByLeague['Premier League'] || [];
        if (premierTeams.length === 0) {
            console.log('   ⚠️  No Premier League teams found!');
        } else {
            const enabledCount = premierTeams.filter((t) => t.enabled).length;
            console.log(`   - Total teams: ${premierTeams.length}`);
            console.log(`   - Enabled: ${enabledCount}`);
            console.log(`   - Disabled: ${premierTeams.length - enabledCount}`);

            if (enabledCount < premierTeams.length) {
                console.log('\n   💡 Run "npm run enable-premier-league" to enable all Premier League teams');
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Main execution
const command = process.argv[2];

if (command === 'enable') {
    enablePremierLeagueTeams().then(() => {
        process.exit(0);
    });
} else if (command === 'check' || !command) {
    checkLeagueStatus().then(() => {
        process.exit(0);
    });
} else {
    console.log('Usage:');
    console.log('  npm run check-leagues              - Check league and team status');
    console.log('  npm run enable-premier-league      - Enable all Premier League teams');
    process.exit(0);
}
