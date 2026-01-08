// Script to populate the database with the latest 'Others' teams
// Usage: node scripts/populate-rest-of-world-teams.js

const { footballTeams } = require('./teams-cjs');
const { addTeamToDatabase } = require('./db-utils'); // You must implement this utility for your DB

async function main() {
    // Filter for the new teams added to 'Others'
    const newTeams = footballTeams.filter(team =>
        ["santos-fc", "huddersfield", "venezia"].includes(team.id)
    );

    for (const team of newTeams) {
        try {
            await addTeamToDatabase(team);
            console.log(`Added ${team.name} to the database.`);
        } catch (error) {
            console.error(`Failed to add ${team.name}:`, error);
        }
    }
}

main().catch(console.error);
