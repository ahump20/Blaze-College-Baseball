/**
 * Blaze Intelligence MCP Integration Bridge
 * Connects Context7 with Cardinals Analytics MCP and other Blaze services
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  TextContent,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';

import { SportsAnalyticsAdapter } from '../adapters/sports-analytics-adapter.js';
import { CacheManager } from '../cache/cache-manager.js';
import { Logger } from '../utils/logger.js';
import { RateLimiter } from '../utils/rate-limiter.js';

export class BlazeMCPBridge {
  private server: Server;
  private sportsAdapter: SportsAnalyticsAdapter;
  private cacheManager: CacheManager;
  private logger: Logger;
  private tools: Map<string, Tool>;

  constructor(config: {
    upstashUrl: string;
    upstashToken: string;
    apiKeys?: Record<string, string>;
  }) {
    this.logger = new Logger({ level: 'info' });

    // Initialize cache manager
    this.cacheManager = new CacheManager({
      upstashUrl: config.upstashUrl,
      upstashToken: config.upstashToken,
      logger: this.logger,
      enableMemoryCache: true,
      prefetchConfig: {
        enabled: true,
        patterns: [
          'team:KEY:*',
          'player:KEY:*',
          'game:KEY:*'
        ],
        maxKeys: 20,
        ttl: 300
      }
    });

    // Initialize sports adapter
    this.sportsAdapter = new SportsAnalyticsAdapter({
      cacheManager: this.cacheManager,
      logger: this.logger,
      rateLimiter: new RateLimiter({
        defaultLimit: 10,
        window: 1000,
        apis: {
          mlb: { limit: 10, window: 1000 },
          sportsDataIO: { limit: 5, window: 1000 },
          perfectGame: { limit: 3, window: 1000 }
        }
      }),
      apiKeys: config.apiKeys
    });

    // Initialize MCP server
    this.server = new Server(
      {
        name: 'blaze-context7',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.tools = new Map();
    this.registerTools();
    this.setupHandlers();
  }

  /**
   * Register all available MCP tools
   */
  private registerTools(): void {
    // Tool 1: Get Sports Context
    this.tools.set('getSportsContext', {
      name: 'getSportsContext',
      description: 'Inject sports-specific context and documentation for AI models',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The query or question about sports data'
          },
          sport: {
            type: 'string',
            enum: ['MLB', 'NFL', 'NBA', 'NCAA'],
            description: 'Specific sport to focus on'
          },
          teams: {
            type: 'array',
            items: { type: 'string' },
            description: 'Teams to include in context'
          },
          includeStats: {
            type: 'boolean',
            description: 'Include statistical context'
          },
          includeLiveData: {
            type: 'boolean',
            description: 'Include live game data'
          }
        },
        required: ['query']
      }
    });

    // Tool 2: Get API Documentation
    this.tools.set('getAPIDocumentation', {
      name: 'getAPIDocumentation',
      description: 'Get documentation for sports APIs with examples',
      inputSchema: {
        type: 'object',
        properties: {
          apiName: {
            type: 'string',
            description: 'Name of the API (e.g., mlb-stats, sports-data-io)'
          },
          includeExamples: {
            type: 'boolean',
            description: 'Include code examples'
          },
          sport: {
            type: 'string',
            enum: ['MLB', 'NFL', 'NBA', 'NCAA'],
            description: 'Sport-specific examples'
          }
        },
        required: ['apiName']
      }
    });

    // Tool 3: Get Team Stats
    this.tools.set('getTeamStats', {
      name: 'getTeamStats',
      description: 'Get comprehensive team statistics',
      inputSchema: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'Team identifier'
          },
          sport: {
            type: 'string',
            enum: ['MLB', 'NFL', 'NBA', 'NCAA'],
            description: 'Sport type'
          },
          season: {
            type: 'number',
            description: 'Season year'
          }
        },
        required: ['teamId', 'sport']
      }
    });

    // Tool 4: Get Player Stats
    this.tools.set('getPlayerStats', {
      name: 'getPlayerStats',
      description: 'Get player statistics with optional advanced metrics',
      inputSchema: {
        type: 'object',
        properties: {
          playerId: {
            type: 'string',
            description: 'Player identifier'
          },
          sport: {
            type: 'string',
            enum: ['MLB', 'NFL', 'NBA', 'NCAA'],
            description: 'Sport type'
          },
          season: {
            type: 'number',
            description: 'Season year'
          },
          includeAdvanced: {
            type: 'boolean',
            description: 'Include advanced metrics'
          },
          includeProjections: {
            type: 'boolean',
            description: 'Include projections'
          }
        },
        required: ['playerId', 'sport']
      }
    });

    // Tool 5: Get Live Games
    this.tools.set('getLiveGames', {
      name: 'getLiveGames',
      description: 'Get live game data for a sport',
      inputSchema: {
        type: 'object',
        properties: {
          sport: {
            type: 'string',
            enum: ['MLB', 'NFL', 'NBA', 'NCAA'],
            description: 'Sport type'
          },
          teamId: {
            type: 'string',
            description: 'Filter by team (optional)'
          }
        },
        required: ['sport']
      }
    });

    // Tool 6: Analyze Cardinals Trajectory
    this.tools.set('analyzeCardinalsTrajectory', {
      name: 'analyzeCardinalsTrajectory',
      description: 'Analyze St. Louis Cardinals performance trajectory',
      inputSchema: {
        type: 'object',
        properties: {
          timeframe: {
            type: 'string',
            enum: ['game', 'week', 'month', 'season'],
            description: 'Analysis timeframe'
          },
          metrics: {
            type: 'array',
            items: { type: 'string' },
            description: 'Metrics to analyze (e.g., batting average, ERA)'
          },
          compareWith: {
            type: 'string',
            description: 'Team to compare against'
          }
        },
        required: ['timeframe']
      }
    });

    // Tool 7: Get NIL Valuation
    this.tools.set('getNILValuation', {
      name: 'getNILValuation',
      description: 'Calculate NIL valuation for college athletes',
      inputSchema: {
        type: 'object',
        properties: {
          playerId: {
            type: 'string',
            description: 'Player identifier'
          },
          sport: {
            type: 'string',
            description: 'Sport (football, basketball, baseball)'
          },
          socialMedia: {
            type: 'object',
            properties: {
              instagram: { type: 'number' },
              twitter: { type: 'number' },
              tiktok: { type: 'number' }
            },
            description: 'Social media follower counts'
          },
          performance: {
            type: 'object',
            description: 'Performance statistics'
          }
        },
        required: ['playerId', 'sport']
      }
    });

    // Tool 8: Cache Management
    this.tools.set('manageCacheGetCacheStats', {
      name: 'getCacheStats',
      description: 'Get cache performance statistics',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    });

    this.tools.set('clearCache', {
      name: 'clearCache',
      description: 'Clear cache by pattern or tags',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'Key pattern to match'
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tags to clear'
          },
          olderThan: {
            type: 'number',
            description: 'Clear entries older than timestamp'
          }
        }
      }
    });

    // Tool 9: Perfect Game Integration
    this.tools.set('getPerfectGameData', {
      name: 'getPerfectGameData',
      description: 'Get Perfect Game baseball recruitment data',
      inputSchema: {
        type: 'object',
        properties: {
          graduationYear: {
            type: 'number',
            description: 'Graduation year'
          },
          state: {
            type: 'string',
            description: 'State code (e.g., TX)'
          },
          position: {
            type: 'string',
            description: 'Player position'
          },
          limit: {
            type: 'number',
            description: 'Number of results',
            default: 10
          }
        }
      }
    });

    // Tool 10: Texas High School Football
    this.tools.set('getTexasHSFootball', {
      name: 'getTexasHSFootball',
      description: 'Get Texas high school football data and rankings',
      inputSchema: {
        type: 'object',
        properties: {
          classification: {
            type: 'string',
            enum: ['6A', '5A', '4A', '3A', '2A', '1A'],
            description: 'UIL classification'
          },
          district: {
            type: 'string',
            description: 'District number'
          },
          team: {
            type: 'string',
            description: 'Team name'
          }
        }
      }
    });
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers(): void {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: Array.from(this.tools.values())
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const result = await this.executeTool(name, args);
        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string'
                ? result
                : JSON.stringify(result, null, 2)
            } as TextContent
          ]
        };
      } catch (error: any) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  /**
   * Execute a specific tool
   */
  private async executeTool(name: string, args: any): Promise<any> {
    this.logger.info(`Executing tool: ${name}`, { args });

    switch (name) {
      case 'getSportsContext':
        return await this.sportsAdapter.injectSportsContext(
          args.query,
          {
            sport: args.sport,
            teams: args.teams,
            includeStats: args.includeStats,
            includeLiveData: args.includeLiveData
          }
        );

      case 'getAPIDocumentation':
        return await this.sportsAdapter.getAPIDocumentation(
          args.apiName,
          {
            includeExamples: args.includeExamples,
            sport: args.sport
          }
        );

      case 'getTeamStats':
        return await this.sportsAdapter.getTeamStats(
          args.teamId,
          args.sport,
          args.season
        );

      case 'getPlayerStats':
        return await this.sportsAdapter.getPlayerStats(
          args.playerId,
          args.sport,
          {
            season: args.season,
            includeAdvanced: args.includeAdvanced,
            includeProjections: args.includeProjections
          }
        );

      case 'getLiveGames':
        return await this.sportsAdapter.getLiveGameData(
          args.sport,
          args.teamId
        );

      case 'analyzeCardinalsTrajectory':
        return await this.analyzeCardinalsTrajectory(args);

      case 'getNILValuation':
        return await this.calculateNILValuation(args);

      case 'getCacheStats':
        return await this.cacheManager.getStats();

      case 'clearCache':
        return await this.cacheManager.clear({
          pattern: args.pattern,
          tags: args.tags,
          olderThan: args.olderThan
        });

      case 'getPerfectGameData':
        return await this.getPerfectGameData(args);

      case 'getTexasHSFootball':
        return await this.getTexasHSFootball(args);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  /**
   * Analyze Cardinals performance trajectory
   */
  private async analyzeCardinalsTrajectory(args: {
    timeframe: string;
    metrics?: string[];
    compareWith?: string;
  }): Promise<any> {
    const cacheKey = `trajectory:cardinals:${args.timeframe}:${args.compareWith || 'none'}`;

    // Check cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get Cardinals stats
    const cardinalsStats = await this.sportsAdapter.getTeamStats('138', 'MLB');

    // Perform analysis
    const analysis = {
      team: 'St. Louis Cardinals',
      timeframe: args.timeframe,
      currentRecord: {
        wins: cardinalsStats.wins,
        losses: cardinalsStats.losses,
        winPercentage: cardinalsStats.winPercentage
      },
      trajectory: this.calculateTrajectory(cardinalsStats, args.timeframe),
      metrics: args.metrics
        ? this.filterMetrics(cardinalsStats.stats, args.metrics)
        : cardinalsStats.stats,
      comparison: args.compareWith
        ? await this.compareTeams('138', args.compareWith, 'MLB')
        : null,
      insights: this.generateInsights(cardinalsStats, args.timeframe),
      lastUpdated: new Date().toISOString()
    };

    // Cache result
    await this.cacheManager.set(cacheKey, analysis, 1800);

    return analysis;
  }

  /**
   * Calculate NIL valuation for college athletes
   */
  private async calculateNILValuation(args: {
    playerId: string;
    sport: string;
    socialMedia?: any;
    performance?: any;
  }): Promise<any> {
    const cacheKey = `nil:${args.playerId}:${args.sport}`;

    // Check cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Calculate valuation factors
    const performanceScore = this.calculatePerformanceScore(args.performance || {});
    const socialScore = this.calculateSocialScore(args.socialMedia || {});
    const marketScore = this.calculateMarketScore(args.sport);

    // Calculate total valuation
    const baseValuation = (performanceScore * 0.5) +
                         (socialScore * 0.3) +
                         (marketScore * 0.2);

    const valuation = {
      playerId: args.playerId,
      sport: args.sport,
      valuation: Math.round(baseValuation * 1000), // Convert to dollars
      factors: {
        performance: performanceScore,
        socialMedia: socialScore,
        marketSize: marketScore,
        position: this.getPositionMultiplier(args.sport)
      },
      projectedEarnings: {
        low: Math.round(baseValuation * 800),
        median: Math.round(baseValuation * 1000),
        high: Math.round(baseValuation * 1500)
      },
      recommendations: this.generateNILRecommendations(baseValuation, args.sport),
      lastCalculated: new Date().toISOString()
    };

    // Cache for 1 hour
    await this.cacheManager.set(cacheKey, valuation, 3600);

    return valuation;
  }

  /**
   * Get Perfect Game recruitment data
   */
  private async getPerfectGameData(args: {
    graduationYear?: number;
    state?: string;
    position?: string;
    limit?: number;
  }): Promise<any> {
    const cacheKey = `perfectgame:${args.graduationYear || 'all'}:${args.state || 'all'}:${args.position || 'all'}`;

    // Check cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Mock data - would integrate with real Perfect Game API
    const data = {
      graduationYear: args.graduationYear || new Date().getFullYear() + 1,
      state: args.state || 'TX',
      position: args.position || 'All',
      players: this.generateMockPerfectGamePlayers(args.limit || 10),
      statistics: {
        totalPlayers: 523,
        averageRating: 8.5,
        commitmentRate: 0.42
      },
      lastUpdated: new Date().toISOString()
    };

    // Cache for 6 hours
    await this.cacheManager.set(cacheKey, data, 21600);

    return data;
  }

  /**
   * Get Texas high school football data
   */
  private async getTexasHSFootball(args: {
    classification?: string;
    district?: string;
    team?: string;
  }): Promise<any> {
    const cacheKey = `txhs:${args.classification || 'all'}:${args.district || 'all'}:${args.team || 'all'}`;

    // Check cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Mock data - would integrate with Texas HS football data sources
    const data = {
      classification: args.classification || '6A',
      district: args.district,
      rankings: this.generateMockTXHSRankings(),
      teams: args.team ? this.getMockTeamData(args.team) : null,
      statistics: {
        totalTeams: 245,
        gamesPlayed: 1680,
        averageScore: 31.5
      },
      playoffs: {
        qualified: 128,
        currentRound: 'District',
        nextRound: 'Bi-District'
      },
      lastUpdated: new Date().toISOString()
    };

    // Cache for 1 hour
    await this.cacheManager.set(cacheKey, data, 3600);

    return data;
  }

  // Helper methods

  private calculateTrajectory(stats: any, timeframe: string): string {
    // Simplified trajectory calculation
    const recentPerformance = stats.winPercentage;
    if (recentPerformance > 0.6) return 'Upward';
    if (recentPerformance > 0.5) return 'Stable';
    return 'Declining';
  }

  private filterMetrics(stats: any, metrics: string[]): any {
    const filtered: any = {};
    for (const metric of metrics) {
      if (stats[metric] !== undefined) {
        filtered[metric] = stats[metric];
      }
    }
    return filtered;
  }

  private async compareTeams(team1Id: string, team2Id: string, sport: string): Promise<any> {
    // Would fetch and compare team stats
    return {
      team1: team1Id,
      team2: team2Id,
      comparison: 'Team 1 leads in most categories'
    };
  }

  private generateInsights(stats: any, timeframe: string): string[] {
    const insights: string[] = [];

    if (stats.winPercentage > 0.55) {
      insights.push('Team is performing above .500 and in playoff contention');
    }

    if (stats.stats?.era && stats.stats.era < 4.0) {
      insights.push('Pitching staff has maintained excellent ERA below 4.00');
    }

    insights.push(`Analysis based on ${timeframe} timeframe`);

    return insights;
  }

  private calculatePerformanceScore(performance: any): number {
    // Simplified scoring - would use actual performance metrics
    return Math.random() * 100;
  }

  private calculateSocialScore(socialMedia: any): number {
    const total = (socialMedia.instagram || 0) +
                 (socialMedia.twitter || 0) +
                 (socialMedia.tiktok || 0);

    // Score based on follower count tiers
    if (total > 100000) return 100;
    if (total > 50000) return 80;
    if (total > 10000) return 60;
    if (total > 5000) return 40;
    return 20;
  }

  private calculateMarketScore(sport: string): number {
    const marketScores: Record<string, number> = {
      'football': 90,
      'basketball': 80,
      'baseball': 60,
      'other': 40
    };
    return marketScores[sport] || 40;
  }

  private getPositionMultiplier(sport: string): number {
    // Position importance multiplier
    return 1.0;
  }

  private generateNILRecommendations(valuation: number, sport: string): string[] {
    const recommendations: string[] = [];

    if (valuation > 80) {
      recommendations.push('Strong NIL potential - pursue major brand deals');
    } else if (valuation > 50) {
      recommendations.push('Good NIL opportunities with regional brands');
    } else {
      recommendations.push('Focus on building social media presence');
    }

    recommendations.push(`Leverage ${sport} performance for endorsements`);

    return recommendations;
  }

  private generateMockPerfectGamePlayers(count: number): any[] {
    const players = [];
    for (let i = 0; i < count; i++) {
      players.push({
        id: `pg-${i}`,
        name: `Player ${i + 1}`,
        position: ['SS', '2B', 'CF', 'RHP', 'LHP'][Math.floor(Math.random() * 5)],
        rating: (7 + Math.random() * 3).toFixed(1),
        commitment: Math.random() > 0.6 ? 'Texas' : null
      });
    }
    return players;
  }

  private generateMockTXHSRankings(): any[] {
    return [
      { rank: 1, team: 'Westlake', record: '10-0' },
      { rank: 2, team: 'North Shore', record: '9-1' },
      { rank: 3, team: 'Southlake Carroll', record: '9-1' },
      { rank: 4, team: 'Duncanville', record: '8-2' },
      { rank: 5, team: 'Allen', record: '8-2' }
    ];
  }

  private getMockTeamData(team: string): any {
    return {
      name: team,
      record: '7-3',
      district: '5-6A',
      stats: {
        ppg: 35.2,
        papg: 21.8
      }
    };
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    this.logger.info('Blaze MCP Bridge started successfully');
  }

  /**
   * Cleanup resources
   */
  async stop(): Promise<void> {
    await this.cacheManager.destroy();
    this.logger.info('Blaze MCP Bridge stopped');
  }
}