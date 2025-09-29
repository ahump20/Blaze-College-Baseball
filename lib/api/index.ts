/**
 * Central API exports - all sports data fetchers
 * NO UI changes - data layer only
 */

// MLB exports
export {
  getMlbTeam,
  getMlbStandings,
  getMlbLiveGames
} from "./mlb";

// NFL exports
export {
  getNflTeam,
  getNflStandings,
  getNflLiveGames
} from "./nfl";

// NBA exports
export {
  getNbaTeam,
  getNbaStandings,
  getNbaLiveGames
} from "./nba";

// NCAA exports
export {
  getNcaaTeam,
  getNcaaStandings,
  getNcaaLiveGames
} from "./ncaa";

// Consolidated API client
export const BlazeAPI = {
  // MLB
  mlb: {
    getTeam: async (teamId = "138") => {
      const { getMlbTeam } = await import("./mlb");
      return getMlbTeam(teamId);
    },
    getStandings: async () => {
      const { getMlbStandings } = await import("./mlb");
      return getMlbStandings();
    },
    getLiveGames: async () => {
      const { getMlbLiveGames } = await import("./mlb");
      return getMlbLiveGames();
    }
  },

  // NFL
  nfl: {
    getTeam: async (teamId = "10") => {
      const { getNflTeam } = await import("./nfl");
      return getNflTeam(teamId);
    },
    getStandings: async () => {
      const { getNflStandings } = await import("./nfl");
      return getNflStandings();
    },
    getLiveGames: async () => {
      const { getNflLiveGames } = await import("./nfl");
      return getNflLiveGames();
    }
  },

  // NBA
  nba: {
    getTeam: async (teamId = "29") => {
      const { getNbaTeam } = await import("./nba");
      return getNbaTeam(teamId);
    },
    getStandings: async () => {
      const { getNbaStandings } = await import("./nba");
      return getNbaStandings();
    },
    getLiveGames: async () => {
      const { getNbaLiveGames } = await import("./nba");
      return getNbaLiveGames();
    }
  },

  // NCAA
  ncaa: {
    getTeam: async (teamId = "251") => {
      const { getNcaaTeam } = await import("./ncaa");
      return getNcaaTeam(teamId);
    },
    getStandings: async () => {
      const { getNcaaStandings } = await import("./ncaa");
      return getNcaaStandings();
    },
    getLiveGames: async () => {
      const { getNcaaLiveGames } = await import("./ncaa");
      return getNcaaLiveGames();
    }
  }
};