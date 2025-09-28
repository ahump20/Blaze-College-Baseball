/**
 * BLAZE SPORTS INTEL - SPORTS DATA ADAPTER
 * Phase 2B: Service Layer Architecture
 *
 * Enterprise-grade data adapters for normalizing different sports API sources
 * Implements data validation, transformation, and error handling
 */

import { z } from 'zod';

// Data validation schemas using Zod
const TeamDataSchema = z.object({
  name: z.string().min(1),
  sport: z.enum(['mlb', 'nfl', 'nba', 'ncaa-football']),
  wins: z.number().int().min(0),
  losses: z.number().int().min(0),
  winPercentage: z.number().min(0).max(1),
  conference: z.string().optional(),
  division: z.string().optional(),
  gamesBack: z.union([z.string(), z.number()]).optional(),
  ranking: z.number().int().positive().optional(),
  streak: z.string().optional(),
  dataSource: z.string(),
  lastUpdated: z.string().datetime(),
  error: z.string().optional()
});

const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  source: z.string(),
  timestamp: z.number(),
  error: z.string().optional(),
  rateLimit: z.object({
    remaining: z.number(),
    reset: z.number()
  }).optional()
});

class SportsDataAdapter {
  constructor(cacheService, logger) {
    this.cache = cacheService;
    this.logger = logger;
    this.rateLimits = new Map();
  }

  /**
   * Normalize MLB Stats API response to common format
   */
  normalizeMLBStatsAPI(rawData, teamKey) {
    try {
      const team = rawData.teams?.find(t => t.abbreviation === teamKey);
      const standings = this.findTeamInStandings(rawData.standings, team?.id);

      const normalized = {
        name: team?.name || 'Unknown Team',
        sport: 'mlb',
        wins: standings?.wins || 0,
        losses: standings?.losses || 0,
        winPercentage: standings ? parseFloat(standings.winningPercentage) : 0,
        gamesBack: standings?.gamesBack || '0',
        streak: standings?.streak?.streakCode || 'N/A',
        division: standings?.division?.name || 'Unknown',
        dataSource: 'MLB Stats API',
        lastUpdated: new Date().toISOString()
      };

      // Validate against schema
      return TeamDataSchema.parse(normalized);
    } catch (error) {
      this.logger?.error('MLB data normalization failed:', error);
      return this.createErrorTeamData('mlb', teamKey, 'Normalization failed');
    }
  }

  /**
   * Normalize ESPN API response to common format
   */
  normalizeESPNAPI(rawData, teamKey, sport) {
    try {
      let teamData = null;

      // Navigate ESPN's nested structure
      const conferences = rawData.children || [];
      for (const conference of conferences) {
        const entries = conference.standings?.entries || [];
        const found = entries.find(entry => entry.team?.abbreviation === teamKey);
        if (found) {
          teamData = found;
          break;
        }
      }

      if (!teamData) {
        throw new Error(`Team ${teamKey} not found in ESPN data`);
      }

      const stats = teamData.stats || [];
      const normalized = {
        name: teamData.team?.displayName || 'Unknown Team',
        sport: sport,
        wins: this.getStatValue(stats, 'wins') || 0,
        losses: this.getStatValue(stats, 'losses') || 0,
        winPercentage: parseFloat(this.getStatValue(stats, 'winPercent') || 0),
        conference: teamData.note || 'Unknown',
        ranking: this.getStatValue(stats, 'rank') || null,
        dataSource: 'ESPN API',
        lastUpdated: new Date().toISOString()
      };

      return TeamDataSchema.parse(normalized);
    } catch (error) {
      this.logger?.error(`ESPN ${sport} data normalization failed:`, error);
      return this.createErrorTeamData(sport, teamKey, 'ESPN API normalization failed');
    }
  }

  /**
   * Normalize SportsDataIO API response to common format
   */
  normalizeSportsDataIO(rawData, teamKey, sport) {
    try {
      const teamData = Array.isArray(rawData)
        ? rawData.find(team => team.Key === teamKey)
        : rawData;

      if (!teamData) {
        throw new Error(`Team ${teamKey} not found in SportsDataIO data`);
      }

      const normalized = {
        name: teamData.Name || teamData.Team || 'Unknown Team',
        sport: sport,
        wins: teamData.Wins || 0,
        losses: teamData.Losses || 0,
        winPercentage: teamData.Wins / (teamData.Wins + teamData.Losses) || 0,
        gamesBack: teamData.GamesBack || '0',
        conference: teamData.Conference || 'Unknown',
        division: teamData.Division || 'Unknown',
        dataSource: 'SportsDataIO API',
        lastUpdated: new Date().toISOString()
      };

      return TeamDataSchema.parse(normalized);
    } catch (error) {
      this.logger?.error(`SportsDataIO ${sport} data normalization failed:`, error);
      return this.createErrorTeamData(sport, teamKey, 'SportsDataIO normalization failed');
    }
  }

  /**
   * Create standardized error response for failed team data
   */
  createErrorTeamData(sport, teamKey, errorMessage) {
    return {
      name: `${teamKey} - Data Unavailable`,
      sport: sport,
      wins: 0,
      losses: 0,
      winPercentage: 0,
      gamesBack: 'N/A',
      conference: 'N/A',
      division: 'N/A',
      ranking: null,
      streak: 'N/A',
      dataSource: 'Error State',
      lastUpdated: new Date().toISOString(),
      error: errorMessage
    };
  }

  /**
   * Utility: Find team in MLB standings structure
   */
  findTeamInStandings(standings, teamId) {
    if (!standings?.records) return null;

    for (const league of standings.records) {
      for (const division of league.divisionRecords || []) {
        const found = division.teamRecords?.find(r => r.team.id === teamId);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Utility: Extract stat value from ESPN stats array
   */
  getStatValue(stats, statName) {
    const stat = stats.find(s => s.name === statName);
    return stat?.value;
  }

  /**
   * Validate API response against schema
   */
  validateApiResponse(response, source) {
    try {
      return ApiResponseSchema.parse({
        success: true,
        data: response,
        source: source,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger?.error(`API response validation failed for ${source}:`, error);
      return {
        success: false,
        data: null,
        source: source,
        timestamp: Date.now(),
        error: `Validation failed: ${error.message}`
      };
    }
  }

  /**
   * Check and update rate limits for API sources
   */
  checkRateLimit(source, maxRequests = 100, windowMs = 3600000) {
    const now = Date.now();
    const key = source;

    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
    }

    const limit = this.rateLimits.get(key);

    if (now > limit.resetTime) {
      // Reset window
      this.rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
    }

    if (limit.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: limit.resetTime };
    }

    limit.count++;
    return { allowed: true, remaining: maxRequests - limit.count, resetTime: limit.resetTime };
  }

  /**
   * Transform and cache data with TTL
   */
  async cacheTeamData(teamKey, sport, data, ttlSeconds = 300) {
    if (!this.cache) return;

    const cacheKey = `team:${sport}:${teamKey}`;
    const cacheData = {
      data: data,
      cached_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString()
    };

    try {
      await this.cache.put(cacheKey, JSON.stringify(cacheData), {
        expirationTtl: ttlSeconds
      });
      this.logger?.info(`Cached team data: ${cacheKey}`);
    } catch (error) {
      this.logger?.error(`Cache write failed for ${cacheKey}:`, error);
    }
  }

  /**
   * Retrieve cached team data
   */
  async getCachedTeamData(teamKey, sport) {
    if (!this.cache) return null;

    const cacheKey = `team:${sport}:${teamKey}`;

    try {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        const cacheData = JSON.parse(cached);
        this.logger?.info(`Cache hit: ${cacheKey}`);
        return {
          ...cacheData.data,
          cache_status: 'hit',
          cached_at: cacheData.cached_at
        };
      }
    } catch (error) {
      this.logger?.error(`Cache read failed for ${cacheKey}:`, error);
    }

    return null;
  }

  /**
   * Aggregate multiple API responses with fallback chain
   */
  async aggregateWithFallback(apiCalls, teamKey, sport) {
    const results = [];

    for (const apiCall of apiCalls) {
      try {
        const result = await apiCall();
        if (result && !result.error) {
          results.push(result);
          break; // Use first successful result
        }
        results.push(result);
      } catch (error) {
        this.logger?.error(`API call failed in fallback chain:`, error);
        results.push(this.createErrorTeamData(sport, teamKey, error.message));
      }
    }

    // Return best available result
    return results.find(r => !r.error) || results[results.length - 1];
  }
}

export default SportsDataAdapter;