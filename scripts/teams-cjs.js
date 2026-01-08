// This file re-exports the footballTeams array for CommonJS usage
const teams = require('../lib/teams.ts');

module.exports = {
    footballTeams: teams.footballTeams,
};
