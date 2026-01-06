// Script: link-turkish-league-teams.js
// Purpose: Link Besiktas and all teams under the Turkish league (even if inactive) to products so they show under 'others' by default, avoiding repeated relinking.
// Usage: node scripts/link-turkish-league-teams.js

const { getAllTeams, updateProductTeamLinks } = require('../lib/teamProducts');
const { getAllProducts, updateProduct } = require('../lib/products');
const { leagueMapping } = require('../lib/league-mapping');

const TURKISH_LEAGUE_KEY = 'turkish_super_lig'; // Adjust if your league mapping uses a different key

async function main() {
  // 1. Get all Turkish league teams (including inactive)
  const allTeams = await getAllTeams();
  const turkishTeams = allTeams.filter(team => team.league === TURKISH_LEAGUE_KEY);

  // 2. Get all products
  const allProducts = await getAllProducts();

  // 3. For each product, ensure all Turkish teams are linked (if not already)
  for (const product of allProducts) {
    const currentTeamIds = product.teamIds || [];
    const missingTeamIds = turkishTeams
      .map(team => team.id)
      .filter(id => !currentTeamIds.includes(id));

    if (missingTeamIds.length > 0) {
      const newTeamIds = [...currentTeamIds, ...missingTeamIds];
      await updateProduct(product.id, { teamIds: newTeamIds });
      console.log(`Updated product ${product.id} with Turkish teams.`);
    }
  }

  console.log('All Turkish league teams linked to products.');
}

main().catch(err => {
  console.error('Error linking Turkish league teams:', err);
  process.exit(1);
});
