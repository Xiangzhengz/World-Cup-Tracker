# ⚽ Shorooq World Cup Sweepstakes Tracker

**Live dashboard for tracking Shorooq Partners' World Cup 2026 sweepstakes competition.**

![Shorooq Partners](https://img.shields.io/badge/Shorooq-Partners-0D3858)
![Auto Update](https://img.shields.io/badge/Auto-Update-2D5016)
![World Cup 2026](https://img.shields.io/badge/World%20Cup-2026-FFD700)

---

## 🏆 What is This?

A branded, interactive HTML dashboard that tracks 20 Shorooq team members competing in a World Cup sweepstakes. Each person was randomly assigned a country — the winner gets a team dinner + trophy! 🎁

**Features:**
- 📊 **Live Leaderboard** — Real-time standings ranked by tournament progress
- 🤖 **Automated Updates** — Daily web scraping for latest match results
- 🎯 **KPI Cards** — Teams still in, eliminated, current leader, champion
- 📰 **News Feed** — Recent match results and eliminations
- 🔄 **Stage Filter** — Toggle between Group Stage, R16, Quarters, Semis, Final
- 🎨 **Shorooq Branded** — Full brand system with navy, teal, rust, gold palette
- 📱 **Mobile Responsive** — Works on all devices

---

## 🚀 Quick Start

### View the Dashboard

**Option 1: Open Locally**
```bash
open index.html
```

**Option 2: GitHub Pages (Coming Soon)**
The dashboard will be live at: `https://xiangzhengz.github.io/World-Cup-Tracker/`

---

## 👥 Participants

| Initials | Country | Flag |
|----------|---------|------|
| TB | Portugal | 🇵🇹 |
| SS | Mexico | 🇲🇽 |
| FNK | France | 🇫🇷 |
| MA | Uruguay | 🇺🇾 |
| MM | Australia | 🇦🇺 |
| MK | Brazil | 🇧🇷 |
| TH | Netherlands | 🇳🇱 |
| TO | Belgium | 🇧🇪 |
| MZ | Ecuador | 🇪🇨 |
| KS | Argentina | 🇦🇷 |
| AE | Colombia | 🇨🇴 |
| NK | Morocco | 🇲🇦 |
| HK | Algeria | 🇩🇿 |
| RAK | USA | 🇺🇸 |
| JB | England | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 |
| XZ | Korea | 🇰🇷 |
| AH | Spain | 🇪🇸 |
| TD | Germany | 🇩🇪 |
| KG | Turkiye | 🇹🇷 |
| OZ | Austria | 🇦🇹 |

---

## 🤖 Automated Daily Updates

The tracker uses a multi-agent workflow to automatically update match results every day.

### How It Works

1. **Search Phase** — Web scraper finds latest World Cup 2026 results
2. **Parse Phase** — AI extracts match outcomes and maps countries to participants
3. **Update Phase** — HTML dashboard is automatically updated with new data
4. **Notify Phase** — Summary posted to Slack with updated HTML file

### Run Manually

```bash
# Using Claude Code
claude-code workflow run workflows/world-cup-daily-tracker.js

# Using Python script
python3 update-world-cup-tracker.py
```

### Schedule Daily Updates

**Option 1: Claude Code Scheduler**
```
/schedule daily at 8:00 AM run world-cup-daily-tracker workflow
```

**Option 2: Cron (macOS/Linux)**
```bash
crontab -e
# Add this line:
0 8 * * * cd ~/Desktop/CLAUDE\ CODE/World-Cup-Tracker && python3 update-world-cup-tracker.py
```

**Option 3: GitHub Actions** (Coming Soon)
Automated daily runs via GitHub Actions workflow.

---

## 📝 Manual Updates

If you need to manually update a result, edit `index.html`:

### Update Match Results

```javascript
// Find the participant in the PARTICIPANTS array
{ initials: 'XZ', country: 'Korea', flag: '🇰🇷', status: 'in', stage: 'group', wins: 2, losses: 0 }
//                                                                               ↑ Change these
```

### Add News Update

```javascript
const UPDATES = [
  { text: '⚽ XZ (Korea 🇰🇷) wins vs Germany 3-1!', time: 'June 13', type: 'win' },
  // Add new updates at the top
  ...
];
```

### Mark Team as Eliminated

```javascript
{ initials: 'TB', country: 'Portugal', flag: '🇵🇹', status: 'out', stage: 'group', wins: 1, losses: 2 }
//                                                           ↑ Change to 'out'
```

### Advance Team to Next Stage

```javascript
{ initials: 'MK', country: 'Brazil', flag: '🇧🇷', status: 'in', stage: 'r16', wins: 3, losses: 0 }
//                                                                      ↑ Update stage
```

**Stage Values:**
- `'group'` — Group Stage
- `'r16'` — Round of 16
- `'quarters'` — Quarter Finals
- `'semis'` — Semi Finals
- `'final'` — Final
- `'winner'` — Champion

---

## 📂 Project Structure

```
World-Cup-Tracker/
├── index.html                    # Main dashboard (self-contained)
├── README.md                     # This file
├── WORLD_CUP_AUTOMATION.md      # Detailed automation guide
├── update-world-cup-tracker.py  # Python automation script
├── workflows/
│   └── world-cup-daily-tracker.js   # Claude Code workflow script
└── .github/
    └── workflows/
        └── daily-update.yml     # GitHub Actions (