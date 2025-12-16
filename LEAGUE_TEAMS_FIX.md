# Premier League Teams Display Fix

## Problem
When clicking on "Premier League" (or other leagues), the modal was showing as empty even though teams and products existed in the database.

## Root Cause
**League Name Mismatch**: The hardcoded teams in the Firebase `teams` collection had `league: "Premier League"`, but the league in the `custom_leagues` collection was stored as `"English Premier League"`. This caused the modal's filtering logic to fail:

```typescript
// BROKEN: This comparison failed
team.league === league.name  // "Premier League" !== "English Premier League"
```

## Solution
Implemented **smart league name matching** with three fallback strategies:

1. **Exact Match**: Direct string equality after normalization
2. **Partial Match**: One name contains the other (handles "Premier League" vs "English Premier League")
3. **LeagueId Match**: For custom teams that have explicit leagueId references

### How It Works

```typescript
const leaguesMatch = (teamLeague: string, leagueName: string): boolean => {
    const normalized1 = normalizeLeagueName(teamLeague);    // "premier league"
    const normalized2 = normalizeLeagueName(leagueName);    // "english premier league"
    
    if (normalized1 === normalized2) return true;           // Exact match
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return true; // Partial match
    return false;
};
```

### Team Filtering Logic

```typescript
const filteredTeams = (data.teams || []).filter((team: Team) => {
    // First try: Match by explicit leagueId (for custom teams)
    if (team.leagueId === league.id) return true;
    
    // Second try: Match by flexible league name matching (for hardcoded teams)
    if (team.league && leaguesMatch(team.league, league.name)) return true;
    
    return false;
});
```

## Benefits

✅ **Handles naming variations**: Works with "Premier League", "English Premier League", "EPL", etc.
✅ **Backwards compatible**: Still works with custom teams using leagueId
✅ **Case-insensitive**: "PREMIER" matches "premier league"
✅ **Whitespace tolerant**: Extra spaces are normalized
✅ **Debug logging**: Console logs show how many teams were fetched for each league

## Files Modified

- `app/components/LeagueTeamsModal.tsx`
  - Added `normalizeLeagueName()` helper
  - Added `leaguesMatch()` comparison function
  - Updated `fetchTeamsForLeague()` with improved filtering
  - Added debug logging

## Testing

To verify the fix works:

1. Click on any league in "Shop Your Teams"
2. The modal should now display all available teams for that league
3. Check browser console to see: `[LeagueTeamsModal] Fetched X teams for league "..."`
4. Teams from both `teams` and `custom_teams` collections should appear

## Teams Data Sources

The modal fetches teams from two sources:

1. **Hardcoded Teams** (`teams` collection)
   - Store `league: "Premier League"` (string name)
   - Matched using fuzzy league name comparison

2. **Custom Teams** (`custom_teams` collection)
   - Store `leagueId: "..." ` (explicit reference)
   - Matched using exact ID comparison

## Future Considerations

- Consider standardizing league names across collections
- Add league aliases mapping for better control
- Implement league name synonyms for different languages
