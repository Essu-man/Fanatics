// scripts/update-league-mappings.js
// Script to update teams in the database to reflect new league mappings (collapse Turkish, Scottish, etc. to 'Others')


async function getSupabaseAdmin() {
    const mod = await import('../lib/supabase.js');
    return mod.supabaseAdmin;
}

// List of league names to collapse into 'Others'
const OTHERS_LEAGUES = [
    'Süper Lig', 'Super Lig', 'Turkey', 'Turkish',
    'Scottish League', 'Scottish Premiership',
    'Primeira Liga', 'Portugal',
    'Eredivisie', 'Dutch', 'Netherlands'
];

// Ghana Premier League should only have Ghana teams
const GHANA_LEAGUE = 'Ghana Premier League';
const GHANA_TEAMS = [
    'Asante Kotoko',
    'Hearts of Oak',
    // Add more Ghana teams here if needed
];

async function updateLeagues() {
    const supabaseAdmin = await getSupabaseAdmin();
    // 1. Update all teams in OTHERS_LEAGUES to 'Others'
    for (const league of OTHERS_LEAGUES) {
        const { error } = await supabaseAdmin
            .from('teams')
            .update({ league: 'Others' })
            .eq('league', league);
        if (error) console.error(`Error updating league ${league}:`, error);
        else console.log(`Updated teams in league '${league}' to 'Others'`);
    }

    // 2. Ensure only Ghana teams are in Ghana Premier League
    const { data: ghanaTeams, error: ghanaError } = await supabaseAdmin
        .from('teams')
        .select('id, name, league')
        .eq('league', GHANA_LEAGUE);
    if (ghanaError) {
        console.error('Error fetching Ghana Premier League teams:', ghanaError);
    } else {
        for (const team of ghanaTeams) {
            if (!GHANA_TEAMS.includes(team.name)) {
                // Move non-Ghana teams to 'Others'
                const { error } = await supabaseAdmin
                    .from('teams')
                    .update({ league: 'Others' })
                    .eq('id', team.id);
                if (error) console.error(`Error moving ${team.name} to Others:`, error);
                else console.log(`Moved ${team.name} to 'Others'`);
            }
        }
    }

    console.log('League update complete.');
}

updateLeagues();
