/**
 * BLAZE SPORTS INTEL - Power Rankings Generator
 * Advanced ranking algorithms for sports teams
 */

class PowerRankingsGenerator {
    constructor() {
        this.sports = ['MLB', 'NFL', 'NBA', 'NCAA'];
        this.algorithms = {
            elo: new EloRatingSystem(),
            pythagorean: new PythagoreanCalculator(),
            strengthOfSchedule: new SOSCalculator(),
            composite: new CompositeRanker()
        };
        this.currentSport = 'MLB';
        this.rankings = [];
    }

    async generateRankings(sport = 'MLB') {
        this.currentSport = sport;

        // Fetch team data
        const teams = await this.fetchTeamData(sport);

        // Calculate various ranking metrics
        const eloRatings = this.algorithms.elo.calculate(teams);
        const pythagRatings = this.algorithms.pythagorean.calculate(teams);
        const sosRatings = this.algorithms.strengthOfSchedule.calculate(teams);

        // Combine into composite rankings
        this.rankings = this.algorithms.composite.combine({
            elo: eloRatings,
            pythagorean: pythagRatings,
            sos: sosRatings
        });

        return this.rankings;
    }

    async fetchTeamData(sport) {
        // In production, this would fetch real data from APIs
        const endpoint = `/api/rankings/${sport.toLowerCase()}`;

        try {
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error('Failed to fetch team data');
            return await response.json();
        } catch (error) {
            console.error('Error fetching team data:', error);
            return this.generateMockTeamData(sport);
        }
    }

    generateMockTeamData(sport) {
        const teams = {
            MLB: [
                { name: 'Cardinals', wins: 83, losses: 79, runsFor: 724, runsAgainst: 719, sos: 0.502 },
                { name: 'Dodgers', wins: 100, losses: 62, runsFor: 847, runsAgainst: 653, sos: 0.508 },
                { name: 'Yankees', wins: 99, losses: 63, runsFor: 807, runsAgainst: 668, sos: 0.515 },
                { name: 'Astros', wins: 106, losses: 56, runsFor: 863, runsAgainst: 657, sos: 0.498 },
                { name: 'Brewers', wins: 86, losses: 76, runsFor: 738, runsAgainst: 692, sos: 0.495 }
            ],
            NFL: [
                { name: 'Titans', wins: 6, losses: 11, pointsFor: 298, pointsAgainst: 359, sos: 0.529 },
                { name: 'Chiefs', wins: 14, losses: 3, pointsFor: 473, pointsAgainst: 369, sos: 0.471 },
                { name: 'Bills', wins: 13, losses: 3, pointsFor: 455, pointsAgainst: 289, sos: 0.506 },
                { name: 'Cowboys', wins: 12, losses: 5, pointsFor: 467, pointsAgainst: 342, sos: 0.488 },
                { name: 'Eagles', wins: 14, losses: 3, pointsFor: 477, pointsAgainst: 344, sos: 0.463 }
            ],
            NBA: [
                { name: 'Grizzlies', wins: 51, losses: 31, pointsFor: 115.1, pointsAgainst: 109.8, sos: 0.498 },
                { name: 'Warriors', wins: 53, losses: 29, pointsFor: 111.0, pointsAgainst: 105.5, sos: 0.515 },
                { name: 'Suns', wins: 64, losses: 18, pointsFor: 114.8, pointsAgainst: 107.3, sos: 0.492 },
                { name: 'Celtics', wins: 51, losses: 31, pointsFor: 117.9, pointsAgainst: 112.3, sos: 0.507 },
                { name: 'Heat', wins: 53, losses: 29, pointsFor: 110.0, pointsAgainst: 105.6, sos: 0.513 }
            ],
            NCAA: [
                { name: 'Longhorns', wins: 12, losses: 2, pointsFor: 38.7, pointsAgainst: 19.2, sos: 0.612 },
                { name: 'Georgia', wins: 13, losses: 1, pointsFor: 39.2, pointsAgainst: 13.8, sos: 0.595 },
                { name: 'Alabama', wins: 11, losses: 2, pointsFor: 40.9, pointsAgainst: 19.7, sos: 0.628 },
                { name: 'Ohio State', wins: 11, losses: 2, pointsFor: 43.8, pointsAgainst: 21.0, sos: 0.542 },
                { name: 'Michigan', wins: 13, losses: 1, pointsFor: 40.4, pointsAgainst: 17.4, sos: 0.531 }
            ]
        };

        return teams[sport] || teams.MLB;
    }

    displayRankings(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const html = `
            <div class="power-rankings">
                <div class="rankings-header">
                    <h2>🏆 ${this.currentSport} Power Rankings</h2>
                    <div class="rankings-controls">
                        <select id="sportSelector" class="sport-selector">
                            ${this.sports.map(sport =>
                                `<option value="${sport}" ${sport === this.currentSport ? 'selected' : ''}>
                                    ${sport}
                                </option>`
                            ).join('')}
                        </select>
                        <button id="refreshRankings" class="refresh-btn">Refresh</button>
                    </div>
                </div>

                <div class="rankings-explanation">
                    <p>Rankings combine multiple factors: Win percentage, strength of schedule,
                       recent performance, and advanced metrics.</p>
                </div>

                <div class="rankings-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Team</th>
                                <th>Record</th>
                                <th>Rating</th>
                                <th>Change</th>
                                <th>Metrics</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.rankings.map((team, index) => `
                                <tr class="${team.name === 'Cardinals' || team.name === 'Titans' ||
                                           team.name === 'Longhorns' || team.name === 'Grizzlies' ?
                                           'highlight-team' : ''}">
                                    <td class="rank">${index + 1}</td>
                                    <td class="team-name">
                                        ${team.name}
                                        ${team.trending === 'up' ? '📈' :
                                          team.trending === 'down' ? '📉' : ''}
                                    </td>
                                    <td>${team.wins}-${team.losses}</td>
                                    <td class="rating">${team.rating.toFixed(1)}</td>
                                    <td class="change ${team.change > 0 ? 'positive' :
                                                       team.change < 0 ? 'negative' : ''}">
                                        ${team.change > 0 ? '▲' : team.change < 0 ? '▼' : '-'}
                                        ${Math.abs(team.change)}
                                    </td>
                                    <td class="metrics">
                                        <div class="metric-bar" style="width: ${team.rating}%"></div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="rankings-footer">
                    <p>Last updated: ${new Date().toLocaleString('en-US', {
                        timeZone: 'America/Chicago',
                        dateStyle: 'short',
                        timeStyle: 'short'
                    })} CDT</p>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        document.getElementById('sportSelector')?.addEventListener('change', async (e) => {
            await this.generateRankings(e.target.value);
            this.displayRankings('rankingsContainer');
        });

        document.getElementById('refreshRankings')?.addEventListener('click', async () => {
            await this.generateRankings(this.currentSport);
            this.displayRankings('rankingsContainer');
        });
    }
}

// Elo Rating System
class EloRatingSystem {
    constructor(kFactor = 32) {
        this.kFactor = kFactor;
        this.baseRating = 1500;
    }

    calculate(teams) {
        // Initialize ratings
        const ratings = {};
        teams.forEach(team => {
            ratings[team.name] = this.baseRating;
        });

        // Simulate season games and update ratings
        teams.forEach(team => {
            const expectedWins = this.getExpectedWins(team, teams);
            const actualWins = team.wins;
            const adjustment = this.kFactor * (actualWins - expectedWins) / teams.length;
            ratings[team.name] += adjustment;
        });

        return ratings;
    }

    getExpectedWins(team, allTeams) {
        let expected = 0;
        allTeams.forEach(opponent => {
            if (opponent.name !== team.name) {
                const winProb = 1 / (1 + Math.pow(10, (opponent.wins - team.wins) / 400));
                expected += winProb;
            }
        });
        return expected;
    }
}

// Pythagorean Win Expectation
class PythagoreanCalculator {
    calculate(teams) {
        const ratings = {};

        teams.forEach(team => {
            const exponent = this.getSportExponent(team);
            const runsFor = team.runsFor || team.pointsFor;
            const runsAgainst = team.runsAgainst || team.pointsAgainst;

            const expectedWinPct = Math.pow(runsFor, exponent) /
                (Math.pow(runsFor, exponent) + Math.pow(runsAgainst, exponent));

            const totalGames = team.wins + team.losses;
            const expectedWins = expectedWinPct * totalGames;

            // Rating based on performance vs expectation
            const performanceRatio = team.wins / expectedWins;
            ratings[team.name] = 1500 * performanceRatio;
        });

        return ratings;
    }

    getSportExponent(team) {
        // Different sports have different optimal exponents
        if (team.runsFor) return 1.83; // Baseball
        if (team.pointsFor > 100) return 14.0; // Basketball
        return 2.37; // Football
    }
}

// Strength of Schedule Calculator
class SOSCalculator {
    calculate(teams) {
        const ratings = {};

        teams.forEach(team => {
            // Base rating on win percentage
            const winPct = team.wins / (team.wins + team.losses);

            // Adjust for strength of schedule
            const sosAdjustment = team.sos || 0.5;
            const adjustedRating = winPct * sosAdjustment * 3000;

            ratings[team.name] = adjustedRating;
        });

        return ratings;
    }
}

// Composite Ranking System
class CompositeRanker {
    combine(metrics) {
        const weights = {
            elo: 0.35,
            pythagorean: 0.35,
            sos: 0.30
        };

        const teams = Object.keys(metrics.elo);
        const compositeRankings = [];

        teams.forEach(team => {
            const eloScore = metrics.elo[team] || 1500;
            const pythScore = metrics.pythagorean[team] || 1500;
            const sosScore = metrics.sos[team] || 1500;

            const composite = (eloScore * weights.elo) +
                            (pythScore * weights.pythagorean) +
                            (sosScore * weights.sos);

            // Get team data for display
            const teamData = this.findTeamData(team);

            compositeRankings.push({
                name: team,
                rating: composite / 30, // Normalize to 0-100 scale
                wins: teamData?.wins || 0,
                losses: teamData?.losses || 0,
                change: Math.floor(Math.random() * 5) - 2, // Mock change
                trending: composite > 1500 ? 'up' : 'down',
                metrics: {
                    elo: eloScore,
                    pythagorean: pythScore,
                    sos: sosScore
                }
            });
        });

        // Sort by composite rating
        compositeRankings.sort((a, b) => b.rating - a.rating);

        return compositeRankings;
    }

    findTeamData(teamName) {
        // Mock function - would use real data in production
        const allTeams = [
            { name: 'Cardinals', wins: 83, losses: 79 },
            { name: 'Titans', wins: 6, losses: 11 },
            { name: 'Longhorns', wins: 12, losses: 2 },
            { name: 'Grizzlies', wins: 51, losses: 31 },
            // Add other teams...
        ];

        return allTeams.find(t => t.name === teamName) ||
               { wins: 0, losses: 0 };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PowerRankingsGenerator;
}

// Auto-initialize if on rankings page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('rankingsContainer')) {
        const generator = new PowerRankingsGenerator();
        generator.generateRankings('MLB').then(() => {
            generator.displayRankings('rankingsContainer');
        });
    }
});