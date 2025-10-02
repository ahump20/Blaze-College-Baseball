/**
 * SportsDataIO Data Adapters
 * Transform API responses into D1 database format
 */

// ===========================================
// TEAM ADAPTERS
// ===========================================

export function adaptNFLTeam(apiTeam) {
    return {
        sport: 'NFL',
        team_id: apiTeam.TeamID,
        global_team_id: apiTeam.GlobalTeamID,
        key: apiTeam.Key,
        city: apiTeam.City,
        name: apiTeam.Name,
        conference: apiTeam.Conference,
        division: apiTeam.Division,
        stadium_name: apiTeam.StadiumDetails?.Name,
        stadium_capacity: apiTeam.StadiumDetails?.Capacity,
        logo_url: apiTeam.WikipediaLogoUrl,
        primary_color: apiTeam.PrimaryColor,
        secondary_color: apiTeam.SecondaryColor
    };
}

export function adaptMLBTeam(apiTeam) {
    return {
        sport: 'MLB',
        team_id: apiTeam.TeamID,
        global_team_id: apiTeam.GlobalTeamID,
        key: apiTeam.Key,
        city: apiTeam.City,
        name: apiTeam.Name,
        conference: apiTeam.League, // AL or NL
        division: apiTeam.Division,
        stadium_name: apiTeam.StadiumDetails?.Name,
        stadium_capacity: apiTeam.StadiumDetails?.Capacity,
        logo_url: apiTeam.WikipediaLogoUrl,
        primary_color: apiTeam.PrimaryColor,
        secondary_color: apiTeam.SecondaryColor
    };
}

export function adaptCFBTeam(apiTeam) {
    return {
        sport: 'CFB',
        team_id: apiTeam.TeamID,
        global_team_id: apiTeam.GlobalTeamID,
        key: apiTeam.Key,
        school: apiTeam.School,
        name: apiTeam.Name,
        conference: apiTeam.Conference,
        division: apiTeam.Division,
        stadium_name: apiTeam.StadiumDetails?.Name,
        stadium_capacity: apiTeam.StadiumDetails?.Capacity,
        logo_url: apiTeam.TeamLogoUrl,
        primary_color: apiTeam.PrimaryColor,
        secondary_color: apiTeam.SecondaryColor
    };
}

export function adaptCBBTeam(apiTeam) {
    return {
        sport: 'CBB',
        team_id: apiTeam.TeamID,
        global_team_id: apiTeam.GlobalTeamID,
        key: apiTeam.Key,
        school: apiTeam.School,
        name: apiTeam.Name,
        conference: apiTeam.Conference,
        logo_url: apiTeam.TeamLogoUrl,
        primary_color: apiTeam.PrimaryColor,
        secondary_color: apiTeam.SecondaryColor
    };
}

// ===========================================
// STANDINGS ADAPTERS
// ===========================================

export function adaptNFLStanding(apiStanding, season) {
    return {
        sport: 'NFL',
        season: parseInt(season),
        season_type: 'REG',
        team_id: apiStanding.TeamID,
        team_key: apiStanding.Team,
        team_name: apiStanding.Name,
        conference: apiStanding.Conference,
        division: apiStanding.Division,
        wins: apiStanding.Wins,
        losses: apiStanding.Losses,
        ties: apiStanding.Ties || 0,
        win_percentage: apiStanding.Percentage || (apiStanding.Wins / (apiStanding.Wins + apiStanding.Losses + (apiStanding.Ties || 0))),
        streak: apiStanding.Streak,
        points_for: apiStanding.PointsFor,
        points_against: apiStanding.PointsAgainst,
        point_differential: apiStanding.PointDifferential || (apiStanding.PointsFor - apiStanding.PointsAgainst),
        home_wins: apiStanding.HomeWins,
        home_losses: apiStanding.HomeLosses,
        away_wins: apiStanding.AwayWins,
        away_losses: apiStanding.AwayLosses,
        conference_wins: apiStanding.ConferenceWins,
        conference_losses: apiStanding.ConferenceLosses,
        division_wins: apiStanding.DivisionWins,
        division_losses: apiStanding.DivisionLosses,
        division_rank: apiStanding.DivisionRank,
        conference_rank: apiStanding.ConferenceRank
    };
}

export function adaptMLBStanding(apiStanding, season) {
    return {
        sport: 'MLB',
        season: parseInt(season),
        season_type: 'REG',
        team_id: apiStanding.TeamID,
        team_key: apiStanding.Key,
        team_name: apiStanding.Name,
        conference: apiStanding.League,
        division: apiStanding.Division,
        wins: apiStanding.Wins,
        losses: apiStanding.Losses,
        win_percentage: apiStanding.Percentage,
        games_back: apiStanding.GamesBehind,
        streak: apiStanding.Streak,
        points_for: apiStanding.RunsScored,
        points_against: apiStanding.RunsAllowed,
        point_differential: apiStanding.RunDifferential,
        home_wins: apiStanding.HomeWins,
        home_losses: apiStanding.HomeLosses,
        away_wins: apiStanding.AwayWins,
        away_losses: apiStanding.AwayLosses,
        division_rank: apiStanding.DivisionRank
    };
}

export function adaptCFBStanding(apiStanding, season) {
    return {
        sport: 'CFB',
        season: parseInt(season),
        season_type: 'REG',
        team_id: apiStanding.TeamID,
        team_key: apiStanding.Team,
        team_name: apiStanding.School || apiStanding.Name,
        conference: apiStanding.Conference,
        wins: apiStanding.Wins,
        losses: apiStanding.Losses,
        win_percentage: apiStanding.Percentage,
        conference_wins: apiStanding.ConferenceWins,
        conference_losses: apiStanding.ConferenceLosses,
        points_for: apiStanding.PointsFor,
        points_against: apiStanding.PointsAgainst,
        point_differential: apiStanding.PointDifferential
    };
}

// ===========================================
// PLAYER ADAPTERS
// ===========================================

export function adaptNFLPlayer(apiPlayer) {
    return {
        sport: 'NFL',
        player_id: apiPlayer.PlayerID,
        team_id: apiPlayer.TeamID,
        first_name: apiPlayer.FirstName,
        last_name: apiPlayer.LastName,
        full_name: apiPlayer.Name,
        position: apiPlayer.Position,
        jersey_number: apiPlayer.Number,
        height: apiPlayer.Height,
        weight: apiPlayer.Weight,
        birth_date: apiPlayer.BirthDate,
        birth_city: apiPlayer.BirthCity,
        birth_state: apiPlayer.BirthState,
        college: apiPlayer.College,
        experience: apiPlayer.Experience,
        status: apiPlayer.Status,
        photo_url: apiPlayer.PhotoUrl
    };
}

export function adaptMLBPlayer(apiPlayer) {
    return {
        sport: 'MLB',
        player_id: apiPlayer.PlayerID,
        team_id: apiPlayer.TeamID,
        first_name: apiPlayer.FirstName,
        last_name: apiPlayer.LastName,
        full_name: apiPlayer.Name,
        position: apiPlayer.Position,
        jersey_number: apiPlayer.Jersey,
        height: apiPlayer.Height,
        weight: apiPlayer.Weight,
        birth_date: apiPlayer.BirthDate,
        birth_city: apiPlayer.BirthCity,
        birth_state: apiPlayer.BirthState,
        status: apiPlayer.Status,
        photo_url: apiPlayer.PhotoUrl
    };
}

export function adaptCFBPlayer(apiPlayer) {
    return {
        sport: 'CFB',
        player_id: apiPlayer.PlayerID,
        team_id: apiPlayer.TeamID,
        first_name: apiPlayer.FirstName,
        last_name: apiPlayer.LastName,
        full_name: apiPlayer.Name,
        position: apiPlayer.Position,
        jersey_number: apiPlayer.Jersey,
        height: apiPlayer.Height,
        weight: apiPlayer.Weight,
        college: apiPlayer.School,
        experience: apiPlayer.Class,
        status: apiPlayer.Status
    };
}

// ===========================================
// GAME ADAPTERS
// ===========================================

export function adaptNFLGame(apiGame, season) {
    return {
        sport: 'NFL',
        game_id: apiGame.GameID,
        season: parseInt(season),
        season_type: apiGame.SeasonType === 1 ? 'REG' : 'POST',
        week: apiGame.Week,
        game_date: apiGame.Date || apiGame.DateTime,
        game_time: apiGame.Time,
        status: apiGame.Status,
        home_team_id: apiGame.HomeTeamID,
        home_team_key: apiGame.HomeTeam,
        home_team_name: apiGame.HomeTeamName,
        home_score: apiGame.HomeScore,
        away_team_id: apiGame.AwayTeamID,
        away_team_key: apiGame.AwayTeam,
        away_team_name: apiGame.AwayTeamName,
        away_score: apiGame.AwayScore,
        stadium_name: apiGame.StadiumDetails?.Name,
        channel: apiGame.Channel,
        neutral_site: apiGame.NeutralVenue || false,
        attendance: apiGame.Attendance,
        winning_team_id: apiGame.Winner
    };
}

export function adaptMLBGame(apiGame, season) {
    return {
        sport: 'MLB',
        game_id: apiGame.GameID,
        season: parseInt(season),
        season_type: 'REG',
        game_date: apiGame.Day || apiGame.DateTime,
        game_time: apiGame.DateTime,
        status: apiGame.Status,
        home_team_id: apiGame.HomeTeamID,
        home_team_key: apiGame.HomeTeam,
        home_team_name: apiGame.HomeTeamName,
        home_score: apiGame.HomeTeamRuns,
        away_team_id: apiGame.AwayTeamID,
        away_team_key: apiGame.AwayTeam,
        away_team_name: apiGame.AwayTeamName,
        away_score: apiGame.AwayTeamRuns,
        stadium_name: apiGame.StadiumDetails?.Name,
        channel: apiGame.Channel,
        attendance: apiGame.Attendance,
        winning_team_id: apiGame.WinningTeamID
    };
}

export function adaptCFBGame(apiGame, season) {
    return {
        sport: 'CFB',
        game_id: apiGame.GameID,
        season: parseInt(season),
        season_type: apiGame.SeasonType === 1 ? 'REG' : 'POST',
        week: apiGame.Week,
        game_date: apiGame.Day || apiGame.DateTime,
        game_time: apiGame.DateTime,
        status: apiGame.Status,
        home_team_id: apiGame.HomeTeamID,
        home_team_key: apiGame.HomeTeam,
        home_team_name: apiGame.HomeTeamName,
        home_score: apiGame.HomeTeamScore,
        away_team_id: apiGame.AwayTeamID,
        away_team_key: apiGame.AwayTeam,
        away_team_name: apiGame.AwayTeamName,
        away_score: apiGame.AwayTeamScore,
        stadium_name: apiGame.StadiumDetails?.Name,
        channel: apiGame.Channel,
        neutral_site: apiGame.NeutralVenue || false,
        attendance: apiGame.Attendance
    };
}

// ===========================================
// TEAM SEASON STATS ADAPTERS
// ===========================================

export function adaptNFLTeamSeasonStats(apiStats, season) {
    return {
        sport: 'NFL',
        season: parseInt(season),
        season_type: 'REG',
        team_id: apiStats.TeamID,
        team_key: apiStats.Team,
        games_played: apiStats.Games,
        wins: apiStats.Wins,
        losses: apiStats.Losses,
        points_for: apiStats.PointsFor,
        points_against: apiStats.PointsAgainst,
        total_yards: apiStats.TotalYards,
        passing_yards: apiStats.PassingYards,
        rushing_yards: apiStats.RushingYards,
        turnovers: apiStats.Giveaways,
        sacks: apiStats.Sacks,
        third_down_pct: apiStats.ThirdDownPercentage,
        stats_json: JSON.stringify(apiStats)
    };
}

export function adaptMLBTeamSeasonStats(apiStats, season) {
    return {
        sport: 'MLB',
        season: parseInt(season),
        season_type: 'REG',
        team_id: apiStats.TeamID,
        team_key: apiStats.Team,
        games_played: apiStats.Games,
        wins: apiStats.Wins,
        losses: apiStats.Losses,
        runs_scored: apiStats.Runs,
        runs_allowed: apiStats.RunsAllowed,
        hits: apiStats.Hits,
        home_runs: apiStats.HomeRuns,
        batting_avg: apiStats.BattingAverage,
        era: apiStats.EarnedRunAverage,
        whip: apiStats.Whip,
        stats_json: JSON.stringify(apiStats)
    };
}

export function adaptCFBTeamSeasonStats(apiStats, season) {
    return {
        sport: 'CFB',
        season: parseInt(season),
        season_type: 'REG',
        team_id: apiStats.TeamID,
        team_key: apiStats.Team,
        games_played: apiStats.Games,
        wins: apiStats.Wins,
        losses: apiStats.Losses,
        points_for: apiStats.PointsFor,
        points_against: apiStats.PointsAgainst,
        total_yards: apiStats.TotalYards,
        passing_yards: apiStats.PassingYards,
        rushing_yards: apiStats.RushingYards,
        turnovers: apiStats.Giveaways,
        stats_json: JSON.stringify(apiStats)
    };
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Batch insert teams into D1
 */
export async function upsertTeams(db, teams) {
    const stmt = db.prepare(`
        INSERT INTO teams (
            sport, team_id, global_team_id, key, city, name, school,
            conference, division, stadium_name, stadium_capacity,
            logo_url, primary_color, secondary_color, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(sport, team_id) DO UPDATE SET
            global_team_id = excluded.global_team_id,
            key = excluded.key,
            city = excluded.city,
            name = excluded.name,
            school = excluded.school,
            conference = excluded.conference,
            division = excluded.division,
            stadium_name = excluded.stadium_name,
            stadium_capacity = excluded.stadium_capacity,
            logo_url = excluded.logo_url,
            primary_color = excluded.primary_color,
            secondary_color = excluded.secondary_color,
            updated_at = datetime('now')
    `);

    const batch = teams.map(team => stmt.bind(
        team.sport,
        team.team_id,
        team.global_team_id,
        team.key,
        team.city,
        team.name,
        team.school,
        team.conference,
        team.division,
        team.stadium_name,
        team.stadium_capacity,
        team.logo_url,
        team.primary_color,
        team.secondary_color
    ));

    return await db.batch(batch);
}

/**
 * Batch insert standings into D1
 */
export async function upsertStandings(db, standings) {
    const stmt = db.prepare(`
        INSERT INTO standings (
            sport, season, season_type, team_id, team_key, team_name,
            conference, division, wins, losses, ties, win_percentage,
            games_back, streak, points_for, points_against, point_differential,
            home_wins, home_losses, away_wins, away_losses,
            conference_wins, conference_losses, division_wins, division_losses,
            division_rank, conference_rank, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(sport, season, season_type, team_id) DO UPDATE SET
            team_key = excluded.team_key,
            team_name = excluded.team_name,
            conference = excluded.conference,
            division = excluded.division,
            wins = excluded.wins,
            losses = excluded.losses,
            ties = excluded.ties,
            win_percentage = excluded.win_percentage,
            games_back = excluded.games_back,
            streak = excluded.streak,
            points_for = excluded.points_for,
            points_against = excluded.points_against,
            point_differential = excluded.point_differential,
            home_wins = excluded.home_wins,
            home_losses = excluded.home_losses,
            away_wins = excluded.away_wins,
            away_losses = excluded.away_losses,
            conference_wins = excluded.conference_wins,
            conference_losses = excluded.conference_losses,
            division_wins = excluded.division_wins,
            division_losses = excluded.division_losses,
            division_rank = excluded.division_rank,
            conference_rank = excluded.conference_rank,
            last_updated = datetime('now')
    `);

    const batch = standings.map(standing => stmt.bind(
        standing.sport,
        standing.season,
        standing.season_type,
        standing.team_id,
        standing.team_key,
        standing.team_name,
        standing.conference,
        standing.division,
        standing.wins,
        standing.losses,
        standing.ties,
        standing.win_percentage,
        standing.games_back,
        standing.streak,
        standing.points_for,
        standing.points_against,
        standing.point_differential,
        standing.home_wins,
        standing.home_losses,
        standing.away_wins,
        standing.away_losses,
        standing.conference_wins,
        standing.conference_losses,
        standing.division_wins,
        standing.division_losses,
        standing.division_rank,
        standing.conference_rank
    ));

    return await db.batch(batch);
}

/**
 * Batch insert games into D1
 */
export async function upsertGames(db, games) {
    const stmt = db.prepare(`
        INSERT INTO games (
            sport, game_id, season, season_type, week, game_date, game_time,
            status, home_team_id, home_team_key, home_team_name, home_score,
            away_team_id, away_team_key, away_team_name, away_score,
            stadium_name, channel, neutral_site, attendance, winning_team_id,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(sport, game_id) DO UPDATE SET
            status = excluded.status,
            home_score = excluded.home_score,
            away_score = excluded.away_score,
            attendance = excluded.attendance,
            winning_team_id = excluded.winning_team_id,
            updated_at = datetime('now')
    `);

    const batch = games.map(game => stmt.bind(
        game.sport,
        game.game_id,
        game.season,
        game.season_type,
        game.week,
        game.game_date,
        game.game_time,
        game.status,
        game.home_team_id,
        game.home_team_key,
        game.home_team_name,
        game.home_score,
        game.away_team_id,
        game.away_team_key,
        game.away_team_name,
        game.away_score,
        game.stadium_name,
        game.channel,
        game.neutral_site ? 1 : 0,
        game.attendance,
        game.winning_team_id
    ));

    return await db.batch(batch);
}
