/**
 * Central Adapter exports - all view model transformers
 * CRITICAL: These return EXACT shapes the UI expects
 * NO changes to property names or structure
 */

// MLB View Models
export {
  type MlbCardViewModel,
  type MlbStandingsViewModel,
  type MlbLiveGameViewModel,
  getMlbCardVM,
  getMlbStandingsVM,
  getMlbLiveGamesVM
} from "./mlb";

// NFL View Models
export {
  type NflCardViewModel,
  type NflStandingsViewModel,
  type NflLiveGameViewModel,
  getNflCardVM,
  getNflStandingsVM,
  getNflLiveGamesVM
} from "./nfl";

// NBA View Models
export {
  type NbaCardViewModel,
  type NbaStandingsViewModel,
  type NbaLiveGameViewModel,
  getNbaCardVM,
  getNbaStandingsVM,
  getNbaLiveGamesVM
} from "./nba";

// NCAA View Models
export {
  type NcaaCardViewModel,
  type NcaaStandingsViewModel,
  type NcaaLiveGameViewModel,
  getNcaaCardVM,
  getNcaaStandingsVM,
  getNcaaLiveGamesVM
} from "./ncaa";

// Consolidated Adapter client
export const BlazeAdapters = {
  // MLB
  mlb: {
    getCardVM: async (teamId = "138") => {
      const { getMlbCardVM } = await import("./mlb");
      return getMlbCardVM(teamId);
    },
    getStandingsVM: async () => {
      const { getMlbStandingsVM } = await import("./mlb");
      return getMlbStandingsVM();
    },
    getLiveGamesVM: async () => {
      const { getMlbLiveGamesVM } = await import("./mlb");
      return getMlbLiveGamesVM();
    }
  },

  // NFL
  nfl: {
    getCardVM: async (teamId = "10") => {
      const { getNflCardVM } = await import("./nfl");
      return getNflCardVM(teamId);
    },
    getStandingsVM: async () => {
      const { getNflStandingsVM } = await import("./nfl");
      return getNflStandingsVM();
    },
    getLiveGamesVM: async () => {
      const { getNflLiveGamesVM } = await import("./nfl");
      return getNflLiveGamesVM();
    }
  },

  // NBA
  nba: {
    getCardVM: async (teamId = "29") => {
      const { getNbaCardVM } = await import("./nba");
      return getNbaCardVM(teamId);
    },
    getStandingsVM: async () => {
      const { getNbaStandingsVM } = await import("./nba");
      return getNbaStandingsVM();
    },
    getLiveGamesVM: async () => {
      const { getNbaLiveGamesVM } = await import("./nba");
      return getNbaLiveGamesVM();
    }
  },

  // NCAA
  ncaa: {
    getCardVM: async (teamId = "251") => {
      const { getNcaaCardVM } = await import("./ncaa");
      return getNcaaCardVM(teamId);
    },
    getStandingsVM: async () => {
      const { getNcaaStandingsVM } = await import("./ncaa");
      return getNcaaStandingsVM();
    },
    getLiveGamesVM: async () => {
      const { getNcaaLiveGamesVM } = await import("./ncaa");
      return getNcaaLiveGamesVM();
    }
  }
};