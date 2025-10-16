// Cloudflare Worker - Backend API for College Baseball Tracker

import {
  getLiveGames,
  getGameBoxScore,
  getConferenceStandings,
} from './lib/ingest/ncaa/index.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route: Get live games
      if (path === '/api/games/live') {
        const games = await fetchLiveGames(env);
        return jsonResponse({ games }, corsHeaders);
      }

      // Route: Get box score for a specific game
      if (path.match(/^\/api\/games\/[^/]+\/boxscore$/)) {
        const gameId = path.split('/')[3];
        const boxScore = await fetchBoxScore(gameId, env);
        return jsonResponse(boxScore, corsHeaders);
      }

      // Route: Get conference standings
      if (path.match(/^\/api\/standings\/[^/]+$/)) {
        const conference = path.split('/')[3];
        const standings = await fetchStandings(conference, env);
        return jsonResponse(standings, corsHeaders);
      }

      return new Response('Not Found', { status: 404 });

    } catch (error) {
      logError('Unhandled API error', error, { path });
      return jsonResponse(
        { error: error.message },
        corsHeaders,
        500
      );
    }
  },
};

function jsonResponse(data, headers = {}, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

async function fetchLiveGames(env) {
  try {
    return await getLiveGames(env);
  } catch (error) {
    logError('fetchLiveGames failed', error);
    throw error;
  }
}

// Fetch detailed box score for a game
async function fetchBoxScore(gameId, env) {
  try {
    return await getGameBoxScore(gameId, env);
  } catch (error) {
    logError('fetchBoxScore failed', error, { gameId });
    throw error;
  }
}

// Fetch conference standings
async function fetchStandings(conference, env) {
  try {
    return await getConferenceStandings(conference, env);
  } catch (error) {
    logError('fetchStandings failed', error, { conference });
    throw error;
  }
}

function logError(message, error, context = {}) {
  console.error(
    JSON.stringify({
      level: 'error',
      message,
      context,
      error: error
        ? { message: error.message, stack: error.stack }
        : undefined,
      timestamp: new Date().toISOString(),
    })
  );
}

// Helper function to scrape NCAA.com (example)
async function scrapeNCAAScoreboard() {
  // Example implementation
  const response = await fetch('https://www.ncaa.com/scoreboard/baseball/d1');
  const html = await response.text();
  
  // Parse HTML to extract:
  // - Game scores
  // - Current inning/status
  // - Team records
  // - Venue information
  
  return []; // Return parsed games
}

// Helper function to scrape D1Baseball scores
async function scrapeD1Baseball() {
  const response = await fetch('https://d1baseball.com/scores/');
  const html = await response.text();
  
  // Parse live scores and game details
  
  return [];
}
