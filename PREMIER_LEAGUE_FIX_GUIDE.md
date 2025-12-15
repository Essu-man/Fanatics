# Premier League Teams - Debug & Fix Guide

## The Problem
La Liga works fine but Premier League shows empty in the league modal.

## Root Cause Analysis
The issue is likely one of these:

1. **Premier League teams are DISABLED** in Firebase (most likely)
   - API checks `enabled: true` when fetching teams
   - If Premier League teams have `enabled: false`, they won't be returned

2. **League name mismatch** (unlikely, but possible)
   - Hardcoded teams have: `league: "Premier League"`
   - Custom league has: `name: "English Premier League"` (or similar)
   - Modal needs to match these names

## How to Debug

### Step 1: Check the Database Structure
Visit: `/api/admin/debug/league-mapping`

This shows:
- All custom leagues in the database
- All hardcoded teams grouped by league
- Which are enabled/disabled
- Custom teams grouped by leagueId

**Look for:**
- Is there a custom league with "Premier" in the name?
- Are there Premier League teams in the hardcoded teams?
- Are they marked as `enabled: true` or `false`?

### Step 2: Check League Status
Visit: `/api/admin/debug/leagues-status`

Shows:
- All football teams
- Count of enabled vs disabled per league
- Which teams exist and their status

## How to Fix

### Option 1: Quick Auto-Fix (Recommended)
Make a POST request to:
```
POST /api/admin/fix/enable-premier-league
```

This will automatically enable all Premier League teams.

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/admin/fix/enable-premier-league
```

**Using JavaScript:**
```javascript
fetch('/api/admin/fix/enable-premier-league', { method: 'POST' })
    .then(r => r.json())
    .then(data => console.log(data));
```

### Option 2: Manual Enable by League
Make a POST request to:
```
POST /api/admin/debug/leagues-status
Body: { "league": "Premier League", "action": "enable" }
```

### Option 3: Firebase Console
If you have access to Firebase:
1. Go to Firestore Database
2. Navigate to `teams` collection
3. Filter or find all documents where `league == "Premier League"`
4. Update `enabled` field to `true` for all of them

## What the Modal Does

The updated modal now:
1. Fetches all leagues from `/api/leagues`
2. For each league, calls `/api/teams?sport=football` (or appropriate sport)
3. Filters teams by:
   - **LeagueId match**: `team.leagueId === league.id` (for custom teams)
   - **League name match**: Using fuzzy matching with explicit mapping
4. Displays matching teams

### The Fuzzy Matching Logic
```
League Name Mapping:
- "English Premier League" → ["Premier League", "EPL"]
- "Spain la liga" → ["La Liga"]
- "German bundesliga" → ["Bundesliga"]
- "Seria A" → ["Serie A", "Serie a"]
- "French ligue 1" → ["Ligue 1"]

Fallback: Partial string match (one name contains the other)
```

So when you select "English Premier League", it:
1. Calls `/api/teams?sport=football`
2. Filters for teams where `league.includes("premier")` or matches the mapping
3. Returns all matching teams

## Why La Liga Works
La Liga likely works because:
1. Custom league in database: `name: "Spain la liga"`
2. Hardcoded teams have: `league: "La Liga"`
3. These match via fuzzy matching: `"spain la liga"` includes `"la liga"` ✓
4. La Liga teams are probably `enabled: true` ✓

## Why Premier League Doesn't Work
Probably because:
1. Custom league in database: `name: "English Premier League"` ✓
2. Hardcoded teams have: `league: "Premier League"` ✓
3. Names should match via fuzzy matching ✓
4. **BUT Premier League teams are `enabled: false`** ❌

## Next Steps

1. Visit `/api/admin/debug/league-mapping` to check status
2. If teams are disabled, POST to `/api/admin/fix/enable-premier-league`
3. Test the modal - Premier League should now work just like La Liga!

## Console Logs
When you click a league, check browser console (F12) for detailed logs:
- Shows which league was selected
- Shows how many teams came from API
- Shows which teams matched and why
- Final count of teams displayed

These logs will help identify any remaining issues.
