export interface Team {
    id: string;
    name: string;
    league: string;
    country?: string;
    logo?: string;
}

// Football (Soccer) Teams
export const footballTeams: Team[] = [
    // Premier League
    { id: "man-utd", name: "Manchester United", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png" },
    { id: "man-city", name: "Manchester City", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png" },
    { id: "liverpool", name: "Liverpool", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png" },
    { id: "chelsea", name: "Chelsea", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png" },
    { id: "arsenal", name: "Arsenal", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png" },
    { id: "tottenham", name: "Tottenham Hotspur", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Tottenham-Hotspur-Logo.png" },
    { id: "newcastle", name: "Newcastle United", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Newcastle-United-Logo.png" },
    { id: "brighton", name: "Brighton & Hove Albion", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Brighton-Hove-Albion-Logo.png" },
    { id: "west-ham", name: "West Ham United", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/West-Ham-United-Logo.png" },
    { id: "aston-villa", name: "Aston Villa", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Aston-Villa-Logo.png" },
    { id: "crystal-palace", name: "Crystal Palace", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Crystal-Palace-Logo.png" },
    { id: "fulham", name: "Fulham", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Fulham-Logo.png" },
    { id: "brentford", name: "Brentford", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Brentford-Logo.png" },
    { id: "everton", name: "Everton", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Everton-Logo.png" },
    { id: "wolves", name: "Wolverhampton Wanderers", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Wolverhampton-Wanderers-Logo.png" },
    { id: "bournemouth", name: "AFC Bournemouth", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/AFC-Bournemouth-Logo.png" },
    { id: "nottingham", name: "Nottingham Forest", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Nottingham-Forest-Logo.png" },
    { id: "luton", name: "Luton Town", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Luton-Town-Logo.png" },
    { id: "burnley", name: "Burnley", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Burnley-Logo.png" },
    { id: "sheffield", name: "Sheffield United", league: "Premier League", country: "England", logo: "https://logos-world.net/wp-content/uploads/2020/06/Sheffield-United-Logo.png" },
    
    // La Liga
    { id: "real-madrid", name: "Real Madrid", league: "La Liga", country: "Spain", logo: "https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png" },
    { id: "barcelona", name: "Barcelona", league: "La Liga", country: "Spain", logo: "https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png" },
    { id: "atletico", name: "Atletico Madrid", league: "La Liga", country: "Spain", logo: "https://logos-world.net/wp-content/uploads/2020/06/Atletico-Madrid-Logo.png" },
    { id: "sevilla", name: "Sevilla", league: "La Liga", country: "Spain", logo: "https://logos-world.net/wp-content/uploads/2020/06/Sevilla-Logo.png" },
    { id: "valencia", name: "Valencia", league: "La Liga", country: "Spain", logo: "https://logos-world.net/wp-content/uploads/2020/06/Valencia-Logo.png" },
    { id: "villarreal", name: "Villarreal", league: "La Liga", country: "Spain", logo: "https://logos-world.net/wp-content/uploads/2020/06/Villarreal-Logo.png" },
    { id: "real-sociedad", name: "Real Sociedad", league: "La Liga", country: "Spain", logo: "https://logos-world.net/wp-content/uploads/2020/06/Real-Sociedad-Logo.png" },
    { id: "athletic", name: "Athletic Bilbao", league: "La Liga", country: "Spain", logo: "https://logos-world.net/wp-content/uploads/2020/06/Athletic-Bilbao-Logo.png" },
    { id: "betis", name: "Real Betis", league: "La Liga", country: "Spain", logo: "https://logos-world.net/wp-content/uploads/2020/06/Real-Betis-Logo.png" },
    { id: "osasuna", name: "Osasuna", league: "La Liga", country: "Spain", logo: "https://logos-world.net/wp-content/uploads/2020/06/Osasuna-Logo.png" },
    
    // Serie A
    { id: "juventus", name: "Juventus", league: "Serie A", country: "Italy", logo: "https://logos-world.net/wp-content/uploads/2020/06/Juventus-Logo.png" },
    { id: "milan", name: "AC Milan", league: "Serie A", country: "Italy", logo: "https://logos-world.net/wp-content/uploads/2020/06/AC-Milan-Logo.png" },
    { id: "inter", name: "Inter Milan", league: "Serie A", country: "Italy", logo: "https://logos-world.net/wp-content/uploads/2020/06/Inter-Milan-Logo.png" },
    { id: "napoli", name: "Napoli", league: "Serie A", country: "Italy", logo: "https://logos-world.net/wp-content/uploads/2020/06/Napoli-Logo.png" },
    { id: "roma", name: "AS Roma", league: "Serie A", country: "Italy", logo: "https://logos-world.net/wp-content/uploads/2020/06/AS-Roma-Logo.png" },
    { id: "lazio", name: "Lazio", league: "Serie A", country: "Italy", logo: "https://logos-world.net/wp-content/uploads/2020/06/Lazio-Logo.png" },
    { id: "atalanta", name: "Atalanta", league: "Serie A", country: "Italy", logo: "https://logos-world.net/wp-content/uploads/2020/06/Atalanta-Logo.png" },
    { id: "fiorentina", name: "Fiorentina", league: "Serie A", country: "Italy", logo: "https://logos-world.net/wp-content/uploads/2020/06/Fiorentina-Logo.png" },
    
    // Bundesliga
    { id: "bayern", name: "Bayern Munich", league: "Bundesliga", country: "Germany", logo: "https://logos-world.net/wp-content/uploads/2020/06/Bayern-Munich-Logo.png" },
    { id: "dortmund", name: "Borussia Dortmund", league: "Bundesliga", country: "Germany", logo: "https://logos-world.net/wp-content/uploads/2020/06/Borussia-Dortmund-Logo.png" },
    { id: "leipzig", name: "RB Leipzig", league: "Bundesliga", country: "Germany", logo: "https://logos-world.net/wp-content/uploads/2020/06/RB-Leipzig-Logo.png" },
    { id: "leverkusen", name: "Bayer Leverkusen", league: "Bundesliga", country: "Germany", logo: "https://logos-world.net/wp-content/uploads/2020/06/Bayer-Leverkusen-Logo.png" },
    { id: "frankfurt", name: "Eintracht Frankfurt", league: "Bundesliga", country: "Germany", logo: "https://logos-world.net/wp-content/uploads/2020/06/Eintracht-Frankfurt-Logo.png" },
    
    // Ligue 1
    { id: "psg", name: "Paris Saint-Germain", league: "Ligue 1", country: "France", logo: "https://logos-world.net/wp-content/uploads/2020/06/Paris-Saint-Germain-Logo.png" },
    { id: "monaco", name: "Monaco", league: "Ligue 1", country: "France", logo: "https://logos-world.net/wp-content/uploads/2020/06/Monaco-Logo.png" },
    { id: "lyon", name: "Lyon", league: "Ligue 1", country: "France", logo: "https://logos-world.net/wp-content/uploads/2020/06/Lyon-Logo.png" },
    { id: "marseille", name: "Marseille", league: "Ligue 1", country: "France", logo: "https://logos-world.net/wp-content/uploads/2020/06/Marseille-Logo.png" },
    { id: "lille", name: "Lille", league: "Ligue 1", country: "France", logo: "https://logos-world.net/wp-content/uploads/2020/06/Lille-Logo.png" },
    
    // Other European
    { id: "ajax", name: "Ajax", league: "Eredivisie", country: "Netherlands", logo: "https://logos-world.net/wp-content/uploads/2020/06/Ajax-Logo.png" },
    { id: "porto", name: "Porto", league: "Primeira Liga", country: "Portugal", logo: "https://logos-world.net/wp-content/uploads/2020/06/Porto-Logo.png" },
    { id: "benfica", name: "Benfica", league: "Primeira Liga", country: "Portugal", logo: "https://logos-world.net/wp-content/uploads/2020/06/Benfica-Logo.png" },
    { id: "celtic", name: "Celtic", league: "Scottish Premiership", country: "Scotland", logo: "https://logos-world.net/wp-content/uploads/2020/06/Celtic-Logo.png" },
    { id: "rangers", name: "Rangers", league: "Scottish Premiership", country: "Scotland", logo: "https://logos-world.net/wp-content/uploads/2020/06/Rangers-Logo.png" },
    
    // Turkish
    { id: "galatasaray", name: "Galatasaray", league: "Süper Lig", country: "Turkey", logo: "https://logos-world.net/wp-content/uploads/2020/06/Galatasaray-Logo.png" },
    { id: "fenerbahce", name: "Fenerbahce", league: "Süper Lig", country: "Turkey", logo: "https://logos-world.net/wp-content/uploads/2020/06/Fenerbahce-Logo.png" },
    { id: "besiktas", name: "Besiktas", league: "Süper Lig", country: "Turkey", logo: "https://logos-world.net/wp-content/uploads/2020/06/Besiktas-Logo.png" },
];

// Basketball Teams (NBA)
export const basketballTeams: Team[] = [
    { id: "lakers", name: "Los Angeles Lakers", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Los-Angeles-Lakers-Logo.png" },
    { id: "celtics", name: "Boston Celtics", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Boston-Celtics-Logo.png" },
    { id: "warriors", name: "Golden State Warriors", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Golden-State-Warriors-Logo.png" },
    { id: "bulls", name: "Chicago Bulls", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Chicago-Bulls-Logo.png" },
    { id: "heat", name: "Miami Heat", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Miami-Heat-Logo.png" },
    { id: "knicks", name: "New York Knicks", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/New-York-Knicks-Logo.png" },
    { id: "nets", name: "Brooklyn Nets", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Brooklyn-Nets-Logo.png" },
    { id: "clippers", name: "LA Clippers", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Los-Angeles-Clippers-Logo.png" },
    { id: "suns", name: "Phoenix Suns", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Phoenix-Suns-Logo.png" },
    { id: "mavericks", name: "Dallas Mavericks", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Dallas-Mavericks-Logo.png" },
    { id: "nuggets", name: "Denver Nuggets", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Denver-Nuggets-Logo.png" },
    { id: "bucks", name: "Milwaukee Bucks", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Milwaukee-Bucks-Logo.png" },
    { id: "76ers", name: "Philadelphia 76ers", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Philadelphia-76ers-Logo.png" },
    { id: "raptors", name: "Toronto Raptors", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Toronto-Raptors-Logo.png" },
    { id: "hawks", name: "Atlanta Hawks", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Atlanta-Hawks-Logo.png" },
    { id: "hornets", name: "Charlotte Hornets", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Charlotte-Hornets-Logo.png" },
    { id: "cavaliers", name: "Cleveland Cavaliers", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Cleveland-Cavaliers-Logo.png" },
    { id: "pistons", name: "Detroit Pistons", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Detroit-Pistons-Logo.png" },
    { id: "pacers", name: "Indiana Pacers", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Indiana-Pacers-Logo.png" },
    { id: "grizzlies", name: "Memphis Grizzlies", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Memphis-Grizzlies-Logo.png" },
    { id: "timberwolves", name: "Minnesota Timberwolves", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Minnesota-Timberwolves-Logo.png" },
    { id: "pelicans", name: "New Orleans Pelicans", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/New-Orleans-Pelicans-Logo.png" },
    { id: "thunder", name: "Oklahoma City Thunder", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Oklahoma-City-Thunder-Logo.png" },
    { id: "magic", name: "Orlando Magic", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Orlando-Magic-Logo.png" },
    { id: "trail-blazers", name: "Portland Trail Blazers", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Portland-Trail-Blazers-Logo.png" },
    { id: "kings", name: "Sacramento Kings", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Sacramento-Kings-Logo.png" },
    { id: "spurs", name: "San Antonio Spurs", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/San-Antonio-Spurs-Logo.png" },
    { id: "jazz", name: "Utah Jazz", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Utah-Jazz-Logo.png" },
    { id: "wizards", name: "Washington Wizards", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Washington-Wizards-Logo.png" },
    { id: "rockets", name: "Houston Rockets", league: "NBA", logo: "https://logos-world.net/wp-content/uploads/2020/06/Houston-Rockets-Logo.png" },
];

