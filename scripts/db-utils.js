// db-utils.js
// Utility to add a team to your database. Adjust this to your DB logic.


const { getAdminFirestore } = require('./firebase-admin-cjs');

async function addTeamToDatabase(team) {
    const db = getAdminFirestore();
    await db.collection('teams').doc(team.id).set({
        ...team,
        sport: team.sport || 'football',
    }, { merge: true });
    console.log(`Added team to Firestore:`, team);
}

module.exports = { addTeamToDatabase };
