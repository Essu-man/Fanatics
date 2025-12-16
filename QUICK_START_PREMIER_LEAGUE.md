# Quick Start - Premier League Fix

## TL;DR
Run these commands in order:

```bash
# 1. Check status
npm run check-leagues

# 2. Enable Premier League teams
npm run enable-premier-league

# 3. Test in your app
# Visit your app and click on a league
```

That's it! 🎉

---

## What Changed?

### 1. **Explicit League Name Mapping**
The modal now has a comprehensive mapping that connects Firebase custom league names to hardcoded team league names:

```
"English Premier League" ↔ "Premier League", "EPL"
"Spain la liga" ↔ "La Liga"
"German bundesliga" ↔ "Bundesliga"
etc.
```

### 2. **Firebase Management Scripts**
New npm scripts that use your Firebase credentials (`C:/KEYS/CEDIMAN.json`):
- `npm run check-leagues` - See what's in your database
- `npm run enable-premier-league` - Enable all Premier League teams

### 3. **Reusable Utilities**
Added `lib/league-mapping.ts` with helper functions:
- `leaguesMatch()` - Check if team league matches custom league
- `filterTeamsByCustomLeague()` - Filter teams by custom league
- `getCustomLeagueName()` - Find which custom league a team belongs to
- etc.

---

## The Problem & Solution

**Problem:** Premier League modal was empty even though teams existed
**Reason:** Teams were disabled in Firebase
**Solution:** Enable teams using `npm run enable-premier-league`

---

## Expected Results

After running the commands:
- ✅ Premier League will work exactly like La Liga
- ✅ Teams will appear when you click Premier League
- ✅ All leagues will use the same explicit mapping logic
- ✅ No more empty modals!

---

## Files Changed

- `app/components/LeagueTeamsModal.tsx` - Added explicit mapping
- `scripts/manage-leagues.ts` - Firebase management script (NEW)
- `lib/league-mapping.ts` - Reusable utilities (NEW)
- `package.json` - Added npm scripts
- Documentation files (guides, this file)

---

## Troubleshooting

### Command not found errors?
Install dependencies first:
```bash
npm install
```

### Firebase connection errors?
Make sure `C:/KEYS/CEDIMAN.json` exists and is readable.

### Still showing empty after enabling?
1. Check console logs (F12) when clicking leagues
2. Verify teams are actually in your Firebase database
3. Check if there's a league name mismatch

---

## Next Time You Add a League

If you create a new league in Firebase, just update the mapping in two places:

**`lib/league-mapping.ts`:**
```typescript
export const LEAGUE_NAME_MAP: Record<string, string[]> = {
    // ... existing ...
    "Your New League": ["Team League Name", "Variations"],
};
```

**`app/components/LeagueTeamsModal.tsx`:**
```typescript
const leagueNameMap: Record<string, string[]> = {
    // ... existing ...
    "Your New League": ["Team League Name", "Variations"],
};
```

That's it! 🚀
