// Cloudflare Worker for BlazeS MLB Analytics Engine
// File: src/index.ts

export interface Env {
  // D1 Database binding
  MLB_DB: D1Database;
  
  // KV Namespace for caching
  MLB_CACHE: KVNamespace;
  
  // Workers AI binding
  AI: any;
  
  // R2 Bucket for historical data
  MLB_HISTORICAL: R2Bucket;
  
  // API Keys (stored as secrets)
  MLB_STATS_API_KEY: string;
}

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function to handle CORS preflight
function handleCORS(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route: Get team data
      if (path.match(/^\/api\/teams\/[A-Z]{3}$/)) {
        const teamCode = path.split('/').pop()!;
        return await getTeamData(teamCode, env);
      }

      // Route: Get team statistics with advanced metrics
      if (path.match(/^\/api\/teams\/[A-Z]{3}\/stats$/)) {
        const teamCode = path.split('/')[3];
        return await getTeamStats(teamCode, env);
      }

      // Route: AI-powered analysis
      if (path === '/api/ai/analyze' && request.method === 'POST') {
        const body = await request.json() as any;
        return await generateAIAnalysis(body, env);
      }

      // Route: Get predictions
      if (path.match(/^\/api\/teams\/[A-Z]{3}\/predictions$/)) {
        const teamCode = path.split('/')[3];
        return await getPredictions(teamCode, env);
      }

      // Route: Update team data (admin only)
      if (path === '/api/admin/update-teams' && request.method === 'POST') {
        const body = await request.json() as any;
        return await updateTeamData(body, env);
      }

      // Route: Health check
      if (path === '/api/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy',
          timestamp: new Date().toISOString(),
          region: request.cf?.colo || 'unknown'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Default 404
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error: any) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// Get team data with intelligent caching
async function getTeamData(teamCode: string, env: Env): Promise<Response> {
  const cacheKey = `team:${teamCode}`;
  
  // Try to get from KV cache first (60 minute TTL)
  const cachedData = await env.MLB_CACHE.get(cacheKey, 'json');
  if (cachedData) {
    console.log(`Cache hit for ${teamCode}`);
    return new Response(JSON.stringify(cachedData), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Cache': 'HIT'
      }
    });
  }

  // Query D1 database
  const result = await env.MLB_DB.prepare(
    `SELECT * FROM teams WHERE team_code = ?`
  ).bind(teamCode).first();

  if (!result) {
    return new Response(JSON.stringify({ error: 'Team not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Store in cache for 60 minutes
  await env.MLB_CACHE.put(cacheKey, JSON.stringify(result), {
    expirationTtl: 3600
  });

  return new Response(JSON.stringify(result), {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'X-Cache': 'MISS'
    }
  });
}

// Get comprehensive team statistics
async function getTeamStats(teamCode: string, env: Env): Promise<Response> {
  const cacheKey = `stats:${teamCode}`;
  
  // Check cache
  const cachedStats = await env.MLB_CACHE.get(cacheKey, 'json');
  if (cachedStats) {
    return new Response(JSON.stringify(cachedStats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Batch query for efficiency
  const queries = await env.MLB_DB.batch([
    env.MLB_DB.prepare(`SELECT * FROM teams WHERE team_code = ?`).bind(teamCode),
    env.MLB_DB.prepare(`SELECT * FROM team_batting WHERE team_code = ?`).bind(teamCode),
    env.MLB_DB.prepare(`SELECT * FROM team_pitching WHERE team_code = ?`).bind(teamCode),
    env.MLB_DB.prepare(`SELECT * FROM team_fielding WHERE team_code = ?`).bind(teamCode)
  ]);

  const [team, batting, pitching, fielding] = queries.map(q => q.results[0]);

  if (!team) {
    return new Response(JSON.stringify({ error: 'Team not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Calculate advanced metrics
  const stats = {
    team,
    batting,
    pitching,
    fielding,
    advanced: calculateAdvancedMetrics(team, batting, pitching)
  };

  // Cache for 30 minutes
  await env.MLB_CACHE.put(cacheKey, JSON.stringify(stats), {
    expirationTtl: 1800
  });

  return new Response(JSON.stringify(stats), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// AI-powered analysis using Workers AI
async function generateAIAnalysis(body: any, env: Env): Promise<Response> {
  const { team, data } = body;

  // Prepare context for AI
  const context = `
    Analyze the following MLB team statistics:
    Team: ${data.name}
    Record: ${data.wins}-${data.losses}
    Run Differential: ${data.runsScored - data.runsAllowed}
    Batting Average: ${data.battingAvg}
    Team ERA: ${data.era}
    FIP: ${data.fip}
    wOBA: ${data.wOBA}
    wRC+: ${data.wRC}
    
    Provide a concise sabermetric analysis focusing on:
    1. Pythagorean expectation and luck factor
    2. Offensive performance relative to league average
    3. Pitching sustainability (ERA vs FIP)
    4. Win projection for next season
  `;

  try {
    // Call Workers AI for text generation
    const aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        { role: 'system', content: 'You are an expert MLB analyst specializing in sabermetrics.' },
        { role: 'user', content: context }
      ]
    });

    return new Response(JSON.stringify({ 
      analysis: aiResponse.response,
      model: 'llama-2-7b-chat',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('AI analysis error:', error);
    return new Response(JSON.stringify({ 
      error: 'AI analysis failed',
      fallback: generateFallbackAnalysis(data)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Get Monte Carlo predictions
async function getPredictions(teamCode: string, env: Env): Promise<Response> {
  const cacheKey = `predictions:${teamCode}`;
  
  // Check cache (predictions valid for 24 hours)
  const cachedPredictions = await env.MLB_CACHE.get(cacheKey, 'json');
  if (cachedPredictions) {
    return new Response(JSON.stringify(cachedPredictions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Get team data
  const team = await env.MLB_DB.prepare(
    `SELECT * FROM teams WHERE team_code = ?`
  ).bind(teamCode).first();

  if (!team) {
    return new Response(JSON.stringify({ error: 'Team not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Run Monte Carlo simulation
  const predictions = runMonteCarloSimulation(team as any);

  // Cache for 24 hours
  await env.MLB_CACHE.put(cacheKey, JSON.stringify(predictions), {
    expirationTtl: 86400
  });

  return new Response(JSON.stringify(predictions), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Update team data (batch insert/update)
async function updateTeamData(body: any, env: Env): Promise<Response> {
  const { teams } = body;

  if (!Array.isArray(teams) || teams.length === 0) {
    return new Response(JSON.stringify({ error: 'Invalid teams array' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Prepare batch statements
  const statements = teams.map(team => 
    env.MLB_DB.prepare(`
      INSERT OR REPLACE INTO teams (
        team_code, name, wins, losses, runs_scored, runs_allowed,
        home_runs, stolen_bases, batting_avg, era, woba, wrc_plus, fip, babip
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      team.code, team.name, team.wins, team.losses, team.runsScored, 
      team.runsAllowed, team.homeRuns, team.stolenBases, team.battingAvg,
      team.era, team.wOBA, team.wRC, team.fip, team.babip
    )
  );

  // Execute batch
  await env.MLB_DB.batch(statements);

  // Invalidate cache for all updated teams
  await Promise.all(
    teams.map(team => env.MLB_CACHE.delete(`team:${team.code}`))
  );

  return new Response(JSON.stringify({ 
    success: true,
    updated: teams.length 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Calculate advanced metrics (Pythagorean, etc.)
function calculateAdvancedMetrics(team: any, batting: any, pitching: any): any {
  const gamesPlayed = team.wins + team.losses;
  const exponent = ((team.runs_scored + team.runs_allowed) / gamesPlayed) ** 0.287;
  
  const expectedWinPct = Math.pow(team.runs_scored, exponent) / 
    (Math.pow(team.runs_scored, exponent) + Math.pow(team.runs_allowed, exponent));
  
  const expectedWins = expectedWinPct * gamesPlayed;
  const pythDiff = team.wins - expectedWins;

  return {
    pythagorean: {
      expectedWins: expectedWins.toFixed(1),
      difference: pythDiff.toFixed(1),
      expectedPct: (expectedWinPct * 100).toFixed(1)
    },
    runDifferential: team.runs_scored - team.runs_allowed,
    runDifferentialPerGame: ((team.runs_scored - team.runs_allowed) / gamesPlayed).toFixed(2),
    winProbability: (expectedWinPct * 100).toFixed(1)
  };
}

// Monte Carlo simulation for win projections
function runMonteCarloSimulation(team: any, iterations: number = 10000): any {
  const gamesPlayed = team.wins + team.losses;
  const gamesRemaining = 162 - gamesPlayed;
  
  const exponent = ((team.runs_scored + team.runs_allowed) / gamesPlayed) ** 0.287;
  const baseWinProb = Math.pow(team.runs_scored, exponent) / 
    (Math.pow(team.runs_scored, exponent) + Math.pow(team.runs_allowed, exponent));

  const results: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    let simulatedWins = team.wins;
    
    for (let game = 0; game < gamesRemaining; game++) {
      const variance = (Math.random() - 0.5) * 0.15;
      const gameWinProb = Math.max(0, Math.min(1, baseWinProb + variance));
      
      if (Math.random() < gameWinProb) {
        simulatedWins++;
      }
    }
    
    results.push(simulatedWins);
  }

  results.sort((a, b) => a - b);

  const getPercentile = (p: number) => results[Math.floor(iterations * p / 100)];

  // Create distribution
  const distribution: Record<number, number> = {};
  results.forEach(w => distribution[w] = (distribution[w] || 0) + 1);

  const distributionArray = Object.keys(distribution)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(wins => ({
      wins: parseInt(wins),
      probability: ((distribution[parseInt(wins)] / iterations) * 100).toFixed(2)
    }));

  return {
    mean: (results.reduce((a, b) => a + b, 0) / iterations).toFixed(1),
    median: getPercentile(50),
    p10: getPercentile(10),
    p90: getPercentile(90),
    mostLikely: Object.keys(distribution).reduce((a, b) => 
      distribution[parseInt(a)] > distribution[parseInt(b)] ? a : b
    ),
    distribution: distributionArray,
    baseWinProb: (baseWinProb * 100).toFixed(1)
  };
}

// Fallback analysis if AI fails
function generateFallbackAnalysis(data: any): string {
  const pyth = (data.wins / (data.wins + data.losses) * 100).toFixed(1);
  const runDiff = data.runsScored - data.runsAllowed;
  
  return `Statistical analysis shows the ${data.name} have a ${pyth}% win rate. ` +
    `With a run differential of ${runDiff}, their performance ${
      Math.abs(runDiff) > 50 ? 'significantly' : 'moderately'
    } ${runDiff > 0 ? 'exceeds' : 'falls short of'} expectations. ` +
    `Advanced metrics suggest ${data.wRC < 100 ? 'below' : 'above'} average offensive production ` +
    `and ${data.era > 4.50 ? 'struggling' : 'solid'} pitching performance.`;
}