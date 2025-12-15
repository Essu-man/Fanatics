# Premier League Teams Fix - Complete Setup Guide

## Overview
You now have explicit league name mapping and Firebase management scripts to ensure Premier League works exactly like La Liga.

## What Was Changed

### 1. **LeagueTeamsModal.tsx** - Explicit League Name Mapping
Added comprehensive mapping that explicitly connects:
- **Firebase custom_leagues** (e.g., "English Premier League")
- **Hardcoded teams** (e.g., `league: "Premier League"`)

```typescript
const leagueNameMap: Record<string, string[]> = {
    "English Premier League": ["Premier League", "EPL", "Premier", "english premier"],
    "Spain la liga": ["La Liga", "LaLiga", "Spanish la liga", "spain"],
    "German bundesliga": ["Bundesliga", "German bundesliga", "germany"],
    "Seria A": ["Serie A", "SerieA", "Serie a", "Seriea", "italian", "italy"],
    "French ligue 1": ["Ligue 1", "Ligue1", "French ligue", "France"],
    // ... etc
};
```

### 2. **scripts/manage-leagues.ts** - Firebase Management Script
Uses your Firebase credentials from `C:/KEYS/CEDIMAN.json` to:
- Check league and team status
- Enable/disable teams by league
- Verify database configuration

## How to Use

### Step 1: Check Current Status
```bash
npm run check-leagues
```

This will:
- ✅ List all custom leagues in your database
- ✅ List all hardcoded teams grouped by league
- ✅ Show enabled/disabled status
- ✅ Highlight Premier League specifically

**Example output:**
```
📍 Custom Leagues:
   - English Premier League (football)
   - Spain la liga (football)
   - ...

📍 Hardcoded Teams by League:
   - Premier League: 20 teams (0 enabled)  ← Problem!
   - La Liga: 11 teams (11 enabled)        ← Works!

🔎 Premier League Status:
   - Total teams: 20
   - Enabled: 0
   - Disabled: 20
   💡 Run "npm run enable-premier-league" to enable all Premier League teams
```

### Step 2: Enable Premier League Teams
```bash
npm run enable-premier-league
```

This will:
- ✅ Find all teams with `league: "Premier League"`
- ✅ Set `enabled: true` for all of them
- ✅ Show confirmation

**Example output:**
```
✏️  Updating: Manchester United (enabled: false → true)
✏️  Updating: Manchester City (enabled: false → true)
✏️  Updating: Liverpool (enabled: false → true)
...

✅ Successfully enabled 20 Premier League teams!

📊 Summary:
   - Total teams updated: 20
   - League: Premier League
   - Status: All teams are now ENABLED
```

### Step 3: Test in the Modal
1. Go to your app
2. Click "Shop Your Teams"
3. Click on "English Premier League" (or Premier League league circle)
4. Should now show all available teams

## How It Works

### The Matching Flow

```
User clicks "English Premier League"
    ↓
API returns all football teams
    ↓
Modal filters teams using leaguesMatch()
    ↓
leaguesMatch checks:
    1. Exact match? ("English Premier League" == team league)
    2. Mapping match? ("English Premier League" → ["Premier League", "EPL", ...])
    3. Partial match? ("english premier league" contains "premier league")
    ↓
Teams that match appear in modal
```

### Explicit Mapping Examples

| Custom League | Maps To Hardcoded Teams |
|---|---|
| `English Premier League` | `Premier League`, `EPL`, `Premier` |
| `Spain la liga` | `La Liga`, `LaLiga`, `Spanish la liga` |
| `German bundesliga` | `Bundesliga`, `German bundesliga` |
| `Seria A` | `Serie A`, `SerieA`, `Serie a` |
| `French ligue 1` | `Ligue 1`, `Ligue1`, `French ligue` |
| `Eredivisie` | `Eredivisie`, `Dutch` |
| `Ghana premier league` | `Ghana Premier League`, `Ghana`, `GPL` |

## Troubleshooting

### Still showing empty?

1. **Run status check:**
   ```bash
   npm run check-leagues
   ```

2. **Check the console logs** (F12 → Console tab) when clicking a league:
   - Shows exact league being requested
   - Shows teams returned from API
   - Shows which teams matched the filter
   - Shows why teams were/weren't matched

3. **Verify Firebase connection:**
   - Check if `C:/KEYS/CEDIMAN.json` is readable
   - Check if Firebase credentials are correct

### Teams still disabled after running enable script?

1. Try running with Node directly:
   ```bash
   node -r ts-node/register scripts/manage-leagues.ts enable
   ```

2. Or convert to JavaScript and run directly in Firebase console

## Advanced: Adding New Leagues

If you add a new league, update the mapping:

```typescript
const leagueNameMap: Record<string, string[]> = {
    // ... existing mappings ...
    
    // Add your new league:
    "Your Custom League": ["Hardcoded Team League Name", "Alternative Name", "Short Form"],
};
```

## Files Modified

- ✅ `app/components/LeagueTeamsModal.tsx` - Explicit mapping + improved matching logic
- ✅ `scripts/manage-leagues.ts` - Firebase management script
- ✅ `package.json` - Added npm scripts

## Next Steps

1. Run `npm run check-leagues` to see current status
2. If Premier League teams are disabled, run `npm run enable-premier-league`
3. Test the modal in your app
4. Check browser console for detailed matching logs

That's it! Premier League should now work exactly like La Liga. 🎉
