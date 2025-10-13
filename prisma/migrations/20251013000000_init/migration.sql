-- CreateEnum
CREATE TYPE "Sport" AS ENUM ('BASEBALL', 'SOFTBALL', 'OTHER');

CREATE TYPE "Handedness" AS ENUM ('LEFT', 'RIGHT', 'SWITCH');

CREATE TYPE "SeasonType" AS ENUM ('PRESEASON', 'REGULAR', 'POSTSEASON');

CREATE TYPE "GameStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'FINAL', 'DELAYED', 'POSTPONED', 'CANCELLED');

CREATE TYPE "InningHalf" AS ENUM ('TOP', 'BOTTOM');

CREATE TYPE "EventType" AS ENUM ('PITCH', 'SINGLE', 'DOUBLE', 'TRIPLE', 'HOMERUN', 'WALK', 'STRIKEOUT', 'FLYOUT', 'GROUNDOUT', 'FIELDERS_CHOICE', 'SACRIFICE', 'STEAL', 'PICKOFF', 'ERROR', 'WILD_PITCH', 'PASSED_BALL', 'BALK', 'RUN', 'REVIEW', 'OTHER');

CREATE TYPE "BoxLineRole" AS ENUM ('BATTER', 'PITCHER', 'FIELDER');

CREATE TYPE "StatScope" AS ENUM ('GAME', 'SERIES', 'SEASON', 'TOURNAMENT', 'OVERALL');

CREATE TYPE "RankingType" AS ENUM ('D1_BASEBALL', 'USA_TODAY', 'COACHES', 'BASEBALL_AMERICA', 'INTERNAL_MODEL');

CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateTable Team
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "conference" TEXT,
    "division" TEXT,
    "league" TEXT,
    "level" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "sport" "Sport" NOT NULL DEFAULT 'BASEBALL',
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "logoUrl" TEXT,
    "recordOverall" TEXT,
    "recordConference" TEXT,
    "nationalRank" INTEGER,
    "foundedYear" INTEGER,
    "venueName" TEXT,
    "venueCapacity" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable Player
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "teamId" TEXT,
    "slug" TEXT,
    "fullName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "jerseyNumber" INTEGER,
    "position" TEXT,
    "bats" "Handedness",
    "throws" "Handedness",
    "classYear" TEXT,
    "heightCm" INTEGER,
    "weightKg" INTEGER,
    "hometown" TEXT,
    "homeState" TEXT,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "dateOfBirth" TIMESTAMP(3),
    "arrivalYear" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable Game
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "season" INTEGER NOT NULL,
    "seasonType" "SeasonType" NOT NULL DEFAULT 'REGULAR',
    "sport" "Sport" NOT NULL DEFAULT 'BASEBALL',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "status" "GameStatus" NOT NULL DEFAULT 'SCHEDULED',
    "stage" TEXT,
    "week" INTEGER,
    "dayOfWeek" TEXT,
    "neutralSite" BOOLEAN NOT NULL DEFAULT FALSE,
    "conferenceGame" BOOLEAN NOT NULL DEFAULT FALSE,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "homeScore" INTEGER DEFAULT 0,
    "awayScore" INTEGER DEFAULT 0,
    "homeHits" INTEGER DEFAULT 0,
    "awayHits" INTEGER DEFAULT 0,
    "homeErrors" INTEGER DEFAULT 0,
    "awayErrors" INTEGER DEFAULT 0,
    "inningsScheduled" INTEGER DEFAULT 9,
    "inningsPlayed" INTEGER,
    "venueName" TEXT,
    "venueCity" TEXT,
    "venueState" TEXT,
    "attendance" INTEGER,
    "weather" JSONB,
    "broadcast" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable Event
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "teamId" TEXT,
    "playerId" TEXT,
    "sequence" INTEGER NOT NULL,
    "inning" INTEGER NOT NULL,
    "half" "InningHalf" NOT NULL,
    "eventType" "EventType" NOT NULL,
    "description" TEXT NOT NULL,
    "detail" JSONB,
    "outsBefore" INTEGER,
    "outsAfter" INTEGER,
    "balls" INTEGER,
    "strikes" INTEGER,
    "pitchNumber" INTEGER,
    "batterHand" "Handedness",
    "pitcherHand" "Handedness",
    "baseStateBefore" JSONB,
    "baseStateAfter" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable BoxLine
CREATE TABLE "BoxLine" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "playerId" TEXT,
    "role" "BoxLineRole" NOT NULL DEFAULT 'BATTER',
    "battingOrder" INTEGER,
    "started" BOOLEAN NOT NULL DEFAULT FALSE,
    "plateAppearances" INTEGER DEFAULT 0,
    "atBats" INTEGER DEFAULT 0,
    "runs" INTEGER DEFAULT 0,
    "hits" INTEGER DEFAULT 0,
    "doubles" INTEGER DEFAULT 0,
    "triples" INTEGER DEFAULT 0,
    "homeRuns" INTEGER DEFAULT 0,
    "runsBattedIn" INTEGER DEFAULT 0,
    "walks" INTEGER DEFAULT 0,
    "strikeouts" INTEGER DEFAULT 0,
    "hitByPitch" INTEGER DEFAULT 0,
    "sacrificeFlies" INTEGER DEFAULT 0,
    "sacrificeBunts" INTEGER DEFAULT 0,
    "stolenBases" INTEGER DEFAULT 0,
    "caughtStealing" INTEGER DEFAULT 0,
    "totalBases" INTEGER DEFAULT 0,
    "onBasePercentage" DECIMAL(5,3),
    "sluggingPercentage" DECIMAL(5,3),
    "battingAverage" DECIMAL(5,3),
    "inningsPitched" DECIMAL(4,1),
    "battersFaced" INTEGER,
    "hitsAllowed" INTEGER,
    "runsAllowed" INTEGER,
    "earnedRuns" INTEGER,
    "walksAllowed" INTEGER,
    "strikeoutsThrown" INTEGER,
    "homeRunsAllowed" INTEGER,
    "hitBatters" INTEGER,
    "pitches" INTEGER,
    "strikesThrown" INTEGER,
    "decision" TEXT,
    "save" BOOLEAN NOT NULL DEFAULT FALSE,
    "hold" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BoxLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable TeamStats
CREATE TABLE "TeamStats" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "gameId" TEXT,
    "season" INTEGER NOT NULL,
    "scope" "StatScope" NOT NULL DEFAULT 'SEASON',
    "split" TEXT NOT NULL DEFAULT 'overall',
    "gamesPlayed" INTEGER DEFAULT 0,
    "wins" INTEGER DEFAULT 0,
    "losses" INTEGER DEFAULT 0,
    "ties" INTEGER DEFAULT 0,
    "runsScored" INTEGER DEFAULT 0,
    "runsAllowed" INTEGER DEFAULT 0,
    "battingAverage" DECIMAL(5,3),
    "onBasePercentage" DECIMAL(5,3),
    "sluggingPercentage" DECIMAL(5,3),
    "era" DECIMAL(5,2),
    "whip" DECIMAL(5,2),
    "strikeouts" INTEGER DEFAULT 0,
    "walks" INTEGER DEFAULT 0,
    "stolenBases" INTEGER DEFAULT 0,
    "opponentBattingAvg" DECIMAL(5,3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable PlayerStats
CREATE TABLE "PlayerStats" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamId" TEXT,
    "season" INTEGER NOT NULL,
    "scope" "StatScope" NOT NULL DEFAULT 'SEASON',
    "split" TEXT NOT NULL DEFAULT 'overall',
    "gamesPlayed" INTEGER DEFAULT 0,
    "gamesStarted" INTEGER DEFAULT 0,
    "plateAppearances" INTEGER DEFAULT 0,
    "atBats" INTEGER DEFAULT 0,
    "runs" INTEGER DEFAULT 0,
    "hits" INTEGER DEFAULT 0,
    "doubles" INTEGER DEFAULT 0,
    "triples" INTEGER DEFAULT 0,
    "homeRuns" INTEGER DEFAULT 0,
    "runsBattedIn" INTEGER DEFAULT 0,
    "walks" INTEGER DEFAULT 0,
    "strikeouts" INTEGER DEFAULT 0,
    "hitByPitch" INTEGER DEFAULT 0,
    "stolenBases" INTEGER DEFAULT 0,
    "caughtStealing" INTEGER DEFAULT 0,
    "battingAverage" DECIMAL(5,3),
    "onBasePercentage" DECIMAL(5,3),
    "sluggingPercentage" DECIMAL(5,3),
    "ops" DECIMAL(5,3),
    "totalBases" INTEGER,
    "inningsPitched" DECIMAL(5,1),
    "wins" INTEGER DEFAULT 0,
    "losses" INTEGER DEFAULT 0,
    "saves" INTEGER DEFAULT 0,
    "holds" INTEGER DEFAULT 0,
    "gamesFinished" INTEGER DEFAULT 0,
    "era" DECIMAL(5,2),
    "whip" DECIMAL(5,2),
    "strikeoutsPitched" INTEGER DEFAULT 0,
    "walksAllowed" INTEGER DEFAULT 0,
    "hitsAllowed" INTEGER DEFAULT 0,
    "homeRunsAllowed" INTEGER DEFAULT 0,
    "opponentBattingAvg" DECIMAL(5,3),
    "appearances" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable Ranking
CREATE TABLE "Ranking" (
    "id" TEXT NOT NULL,
    "poll" "RankingType" NOT NULL,
    "season" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "teamId" TEXT NOT NULL,
    "points" INTEGER,
    "firstPlaceVotes" INTEGER,
    "previousRank" INTEGER,
    "trend" INTEGER,
    "note" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id")
);

-- CreateTable Article
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "source" TEXT,
    "author" TEXT,
    "tags" TEXT[],
    "heroMedia" JSONB,
    "gameId" TEXT,
    "teamId" TEXT,
    "playerId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey constraints
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Game" ADD CONSTRAINT "Game_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Game" ADD CONSTRAINT "Game_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Event" ADD CONSTRAINT "Event_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BoxLine" ADD CONSTRAINT "BoxLine_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BoxLine" ADD CONSTRAINT "BoxLine_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BoxLine" ADD CONSTRAINT "BoxLine_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TeamStats" ADD CONSTRAINT "TeamStats_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamStats" ADD CONSTRAINT "TeamStats_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PlayerStats" ADD CONSTRAINT "PlayerStats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerStats" ADD CONSTRAINT "PlayerStats_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Article" ADD CONSTRAINT "Article_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Article" ADD CONSTRAINT "Article_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Article" ADD CONSTRAINT "Article_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndexes
CREATE UNIQUE INDEX "Team_externalId_key" ON "Team"("externalId");
CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");
CREATE INDEX "Team_conference_idx" ON "Team"("conference");
CREATE INDEX "Team_sport_idx" ON "Team"("sport");

CREATE UNIQUE INDEX "Player_externalId_key" ON "Player"("externalId");
CREATE UNIQUE INDEX "Player_slug_key" ON "Player"("slug");
CREATE INDEX "Player_teamId_idx" ON "Player"("teamId");
CREATE INDEX "Player_position_idx" ON "Player"("position");

CREATE UNIQUE INDEX "Game_externalId_key" ON "Game"("externalId");
CREATE INDEX "Game_season_seasonType_idx" ON "Game"("season", "seasonType");
CREATE INDEX "Game_startTime_idx" ON "Game"("startTime");
CREATE INDEX "Game_status_idx" ON "Game"("status");

CREATE INDEX "Event_gameId_sequence_idx" ON "Event"("gameId", "sequence");
CREATE INDEX "Event_teamId_idx" ON "Event"("teamId");
CREATE INDEX "Event_playerId_idx" ON "Event"("playerId");

CREATE INDEX "BoxLine_gameId_teamId_idx" ON "BoxLine"("gameId", "teamId");
CREATE INDEX "BoxLine_playerId_idx" ON "BoxLine"("playerId");

CREATE INDEX "TeamStats_teamId_season_idx" ON "TeamStats"("teamId", "season");
CREATE INDEX "TeamStats_scope_idx" ON "TeamStats"("scope");
CREATE UNIQUE INDEX "team_stats_scope_unique" ON "TeamStats"("teamId", "season", "scope", "split");
CREATE UNIQUE INDEX "team_stats_game_unique" ON "TeamStats"("teamId", "gameId");

CREATE INDEX "PlayerStats_playerId_season_idx" ON "PlayerStats"("playerId", "season");
CREATE INDEX "PlayerStats_teamId_idx" ON "PlayerStats"("teamId");
CREATE UNIQUE INDEX "PlayerStats_playerId_season_scope_split_key" ON "PlayerStats"("playerId", "season", "scope", "split");

CREATE UNIQUE INDEX "Ranking_poll_season_week_rank_key" ON "Ranking"("poll", "season", "week", "rank");
CREATE INDEX "Ranking_teamId_season_week_idx" ON "Ranking"("teamId", "season", "week");

CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
CREATE INDEX "Article_gameId_idx" ON "Article"("gameId");
CREATE INDEX "Article_teamId_idx" ON "Article"("teamId");
CREATE INDEX "Article_playerId_idx" ON "Article"("playerId");
