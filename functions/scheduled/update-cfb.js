/**
 * CFB (College Football) Data Update Cron Job
 * Runs every 15 minutes during season to refresh SEC standings, scores, and stats
 */

import { SportsDataIOClient } from '../../lib/sportsdata/client.js';
import {
    adaptCFBStanding,
    adaptCFBGame,
    adaptCFBTeamSeasonStats,
    upsertStandings,
    upsertGames
} from '../../lib/sportsdata/adapters.js';

export default {
    async scheduled(event, env, ctx) {
        const client = new SportsDataIOClient(env.SPORTSDATA_API_KEY, env);
        const season = new Date().getFullYear(); // Current season

        console.log(`[CFB CRON] Starting CFB data update for ${season} season (SEC focus)`);

        try {
            // Update standings
            const standingsResult = await client.getCFBStandings(season.toString());
            if (standingsResult.success && env.DB) {
                // Filter for SEC teams
                const secStandings = client.filterSECTeams(standingsResult.data);
                const standings = secStandings.map(s => adaptCFBStanding(s, season));
                await upsertStandings(env.DB, standings);
                await client.logSync('CFB', 'standings', season, 'SUCCESS', standings.length, null, standingsResult.duration, standingsResult.retries);
                console.log(`[CFB CRON] Updated ${standings.length} SEC team standings`);
            }

            // Update games (for live scores)
            const gamesResult = await client.getCFBGames(season.toString());
            if (gamesResult.success && env.DB) {
                // Filter for SEC teams
                const secGames = gamesResult.data.filter(g =>
                    g.HomeConference === 'SEC' || g.AwayConference === 'SEC'
                );
                const games = secGames.map(g => adaptCFBGame(g, season));
                await upsertGames(env.DB, games);
                await client.logSync('CFB', 'games', season, 'SUCCESS', games.length);
                console.log(`[CFB CRON] Updated ${games.length} SEC games`);
            }

            // Update team season stats
            const statsResult = await client.getCFBTeamSeasonStats(season.toString());
            if (statsResult.success && env.DB) {
                const secStats = client.filterSECTeams(statsResult.data);
                const stats = secStats.map(s => adaptCFBTeamSeasonStats(s, season));
                await client.logSync('CFB', 'team-stats', season, 'SUCCESS', stats.length);
                console.log(`[CFB CRON] Updated team stats for ${stats.length} SEC teams`);
            }

            console.log('[CFB CRON] CFB data update completed successfully');

        } catch (error) {
            console.error('[CFB CRON] CFB data update failed:', error);
            await client.logSync('CFB', 'cron-update', season, 'ERROR', 0, error.message);
        }
    }
};
