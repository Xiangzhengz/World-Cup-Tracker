export const meta = {
  name: 'world-cup-daily-tracker',
  description: 'Search latest World Cup news, extract match results, and update the sweepstakes HTML dashboard',
  phases: [
    { title: 'Search', detail: 'Find latest World Cup results and standings' },
    { title: 'Parse', detail: 'Extract match outcomes and team updates' },
    { title: 'Update', detail: 'Update HTML dashboard with new data' }
  ]
};

// Country name mapping to participant initials
const COUNTRY_MAP = {
  'portugal': 'TB', 'mexico': 'SS', 'france': 'FNK', 'uruguay': 'MA',
  'australia': 'MM', 'brazil': 'MK', 'netherlands': 'TH', 'belgium': 'TO',
  'ecuador': 'MZ', 'argentina': 'KS', 'colombia': 'AE', 'morocco': 'NK',
  'algeria': 'HK', 'usa': 'RAK', 'united states': 'RAK', 'england': 'JB',
  'korea': 'XZ', 'south korea': 'XZ', 'spain': 'AH', 'germany': 'TD',
  'turkiye': 'KG', 'turkey': 'KG', 'austria': 'OZ', 'croatia': 'ST'
};

const COUNTRY_FLAGS = {
  'TB': '🇵🇹', 'SS': '🇲🇽', 'FNK': '🇫🇷', 'MA': '🇺🇾', 'MM': '🇦🇺',
  'MK': '🇧🇷', 'TH': '🇳🇱', 'TO': '🇧🇪', 'MZ': '🇪🇨', 'KS': '🇦🇷',
  'AE': '🇨🇴', 'NK': '🇲🇦', 'HK': '🇩🇿', 'RAK': '🇺🇸', 'JB': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'XZ': '🇰🇷', 'AH': '🇪🇸', 'TD': '🇩🇪', 'KG': '🇹🇷', 'OZ': '🇦🇹', 'ST': '🇭🇷'
};

// Get today's date from args (passed in) or use placeholder
const today = args?.date || 'June 12, 2026';

// ═══════════════════════════════════════════════════════════════
// Phase 1: Search for latest World Cup news
// ═══════════════════════════════════════════════════════════════

phase('Search');

const SEARCH_SCHEMA = {
  type: 'object',
  properties: {
    match_results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          winner: { type: 'string', description: 'Winning country name' },
          loser: { type: 'string', description: 'Losing country name (or "draw" if tied)' },
          score: { type: 'string', description: 'Match score (e.g., "2-1")' },
          stage: { type: 'string', description: 'Tournament stage: group, r16, quarters, semis, final' },
          date: { type: 'string', description: 'Match date' }
        },
        required: ['winner', 'loser', 'stage', 'date']
      }
    },
    eliminations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          country: { type: 'string', description: 'Eliminated country name' },
          stage: { type: 'string', description: 'Stage they were eliminated in' }
        },
        required: ['country', 'stage']
      }
    },
    advancements: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          country: { type: 'string', description: 'Country that advanced' },
          to_stage: { type: 'string', description: 'Stage they advanced to: r16, quarters, semis, final' }
        },
        required: ['country', 'to_stage']
      }
    },
    champion: {
      type: 'string',
      description: 'World Cup champion country name (null if tournament ongoing)'
    }
  },
  required: ['match_results', 'eliminations', 'advancements']
};

log('Searching for latest World Cup 2026 results...');

const newsSearch = await agent(
  `Search the web for the latest FIFA World Cup 2026 results from the past 24-48 hours. Focus on:
  
1. Match results (who won, who lost, scores)
2. Teams eliminated from the tournament
3. Teams advancing to the next stage
4. Current tournament stage (Group Stage, Round of 16, Quarterfinals, Semifinals, Final)
5. If the tournament has concluded, identify the champion

Only include matches involving these countries: Portugal, Mexico, France, Uruguay, Australia, Brazil, Netherlands, Belgium, Ecuador, Argentina, Colombia, Morocco, Algeria, USA, England, Korea/South Korea, Spain, Germany, Turkiye/Turkey, Austria.

Return structured data with:
- match_results: array of recent matches with winner, loser, score, stage, date
- eliminations: teams knocked out of the tournament
- advancements: teams that advanced to the next stage
- champion: winning country (null if tournament ongoing)`,
  { schema: SEARCH_SCHEMA, phase: 'Search', agentType: 'general-purpose' }
);

if (!newsSearch) {
  log('⚠️ No news found - network may be unavailable or no recent matches');
  return { updated: false, reason: 'No news data available' };
}

// ═══════════════════════════════════════════════════════════════
// Phase 2: Parse and map results to participants
// ═══════════════════════════════════════════════════════════════

phase('Parse');

log(`Found ${newsSearch.match_results.length} match results, ${newsSearch.eliminations.length} eliminations, ${newsSearch.advancements.length} advancements`);

const PARSE_SCHEMA = {
  type: 'object',
  properties: {
    participant_updates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          initials: { type: 'string', description: 'Participant initials (e.g., XZ, MK, FNK)' },
          country: { type: 'string', description: 'Country name for reference' },
          wins_delta: { type: 'number', description: 'Number of wins to add (0, 1, 2, etc.)' },
          losses_delta: { type: 'number', description: 'Number of losses to add' },
          new_stage: { type: 'string', description: 'New tournament stage if advanced: r16, quarters, semis, final' },
          new_status: { type: 'string', description: 'New status: in, out, champion' }
        },
        required: ['initials', 'country']
      }
    },
    updates_feed: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Update text with emoji (e.g., "⚽ XZ (Korea 🇰🇷) wins vs Germany 2-1!")' },
          time: { type: 'string', description: 'Timestamp (e.g., "June 12")' },
          type: { type: 'string', description: 'win, loss, out, or info' }
        },
        required: ['text', 'time', 'type']
      }
    }
  },
  required: ['participant_updates', 'updates_feed']
};

const parsed = await agent(
  `Parse the World Cup news data and map it to Shorooq sweepstakes participants.
  
**News Data:**
${JSON.stringify(newsSearch, null, 2)}

**Country to Initials Mapping:**
${JSON.stringify(COUNTRY_MAP, null, 2)}

**Flag Emojis:**
${JSON.stringify(COUNTRY_FLAGS, null, 2)}

**Today's Date:** ${today}

**Instructions:**
1. For each match result, identify the winner and loser
2. Map country names to participant initials using COUNTRY_MAP (case-insensitive)
3. Calculate wins_delta and losses_delta for each participant
4. If a team was eliminated, set new_status: "out"
5. If a team advanced, set new_stage to the stage they advanced to
6. If a team won the championship, set new_status: "champion" and new_stage: "winner"
7. Create updates_feed entries with emojis and country flags for each significant event
8. Use today's date for the "time" field in updates
9. Skip any countries not in the mapping (they're not in the sweepstakes)

Return participant_updates (array of updates to apply) and updates_feed (news items to display).`,
  { schema: PARSE_SCHEMA, phase: 'Parse' }
);

if (!parsed || parsed.participant_updates.length === 0) {
  log('⚠️ No updates to apply - no relevant matches found');
  return { updated: false, reason: 'No relevant matches for sweepstakes participants' };
}

log(`Parsed ${parsed.participant_updates.length} participant updates and ${parsed.updates_feed.length} news items`);

// Return the parsed data for the main script to apply
return {
  updated: true,
  participant_updates: parsed.participant_updates,
  updates_feed: parsed.updates_feed,
  search_results: newsSearch,
  date: today
};