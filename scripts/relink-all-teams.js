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

initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const db = getFirestore();

// We'll define the mapping here directly to be safe and avoid TS parsing issues in a JS script
const teamLeagueLinks = [
    // Premier League
    { id: "man-utd", league: "Premier League" },
    { id: "man-city", league: "Premier League" },
    { id: "liverpool", league: "Premier League" },
    { id: "chelsea", league: "Premier League" },
    { id: "arsenal", league: "Premier League" },
    { id: "tottenham", league: "Premier League" },
    { id: "newcastle", league: "Premier League" },
    { id: "brighton", league: "Premier League" },
    { id: "west-ham", league: "Premier League" },
    { id: "aston-villa", league: "Premier League" },
    { id: "crystal-palace", league: "Premier League" },
    { id: "fulham", league: "Premier League" },
    { id: "brentford", league: "Premier League" },
    { id: "everton", league: "Premier League" },
    { id: "wolves", league: "Premier League" },
    { id: "bournemouth", league: "Premier League" },
    { id: "nottingham", league: "Premier League" },
    { id: "luton", league: "Premier League" },
    { id: "burnley", league: "Premier League" },
    { id: "sheffield", league: "Premier League" },
    { id: "leeds-united", league: "Premier League" },

    // La Liga
    { id: "real-madrid", league: "La Liga" },
    { id: "barcelona", league: "La Liga" },
    { id: "atletico", league: "La Liga" },
    { id: "sevilla", league: "La Liga" },
    { id: "valencia", league: "La Liga" },
    { id: "villarreal", league: "La Liga" },
    { id: "real-sociedad", league: "La Liga" },
    { id: "athletic", league: "La Liga" },
    { id: "betis", league: "La Liga" },
    { id: "osasuna", league: "La Liga" },

    // Serie A
    { id: "juventus", league: "Serie A" },
    { id: "milan", league: "Serie A" },
    { id: "inter", league: "Serie A" },
    { id: "napoli", league: "Serie A" },
    { id: "roma", league: "Serie A" },
    { id: "lazio", league: "Serie A" },
    { id: "atalanta", league: "Serie A" },
    { id: "fiorentina", league: "Serie A" },

    // Bundesliga
    { id: "bayern", league: "Bundesliga" },
    { id: "dortmund", league: "Bundesliga" },
    { id: "leipzig", league: "Bundesliga" },
    { id: "leverkusen", league: "Bundesliga" },
    { id: "frankfurt", league: "Bundesliga" },
    { id: "cologne", league: "Bundesliga" },

    // Ligue 1
    { id: "psg", league: "Ligue 1" },
    { id: "monaco", league: "Ligue 1" },
    { id: "lyon", league: "Ligue 1" },
    { id: "marseille", league: "Ligue 1" },
    { id: "lille", league: "Ligue 1" },

    // Portuguese Liga
    { id: "porto", league: "Portuguese Liga" },
    { id: "benfica", league: "Portuguese Liga" },
    { id: "sporting-cp", league: "Portuguese Liga" },
    { id: "braga", league: "Portuguese Liga" },
    { id: "v-guimaraes", league: "Portuguese Liga" },
    { id: "famalicao", league: "Portuguese Liga" },
    { id: "gil-vicente", league: "Portuguese Liga" },
    { id: "moreirense", league: "Portuguese Liga" },
    { id: "boavista", league: "Portuguese Liga" },
    { id: "rio-ave", league: "Portuguese Liga" },
    { id: "estoril", league: "Portuguese Liga" },
    { id: "arouca", league: "Portuguese Liga" },
    { id: "santa-clara", league: "Portuguese Liga" },
    { id: "casa-pia", league: "Portuguese Liga" },
    { id: "farense", league: "Portuguese Liga" },
    { id: "portimonense", league: "Portuguese Liga" },
    { id: "chaves", league: "Portuguese Liga" },
    { id: "estrela-amadora", league: "Portuguese Liga" },
    { id: "vizela", league: "Portuguese Liga" },
    { id: "avs-futebol", league: "Portuguese Liga" },

    // Ghana Premier League
    { id: "kotoko", league: "Ghana Premier League" },
    { id: "hearts-of-oak", league: "Ghana Premier League" },

    // Others
    { id: "galatasaray", league: "Others" },
    { id: "fenerbahce", league: "Others" },
    { id: "besiktas", league: "Others" },
    { id: "al-nassr", league: "Others" },
    { id: "inter-miami", league: "Others" },
    { id: "ajax", league: "Others" },
    { id: "celtic", league: "Others" },
    { id: "rangers", league: "Others" }
];

async function relinkAll() {
    console.log("Starting comprehensive relinking...");
    let updated = 0;

    for (const link of teamLeagueLinks) {
        const docRef = db.collection('teams').doc(link.id);
        const doc = await docRef.get();

        if (doc.exists) {
            await docRef.update({
                league: link.league,
                enabled: true
            });
            console.log(`✅ Relinked ${link.id} to ${link.league}`);
            updated++;
        } else {
            console.log(`⚠️ Team ${link.id} not found in Firestore.`);
        }
    }

    console.log(`\nFinished! Updated ${updated} teams.`);
    process.exit(0);
}

relinkAll().catch(e => {
    console.error(e);
    process.exit(1);
});
