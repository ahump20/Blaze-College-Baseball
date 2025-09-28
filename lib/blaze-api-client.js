/**
 * Blaze API Client - JavaScript bridge for existing HTML
 * This file provides a global BlazeAPIClient that can be used from index.html
 * WITHOUT any changes to the DOM structure or CSS
 *
 * Usage in HTML:
 * <script type="module" src="/lib/blaze-api-client.js"></script>
 *
 * Then in existing scripts:
 * await BlazeAPIClient.mlb.getTeam();
 * await BlazeAPIClient.nfl.getStandings();
 * etc.
 */

// Default team IDs for Blaze Intelligence
const DEFAULT_TEAM_IDS = {
  mlb: "138",  // Cardinals
  nfl: "10",   // Titans
  nba: "29",   // Grizzlies
  ncaa: "251"  // Longhorns
};

// Helper function for safe fetch with error handling
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...options.headers
      },
      cache: options.cache || 'default',
      ...options
    });

    if (!res.ok) {
      console.error(`API Error: ${url} returned ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`Network error fetching ${url}:`, error);
    return null;
  }
}

// MLB API functions
const mlbAPI = {
  async getTeam(teamId = DEFAULT_TEAM_IDS.mlb) {
    const data = await safeFetch(`/api/mlb?teamId=${encodeURIComponent(teamId)}`);
    if (!data) {
      // Return fallback data structure that matches UI expectations
      return {
        team: { name: "St. Louis Cardinals", division: { name: "NL Central" }, venue: { name: "Busch Stadium" } },
        analytics: { pythagorean: {}, dataSource: "Offline", lastUpdated: new Date().toISOString() }
      };
    }
    return data;
  },

  async getStandings() {
    const data = await safeFetch("/api/mlb-standings");
    if (!data) {
      return { americanLeague: [], nationalLeague: [] };
    }
    return data;
  },

  async getLiveGames() {
    const data = await safeFetch("/api/mlb/scoreboard", { cache: 'no-cache' });
    if (!data) {
      return { games: [] };
    }
    return data;
  },

  // View model functions that transform data to match UI expectations
  async getCardData(teamId = DEFAULT_TEAM_IDS.mlb) {
    const data = await mlbAPI.getTeam(teamId);
    return {
      teamName: data.team?.name ?? "St. Louis Cardinals",
      division: data.team?.division?.name ?? "NL Central",
      venue: data.team?.venue?.name ?? "Busch Stadium",
      expectedWins: data.analytics?.pythagorean?.expectedWins ?? null,
      winPercentage: data.analytics?.pythagorean?.winPercentage ?? null,
      runsScored: data.analytics?.pythagorean?.runsScored ?? null,
      runsAllowed: data.analytics?.pythagorean?.runsAllowed ?? null,
      dataSource: data.analytics?.dataSource ?? "MLB Stats API",
      lastUpdated: data.analytics?.lastUpdated ?? new Date().toISOString()
    };
  }
};

// NFL API functions
const nflAPI = {
  async getTeam(teamId = DEFAULT_TEAM_IDS.nfl) {
    const data = await safeFetch(`/api/nfl?teamId=${encodeURIComponent(teamId)}`);
    if (!data) {
      return {
        team: { name: "Tennessee Titans", division: { name: "AFC South" }, venue: { name: "Nissan Stadium" } },
        analytics: { offensive: {}, defensive: {}, projections: {}, dataSource: "Offline", lastUpdated: new Date().toISOString() }
      };
    }
    return data;
  },

  async getStandings() {
    const data = await safeFetch("/api/nfl-standings");
    if (!data) {
      return { afc: { east: [], north: [], south: [], west: [] }, nfc: { east: [], north: [], south: [], west: [] } };
    }
    return data;
  },

  async getLiveGames() {
    const data = await safeFetch("/api/nfl/scoreboard", { cache: 'no-cache' });
    if (!data) {
      return { games: [] };
    }
    return data;
  },

  async getCardData(teamId = DEFAULT_TEAM_IDS.nfl) {
    const data = await nflAPI.getTeam(teamId);
    return {
      teamName: data.team?.name ?? "Tennessee Titans",
      division: data.team?.division?.name ?? "AFC South",
      venue: data.team?.venue?.name ?? "Nissan Stadium",
      offenseRating: data.analytics?.offensive?.rating ?? null,
      defenseRating: data.analytics?.defensive?.rating ?? null,
      projectedWins: data.analytics?.projections?.wins ?? null,
      playoffProbability: data.analytics?.projections?.playoffProbability ?? null,
      dataSource: data.analytics?.dataSource ?? "NFL Stats API",
      lastUpdated: data.analytics?.lastUpdated ?? new Date().toISOString()
    };
  }
};

// NBA API functions
const nbaAPI = {
  async getTeam(teamId = DEFAULT_TEAM_IDS.nba) {
    const data = await safeFetch(`/api/nba?teamId=${encodeURIComponent(teamId)}`);
    if (!data) {
      return {
        team: { name: "Memphis Grizzlies", division: { name: "Southwest" }, venue: { name: "FedExForum" } },
        analytics: { offensive: {}, defensive: {}, projections: {}, dataSource: "Offline", lastUpdated: new Date().toISOString() }
      };
    }
    return data;
  },

  async getStandings() {
    const data = await safeFetch("/api/nba-standings");
    if (!data) {
      return {
        eastern: { atlantic: [], central: [], southeast: [] },
        western: { northwest: [], pacific: [], southwest: [] }
      };
    }
    return data;
  },

  async getLiveGames() {
    const data = await safeFetch("/api/nba/scoreboard", { cache: 'no-cache' });
    if (!data) {
      return { games: [] };
    }
    return data;
  },

  async getCardData(teamId = DEFAULT_TEAM_IDS.nba) {
    const data = await nbaAPI.getTeam(teamId);
    return {
      teamName: data.team?.name ?? "Memphis Grizzlies",
      division: data.team?.division?.name ?? "Southwest",
      venue: data.team?.venue?.name ?? "FedExForum",
      offensiveRating: data.analytics?.offensive?.rating ?? null,
      defensiveRating: data.analytics?.defensive?.rating ?? null,
      netRating: data.analytics?.netRating ?? null,
      projectedWins: data.analytics?.projections?.wins ?? null,
      playoffProbability: data.analytics?.projections?.playoffProbability ?? null,
      dataSource: data.analytics?.dataSource ?? "NBA Stats API",
      lastUpdated: data.analytics?.lastUpdated ?? new Date().toISOString()
    };
  }
};

// NCAA API functions
const ncaaAPI = {
  async getTeam(teamId = DEFAULT_TEAM_IDS.ncaa) {
    const data = await safeFetch(`/api/ncaa?teamId=${encodeURIComponent(teamId)}`);
    if (!data) {
      return {
        team: { name: "Texas Longhorns", conference: { name: "Big 12" }, venue: { name: "Darrell K Royal Stadium" } },
        record: { overall: "0-0", conference: "0-0" },
        rankings: {},
        projections: {},
        analytics: { dataSource: "Offline", lastUpdated: new Date().toISOString() }
      };
    }
    return data;
  },

  async getStandings() {
    const data = await safeFetch("/api/ncaa-standings");
    if (!data) {
      return {
        football: { sec: [], big12: [], big10: [], acc: [], pac12: [] },
        basketball: { big12: [], sec: [], big10: [], acc: [], bigeast: [] }
      };
    }
    return data;
  },

  async getLiveGames() {
    const data = await safeFetch("/api/ncaa/scoreboard", { cache: 'no-cache' });
    if (!data) {
      return { games: [] };
    }
    return data;
  },

  async getCardData(teamId = DEFAULT_TEAM_IDS.ncaa) {
    const data = await ncaaAPI.getTeam(teamId);
    return {
      teamName: data.team?.name ?? "Texas Longhorns",
      conference: data.team?.conference?.name ?? "Big 12",
      venue: data.team?.venue?.name ?? "Darrell K Royal Stadium",
      record: data.record?.overall ?? "0-0",
      conferenceRecord: data.record?.conference ?? "0-0",
      apRanking: data.rankings?.ap ?? null,
      coachesRanking: data.rankings?.coaches ?? null,
      cfpRanking: data.rankings?.cfp ?? null,
      bowlProjection: data.projections?.bowl ?? null,
      strengthOfSchedule: data.analytics?.sos ?? null,
      dataSource: data.analytics?.dataSource ?? "NCAA Stats API",
      lastUpdated: data.analytics?.lastUpdated ?? new Date().toISOString()
    };
  }
};

// Unified API client with all sports
const BlazeAPIClient = {
  mlb: mlbAPI,
  nfl: nflAPI,
  nba: nbaAPI,
  ncaa: ncaaAPI,

  // Convenience methods for getting all live games
  async getAllLiveGames() {
    const [mlb, nfl, nba, ncaa] = await Promise.allSettled([
      mlbAPI.getLiveGames(),
      nflAPI.getLiveGames(),
      nbaAPI.getLiveGames(),
      ncaaAPI.getLiveGames()
    ]);

    return {
      mlb: mlb.status === 'fulfilled' ? mlb.value : { games: [] },
      nfl: nfl.status === 'fulfilled' ? nfl.value : { games: [] },
      nba: nba.status === 'fulfilled' ? nba.value : { games: [] },
      ncaa: ncaa.status === 'fulfilled' ? ncaa.value : { games: [] }
    };
  },

  // Get all standings across sports
  async getAllStandings() {
    const [mlb, nfl, nba, ncaa] = await Promise.allSettled([
      mlbAPI.getStandings(),
      nflAPI.getStandings(),
      nbaAPI.getStandings(),
      ncaaAPI.getStandings()
    ]);

    return {
      mlb: mlb.status === 'fulfilled' ? mlb.value : null,
      nfl: nfl.status === 'fulfilled' ? nfl.value : null,
      nba: nba.status === 'fulfilled' ? nba.value : null,
      ncaa: ncaa.status === 'fulfilled' ? ncaa.value : null
    };
  },

  // Get card data for all teams
  async getAllTeamCards() {
    const [mlb, nfl, nba, ncaa] = await Promise.allSettled([
      mlbAPI.getCardData(),
      nflAPI.getCardData(),
      nbaAPI.getCardData(),
      ncaaAPI.getCardData()
    ]);

    return {
      mlb: mlb.status === 'fulfilled' ? mlb.value : null,
      nfl: nfl.status === 'fulfilled' ? nfl.value : null,
      nba: nba.status === 'fulfilled' ? nba.value : null,
      ncaa: ncaa.status === 'fulfilled' ? ncaa.value : null
    };
  }
};

// Export for module usage
export default BlazeAPIClient;

// Also make available globally for non-module script tags
if (typeof window !== 'undefined') {
  window.BlazeAPIClient = BlazeAPIClient;

  // Log availability to console for debugging
  console.log('🔥 Blaze API Client loaded and available as window.BlazeAPIClient');

  // Auto-initialize data fetching if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🔥 DOM ready - Blaze API Client initialized');
    });
  } else {
    console.log('🔥 Blaze API Client ready for use');
  }
}