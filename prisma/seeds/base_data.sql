DROP FUNCTION IF EXISTS upsert_standing(text, integer);
DROP FUNCTION IF EXISTS upsert_team(text, text, text, text, text, text);

-- Helper function to upsert a team
CREATE OR REPLACE FUNCTION upsert_team(conf_slug TEXT, team_slug TEXT, display_name TEXT, short_name TEXT, nickname TEXT, location TEXT)
RETURNS VOID AS $$
DECLARE
    conf_id TEXT;
BEGIN
    SELECT "id" INTO conf_id FROM "Conference"
    WHERE "sport" = 'baseball' AND "slug" = conf_slug;

    INSERT INTO "Team" ("id", "slug", "displayName", "shortName", "nickname", "location", "conferenceId")
    VALUES (gen_random_uuid(), team_slug, display_name, short_name, nickname, location, conf_id)
    ON CONFLICT ("sport", "slug") DO UPDATE
      SET "displayName" = EXCLUDED."displayName",
          "shortName" = EXCLUDED."shortName",
          "nickname" = EXCLUDED."nickname",
          "location" = EXCLUDED."location",
          "conferenceId" = conf_id,
          "updatedAt" = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Helper function to upsert standings
CREATE OR REPLACE FUNCTION upsert_standing(team_slug TEXT, season_input INTEGER)
RETURNS VOID AS $$
DECLARE
    team_record RECORD;
BEGIN
    SELECT t."id" AS team_id, t."conferenceId" AS conference_id INTO team_record
    FROM "Team" t
    WHERE t."sport" = 'baseball' AND t."slug" = team_slug;

    IF team_record.team_id IS NULL THEN
        RETURN;
    END IF;

    INSERT INTO "Standing" ("id", "sport", "season", "type", "teamId", "conferenceId", "wins", "losses", "ties", "winPct")
    VALUES (gen_random_uuid(), 'baseball', season_input, 'CONFERENCE', team_record.team_id, team_record.conference_id, 0, 0, 0, 0.000)
    ON CONFLICT ("sport", "season", "type", "teamId") DO UPDATE
      SET "conferenceId" = EXCLUDED."conferenceId",
          "updatedAt" = CURRENT_TIMESTAMP,
          "fetchedAt" = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    target_season INTEGER := CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 7 THEN EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1 ELSE EXTRACT(YEAR FROM CURRENT_DATE)::INT END;
BEGIN
    -- Conferences
    INSERT INTO "Conference" ("id", "slug", "name", "division")
    VALUES
        (gen_random_uuid(), 'sec', 'Southeastern Conference', 'Division I'),
        (gen_random_uuid(), 'acc', 'Atlantic Coast Conference', 'Division I'),
        (gen_random_uuid(), 'big-12', 'Big 12 Conference', 'Division I'),
        (gen_random_uuid(), 'pac-12', 'Pac-12 Conference', 'Division I'),
        (gen_random_uuid(), 'sun-belt', 'Sun Belt Conference', 'Division I')
    ON CONFLICT ("sport", "slug") DO UPDATE
      SET "name" = EXCLUDED."name",
          "division" = EXCLUDED."division",
          "updatedAt" = CURRENT_TIMESTAMP;

    -- Teams
    PERFORM upsert_team('sec', 'lsu', 'Louisiana State Tigers', 'LSU', 'Tigers', 'Baton Rouge, LA');
    PERFORM upsert_team('sec', 'arkansas', 'Arkansas Razorbacks', 'ARK', 'Razorbacks', 'Fayetteville, AR');
    PERFORM upsert_team('sec', 'florida', 'Florida Gators', 'UF', 'Gators', 'Gainesville, FL');
    PERFORM upsert_team('sec', 'tennessee', 'Tennessee Volunteers', 'UT', 'Volunteers', 'Knoxville, TN');
    PERFORM upsert_team('sec', 'vanderbilt', 'Vanderbilt Commodores', 'VU', 'Commodores', 'Nashville, TN');
    PERFORM upsert_team('sec', 'texas', 'Texas Longhorns', 'UT', 'Longhorns', 'Austin, TX');

    PERFORM upsert_team('acc', 'clemson', 'Clemson Tigers', 'CLEM', 'Tigers', 'Clemson, SC');
    PERFORM upsert_team('acc', 'wake-forest', 'Wake Forest Demon Deacons', 'WAKE', 'Demon Deacons', 'Winston-Salem, NC');
    PERFORM upsert_team('acc', 'north-carolina', 'North Carolina Tar Heels', 'UNC', 'Tar Heels', 'Chapel Hill, NC');
    PERFORM upsert_team('acc', 'florida-state', 'Florida State Seminoles', 'FSU', 'Seminoles', 'Tallahassee, FL');
    PERFORM upsert_team('acc', 'duke', 'Duke Blue Devils', 'DUKE', 'Blue Devils', 'Durham, NC');

    PERFORM upsert_team('big-12', 'oklahoma-state', 'Oklahoma State Cowboys', 'OSU', 'Cowboys', 'Stillwater, OK');
    PERFORM upsert_team('big-12', 'texas-tech', 'Texas Tech Red Raiders', 'TTU', 'Red Raiders', 'Lubbock, TX');
    PERFORM upsert_team('big-12', 'tcu', 'TCU Horned Frogs', 'TCU', 'Horned Frogs', 'Fort Worth, TX');
    PERFORM upsert_team('big-12', 'west-virginia', 'West Virginia Mountaineers', 'WVU', 'Mountaineers', 'Morgantown, WV');

    PERFORM upsert_team('pac-12', 'stanford', 'Stanford Cardinal', 'STAN', 'Cardinal', 'Stanford, CA');
    PERFORM upsert_team('pac-12', 'oregon-state', 'Oregon State Beavers', 'OSU', 'Beavers', 'Corvallis, OR');
    PERFORM upsert_team('pac-12', 'arizona', 'Arizona Wildcats', 'ARIZ', 'Wildcats', 'Tucson, AZ');
    PERFORM upsert_team('pac-12', 'ucla', 'UCLA Bruins', 'UCLA', 'Bruins', 'Los Angeles, CA');

    PERFORM upsert_team('sun-belt', 'southern-miss', 'Southern Miss Golden Eagles', 'USM', 'Golden Eagles', 'Hattiesburg, MS');
    PERFORM upsert_team('sun-belt', 'coastal-carolina', 'Coastal Carolina Chanticleers', 'CCU', 'Chanticleers', 'Conway, SC');
    PERFORM upsert_team('sun-belt', 'troy', 'Troy Trojans', 'TROY', 'Trojans', 'Troy, AL');

    -- Standings for each team
    PERFORM upsert_standing(team.slug, target_season)
      FROM (
        SELECT slug FROM "Team" WHERE "sport" = 'baseball'
      ) AS team;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS upsert_standing(text, integer);
DROP FUNCTION IF EXISTS upsert_team(text, text, text, text, text, text);
