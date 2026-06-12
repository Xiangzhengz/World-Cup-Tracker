# World Cup Tracker - Daily Automation Guide

## 🎯 Overview

Your Shorooq World Cup Sweepstakes Tracker now has **automated daily updates**! The system searches for latest match results and updates the dashboard automatically.

---

## 🚀 Quick Start: Manual Update Anytime

Run this in Claude Code to get the latest results:

```
Run the world-cup-daily-tracker workflow to update the dashboard with latest World Cup results
```

This will:
1. Search the web for latest World Cup 2026 results
2. Find matches involving your 20 sweepstakes teams
3. Extract wins, losses, eliminations, and advancements
4. Return structured data you can apply to the HTML

---

## ⏰ Option 1: Schedule with Claude Code (Recommended)

Use Claude Code's built-in scheduler to run this automatically every day.

**Set it up:**

Tell Claude Code:

```
Schedule the world-cup-daily-tracker workflow to run every day at 8 AM
```

Or use the `/schedule` command:

```
/schedule daily at 8:00 AM run the world-cup-daily-tracker workflow and update the HTML dashboard
```

**Benefits:**
- No manual setup
- Runs in the cloud
- You'll get notifications when updates are available
- Easy to modify or cancel

---

## 🛠️ Option 2: Manual Python Script (Advanced)

If you prefer local control, use the Python script I created:

```bash
cd ~/Desktop/CLAUDE\ CODE
python3 update-world-cup-tracker.py
```

**Schedule with cron** (runs every day at 8 AM):

```bash
crontab -e
```

Add this line:

```
0 8 * * * cd ~/Desktop/CLAUDE\ CODE && python3 update-world-cup-tracker.py >> ~/world-cup-updates.log 2>&1
```

**Note:** The Python script requires the Claude Code CLI to be configured. If you encounter issues, stick with Option 1.

---

## 📊 What Gets Updated

The workflow automatically updates:

### Participant Data
- **Wins/Losses** — Match results for all 20 teams
- **Tournament Stage** — Group → R16 → Quarters → Semis → Final
- **Status** — Still In / Eliminated / Champion

### Dashboard Sections
- **KPI Cards** — Teams still in, eliminated, current leader, champion
- **Recent Updates Feed** — Latest match results and eliminations
- **Leaderboard** — Automatically re-sorted by stage advancement and wins
- **Timestamps** — "Last Updated" date

---

## 🔧 Manual Updates (If Needed)

If you want to manually update a specific result, edit the HTML file:

### Update a participant's record:

```javascript
{ initials: 'XZ', country: 'Korea', flag: '🇰🇷', status: 'in', stage: 'group', wins: 2, losses: 0 }
//                                                                               ↑ Change this
```

### Add a news update:

```javascript
const UPDATES = [
  { text: '⚽ XZ (Korea 🇰🇷) wins vs Germany 3-1!', time: 'June 13', type: 'win' },
  // Add new updates at the top
  ...
];
```

### Mark a team as eliminated:

```javascript
{ initials: 'TB', country: 'Portugal', flag: '🇵🇹', status: 'out', stage: 'group', wins: 1, losses: 2 }
//                                                           ↑ 'in' → 'out'
```

### Advance a team to next stage:

```javascript
{ initials: 'MK', country: 'Brazil', flag: '🇧🇷', status: 'in', stage: 'r16', wins: 3, losses: 0 }
//                                                                      ↑ 'group' → 'r16'
```

---

## 📋 Tournament Stage Values

Use these exact values when manually editing:

- `'group'` — Group Stage
- `'r16'` — Round of 16
- `'quarters'` — Quarter Finals
- `'semis'` — Semi Finals
- `'final'` — Final
- `'winner'` — Won the tournament

---

## 🎁 Workflow Details

**Workflow Name:** `world-cup-daily-tracker`

**What it does:**
1. **Search Phase** — Web search for "World Cup 2026 latest results"
2. **Parse Phase** — Maps country names to participant initials (e.g., Korea → XZ)
3. **Extract Phase** — Returns structured JSON with:
   - `participant_updates` — Win/loss deltas and status changes
   - `updates_feed` — News items for the Recent Updates section
   - `search_results` — Raw match data for verification

**Countries tracked:**
Portugal, Mexico, France, Uruguay, Australia, Brazil, Netherlands, Belgium, Ecuador, Argentina, Colombia, Morocco, Algeria, USA, England, Korea, Spain, Germany, Turkiye, Austria

---

## 🔄 Workflow Location

The workflow script is saved here:

```
~/.claude/projects/-Users-zengxiangzheng-Desktop-CLAUDE-CODE/.../workflows/scripts/world-cup-daily-tracker-wf_1737a333-98d.js
```

You can edit it with Claude Code to customize the search logic or add new features.

---

## 💡 Pro Tips

1. **Verify before sharing** — Always check the dashboard in your browser before posting to Slack
2. **Run after big matches** — Manually trigger the workflow after important games for immediate updates
3. **Check for ties** — The workflow handles draws, but double-check manual updates
4. **Archive old updates** — Keep the UPDATES feed fresh by removing very old items (keep 3-5 max)
5. **Trophy moment** — When someone wins, update their status to `'champion'` and stage to `'winner'`

---

## 📤 Sharing on Slack

Once updated, share the dashboard:

1. **Upload the HTML file** directly to Slack
2. **Or share a screenshot** — Open HTML in browser, take screenshot
3. **Or copy the leaderboard table** — Select table, copy, paste into Slack

The HTML file is self-contained and will render correctly when opened from Slack!

---

## 🆘 Troubleshooting

**Workflow returns no results:**
- Check if there were actually any matches in the last 24-48 hours
- Tournament might be on a rest day
- Try widening the search window in the workflow script

**Participant not updating:**
- Verify the country name mapping in the workflow script
- Some teams use alternate names (e.g., USA vs United States, Korea vs South Korea)
- Check the workflow output for which countries were found

**HTML looks broken:**
- Make sure you didn't accidentally delete a bracket or quote
- Reload from the original file and re-apply updates
- Check browser console for JavaScript errors

---

## 📧 Questions?

Ask Claude Code:
```
How do I modify the World Cup tracker workflow to [your question]?
```

---

**Last Updated:** June 12, 2026  
**Built with:** Shorooq HTML Dashboard Builder Skill  
**Workflow ID:** world-cup-daily-tracker
