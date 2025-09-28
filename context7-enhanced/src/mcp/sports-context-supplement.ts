/**
 * Sports context supplement for MCP
 * Provides timestamped sports data as supplements to documentation
 */

import { z } from 'zod';
import { CacheManager } from '../cache/cache-manager.js';
import { logger } from '../utils/logger.js';

// Tool schemas
const SportsContextSchema = z.object({
  sport: z.enum(['MLB', 'NFL', 'NBA', 'NCAA']),
  league: z.string().optional(),
  team: z.string().optional(),
  player: z.string().optional(),
  timeframe: z.enum(['live', 'today', 'week', 'season', 'historical']).default('today')
});

const InjectSportsContextSchema = z.object({
  libraryID: z.string(),
  topic: z.string(),
  sportContext: SportsContextSchema
});

// Response types with clear separation
interface SupplementResponse {
  type: 'supplement';
  category: 'sports-context';
  data: any;
  metadata: {
    timestamp: string; // ISO America/Chicago
    sport: string;
    team?: string;
    player?: string;
    timeframe: string;
    ttl: number; // seconds
    source: string;
  };
}

interface EnrichedDocResponse {
  docs: string; // Official documentation (unchanged)
  supplement?: SupplementResponse; // Optional sports context
}

export class SportsContextSupplement {
  private cache: CacheManager;

  // Sports hierarchy per BSI rules
  private sportsOrder = ['Baseball', 'Football', 'Basketball', 'Track & Field'];

  // Team mappings
  private teams = {
    MLB: { primary: 'Cardinals', id: '138' },
    NFL: { primary: 'Titans', id: 'TEN' },
    NBA: { primary: 'Grizzlies', id: 'MEM' },
    NCAA: { primary: 'Longhorns', id: 'TEX' }
  };

  constructor(cache: CacheManager) {
    this.cache = cache;
  }

  /**
   * Get sports context as a supplement
   * Returns timestamped, bounded context
   */
  async getSportsContext(params: z.infer<typeof SportsContextSchema>): Promise<SupplementResponse> {
    const cacheKey = `sports:${params.sport}:${params.team || 'all'}:${params.timeframe}`;
    const ttl = this.getTTLForTimeframe(params.timeframe);

    // Check cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return {
        type: 'supplement',
        category: 'sports-context',
        data: cached,
        metadata: {
          timestamp: this.getChicagoTimestamp(),
          sport: params.sport,
          team: params.team,
          player: params.player,
          timeframe: params.timeframe,
          ttl,
          source: 'cache'
        }
      };
    }

    // Generate context based on sport and timeframe
    const context = await this.generateSportsContext(params);

    // Cache with appropriate TTL
    await this.cache.set(cacheKey, context, { ttl });

    return {
      type: 'supplement',
      category: 'sports-context',
      data: context,
      metadata: {
        timestamp: this.getChicagoTimestamp(),
        sport: params.sport,
        team: params.team,
        player: params.player,
        timeframe: params.timeframe,
        ttl,
        source: 'generated'
      }
    };
  }

  /**
   * Inject sports context alongside documentation
   * Never modifies the docs, only supplements
   */
  async injectSportsContext(params: z.infer<typeof InjectSportsContextSchema>): Promise<EnrichedDocResponse> {
    // This would receive docs from the pure doc server
    const docs = `[Documentation for ${params.topic} would be here]`;

    // Get sports supplement
    const supplement = await this.getSportsContext(params.sportContext);

    return {
      docs, // Original docs unchanged
      supplement // Sports context as supplement
    };
  }

  private async generateSportsContext(params: z.infer<typeof SportsContextSchema>): Promise<any> {
    const team = params.team || this.teams[params.sport]?.primary;

    // Mock context generation - replace with actual API calls
    switch (params.timeframe) {
      case 'live':
        return this.generateLiveContext(params.sport, team);
      case 'today':
        return this.generateTodayContext(params.sport, team);
      case 'week':
        return this.generateWeekContext(params.sport, team);
      case 'season':
        return this.generateSeasonContext(params.sport, team);
      case 'historical':
        return this.generateHistoricalContext(params.sport, team);
      default:
        return { message: 'No context available' };
    }
  }

  private generateLiveContext(sport: string, team?: string): any {
    // Live game context (15 second TTL)
    return {
      contextType: 'live-game',
      sport,
      team,
      game: {
        status: 'In Progress',
        inning: '7th',
        score: { home: 4, away: 3 },
        lastUpdate: this.getChicagoTimestamp()
      },
      note: 'Live data refreshes every 15 seconds'
    };
  }

  private generateTodayContext(sport: string, team?: string): any {
    // Today's context (1 hour TTL)
    return {
      contextType: 'today',
      sport,
      team,
      schedule: {
        gameTime: '7:10 PM CT',
        opponent: 'Cubs',
        location: 'Busch Stadium',
        broadcast: 'Bally Sports Midwest'
      },
      recentPerformance: {
        last5: 'W-W-L-W-W',
        homeRecord: '45-32',
        awayRecord: '38-35'
      }
    };
  }

  private generateWeekContext(sport: string, team?: string): any {
    // Week context (6 hour TTL)
    return {
      contextType: 'weekly',
      sport,
      team,
      weeklyStats: {
        gamesPlayed: 6,
        wins: 4,
        losses: 2,
        runsScored: 28,
        runsAllowed: 22
      },
      upcomingGames: 3
    };
  }

  private generateSeasonContext(sport: string, team?: string): any {
    // Season context (24 hour TTL)
    return {
      contextType: 'season',
      sport,
      team,
      standings: {
        position: 2,
        division: 'NL Central',
        record: '83-67',
        gamesBack: 3.5
      },
      playoffProbability: 0.876
    };
  }

  private generateHistoricalContext(sport: string, team?: string): any {
    // Historical context (7 day TTL)
    return {
      contextType: 'historical',
      sport,
      team,
      allTimeRecord: {
        worldSeries: 11,
        pennants: 19,
        divisionTitles: 15,
        founded: 1882
      },
      notableSeasons: [2011, 2006, 1982, 1967, 1946]
    };
  }

  private getTTLForTimeframe(timeframe: string): number {
    const ttlMap: Record<string, number> = {
      'live': 15,        // 15 seconds
      'today': 3600,     // 1 hour
      'week': 21600,     // 6 hours
      'season': 86400,   // 24 hours
      'historical': 604800 // 7 days
    };
    return ttlMap[timeframe] || 3600;
  }

  private getChicagoTimestamp(): string {
    // Return timestamp in America/Chicago timezone
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date()).replace(/(\d+)\/(\d+)\/(\d+),/, '$3-$1-$2T');
  }
}