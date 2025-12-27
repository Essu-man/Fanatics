/**
 * League Name Mapping Utilities
 * Handles mapping between Firebase custom_leagues and hardcoded team league names
 * Uses credentials from C:/KEYS/CEDIMAN.json
 */

// Explicit mapping from custom league names to hardcoded team league names
export const LEAGUE_NAME_MAP: Record<string, string[]> = {
    // English leagues
    "English Premier League": ["Premier League", "EPL", "Premier", "english premier"],

    // Spanish leagues
    "Spain la liga": ["La Liga", "LaLiga", "Spanish la liga", "spain"],

    // German leagues
    "German bundesliga": ["Bundesliga", "German bundesliga", "germany"],

    // Italian leagues
    "Seria A": ["Serie A", "SerieA", "Serie a", "Seriea", "italian", "italy"],

    // French leagues
    "French ligue 1": ["Ligue 1", "Ligue1", "French ligue", "France"],

    // Dutch leagues
    "Eredivisie": ["Eredivisie", "Dutch", "Netherlands"],

    // African leagues
    "Ghana premier league": ["Ghana Premier League", "Ghana", "GPL"],

    // Portuguese leagues
    "Portuguese Liga": ["Portuguese Liga", "Primeira Liga", "Portugal", "PORTUGAL"],


    // International
    "International": ["International", "International Teams", "International Clubs"],

    // Turkish and other Rest of World leagues
    "Others": [
        "Other", "Unknown", "Miscellaneous", "Süper Lig", "Super Lig", "Turkey", "Turkish", "Scottish League", "Scottish Premiership", "Eredivisie", "Dutch", "Netherlands"
    ],

};

/**
 * Normalize a league name for comparison
 * - Lowercase
 * - Remove extra whitespace
 * - Trim
 */
export function normalizeLeagueName(name: string): string {
    return name
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Check if a team league name matches a custom league name
 * 
 * Uses three strategies:
 * 1. Exact match (after normalization)
 * 2. Explicit mapping match (using LEAGUE_NAME_MAP)
 * 3. Partial match (one contains the other)
 * 
 * @param teamLeague - The team's league field from database
 * @param customLeagueName - The custom league name from database
 * @returns true if they match, false otherwise
 */
export function leaguesMatch(teamLeague: string, customLeagueName: string): boolean {
    const normalized1 = normalizeLeagueName(teamLeague);
    const normalized2 = normalizeLeagueName(customLeagueName);

    // 1. Exact match after normalization
    if (normalized1 === normalized2) {
        return true;
    }

    // 2. Check explicit mapping
    for (const [customName, hardcodedNames] of Object.entries(LEAGUE_NAME_MAP)) {
        const normalizedCustom = normalizeLeagueName(customName);
        const normalizedLeagueName = normalizeLeagueName(customLeagueName);

        // If this custom league matches the one we're looking for
        const customMatch =
            normalizedCustom === normalizedLeagueName ||
            normalizedCustom.includes(normalizedLeagueName) ||
            normalizedLeagueName.includes(normalizedCustom);

        if (customMatch) {
            // Check if the team league is in the hardcoded names for this custom league
            for (const hardcodedName of hardcodedNames) {
                const normalizedHardcoded = normalizeLeagueName(hardcodedName);
                if (normalized1 === normalizedHardcoded ||
                    normalized1.includes(normalizedHardcoded) ||
                    normalizedHardcoded.includes(normalized1)) {
                    return true;
                }
            }
        }
    }

    // 3. Fallback to partial match (one contains the other)
    // Only allow if not a generic "Premier League" confusion
    const isGenericEPL = normalized1 === "premier league" || normalized1 === "epl" || normalized1 === "premier";
    const isGenericGhana = normalized1 === "ghana premier league" || normalized1 === "gpl";

    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
        // Prevent "Premier League" from matching strictly "Ghana Premier League" and vice versa
        if ((normalized1.includes("premier league") && normalized2.includes("premier league"))) {
            // If both contain "premier league", they must have the same context (e.g. both "ghana" or both not "ghana")
            const hasGhana1 = normalized1.includes("ghana");
            const hasGhana2 = normalized2.includes("ghana");
            if (hasGhana1 !== hasGhana2) return false;
        }
        return true;
    }


    return false;
}

/**
 * Get the custom league name that a team league matches
 * Returns null if no match found
 * 
 * @param teamLeague - The team's league field
 * @returns The matching custom league name or null
 */
export function getCustomLeagueName(teamLeague: string): string | null {
    for (const [customName, hardcodedNames] of Object.entries(LEAGUE_NAME_MAP)) {
        const normalizedTeamLeague = normalizeLeagueName(teamLeague);

        for (const hardcodedName of hardcodedNames) {
            if (normalizeLeagueName(hardcodedName) === normalizedTeamLeague ||
                normalizeLeagueName(hardcodedName).includes(normalizedTeamLeague) ||
                normalizedTeamLeague.includes(normalizeLeagueName(hardcodedName))) {
                return customName;
            }
        }
    }

    return null;
}

/**
 * Filter teams by custom league
 * 
 * @param teams - Array of teams with league field
 * @param customLeagueName - The custom league name to filter by
 * @returns Filtered teams that match the custom league
 */
export function filterTeamsByCustomLeague(
    teams: Array<{ id: string; name: string; league: string;[key: string]: any }>,
    customLeagueName: string
): typeof teams {
    return teams.filter((team) =>
        leaguesMatch(team.league, customLeagueName)
    );
}

/**
 * Group teams by which custom league they belong to
 * 
 * @param teams - Array of teams with league field
 * @returns Object with custom league names as keys and filtered teams as values
 */
export function groupTeamsByCustomLeague(
    teams: Array<{ id: string; name: string; league: string;[key: string]: any }>
): Record<string, typeof teams> {
    const grouped: Record<string, typeof teams> = {};

    for (const customLeague of Object.keys(LEAGUE_NAME_MAP)) {
        const filtered = filterTeamsByCustomLeague(teams, customLeague);
        if (filtered.length > 0) {
            grouped[customLeague] = filtered;
        }
    }

    return grouped;
}
