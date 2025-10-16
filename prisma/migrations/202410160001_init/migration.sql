CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE "GameStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINAL', 'POSTPONED', 'CANCELLED');
CREATE TYPE "InningHalf" AS ENUM ('TOP', 'BOTTOM');
CREATE TYPE "StandingType" AS ENUM ('OVERALL', 'CONFERENCE', 'DIVISION');

-- Conferences
CREATE TABLE "Conference" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "division" TEXT,
    "sport" TEXT NOT NULL DEFAULT 'baseball',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Teams
CREATE TABLE "Team" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "shortName" TEXT,
    "nickname" TEXT,
    "location" TEXT,
    "logo" TEXT,
    "sport" TEXT NOT NULL DEFAULT 'baseball',
    "conferenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Team_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Players
CREATE TABLE "Player" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "teamId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "position" TEXT,
    "jerseyNumber" INTEGER,
    "classYear" TEXT,
    "sport" TEXT NOT NULL DEFAULT 'baseball',
    "provider" TEXT,
    "providerId" TEXT,
    "hometown" TEXT,
    "height" TEXT,
    "weight" INTEGER,
    "bats" TEXT,
    "throws" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Games
CREATE TABLE "Game" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "sport" TEXT NOT NULL DEFAULT 'baseball',
    "season" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'SCHEDULED',
    "venue" TEXT,
    "neutralSite" BOOLEAN NOT NULL DEFAULT FALSE,
    "provider" TEXT,
    "providerGameId" TEXT,
    "conferenceId" TEXT,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "inning" INTEGER,
    "inningHalf" "InningHalf",
    "lastPlay" TEXT,
    "boxscoreHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Game_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Game_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Game_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Game Events
CREATE TABLE "GameEvent" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "gameId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "inning" INTEGER,
    "inningHalf" "InningHalf",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameEvent_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Standings
CREATE TABLE "Standing" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "sport" TEXT NOT NULL DEFAULT 'baseball',
    "season" INTEGER NOT NULL,
    "type" "StandingType" NOT NULL DEFAULT 'CONFERENCE',
    "teamId" TEXT NOT NULL,
    "conferenceId" TEXT,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "ties" INTEGER NOT NULL DEFAULT 0,
    "winPct" DECIMAL(5,3) NOT NULL DEFAULT 0,
    "streak" TEXT,
    "lastTen" TEXT,
    "provider" TEXT,
    "providerId" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Standing_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Standing_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indexes & constraints
CREATE UNIQUE INDEX "Conference_sport_slug_key" ON "Conference" ("sport", "slug");
CREATE INDEX "Conference_sport_idx" ON "Conference" ("sport");

CREATE UNIQUE INDEX "Team_sport_slug_key" ON "Team" ("sport", "slug");
CREATE INDEX "Team_conferenceId_idx" ON "Team" ("conferenceId");

CREATE UNIQUE INDEX "Player_sport_provider_providerId_key" ON "Player" ("sport", "provider", "providerId");
CREATE INDEX "Player_teamId_idx" ON "Player" ("teamId");

CREATE INDEX "Game_startTime_idx" ON "Game" ("startTime");
CREATE UNIQUE INDEX "Game_sport_provider_providerGameId_key" ON "Game" ("sport", "provider", "providerGameId");

CREATE UNIQUE INDEX "GameEvent_gameId_sequenceNumber_key" ON "GameEvent" ("gameId", "sequenceNumber");
CREATE INDEX "GameEvent_gameId_idx" ON "GameEvent" ("gameId");

CREATE UNIQUE INDEX "Standing_sport_season_type_teamId_key" ON "Standing" ("sport", "season", "type", "teamId");
CREATE INDEX "Standing_conferenceId_idx" ON "Standing" ("conferenceId");
