import test from 'node:test';
import assert from 'node:assert/strict';

import { PerfectGamePipeline } from '../api/perfect-game-pipeline.js';

class MockDiamondKastClient {
    constructor(events = []) {
        this.events = events;
    }

    async *streamAtBats() {
        for (const event of this.events) {
            await Promise.resolve();
            yield event;
        }
    }
}

class MockLiveStatsClient {
    constructor(events = []) {
        this.events = events;
    }

    async *streamGame() {
        for (const event of this.events) {
            await Promise.resolve();
            yield event;
        }
    }
}

class MockBoxscoreScraper {
    constructor(result) {
        this.result = result;
        this.calls = [];
    }

    async scrapeBoxscore(url) {
        this.calls.push(url);
        return this.result;
    }
}

test('normalizeAtBat maps core fields', () => {
    const pipeline = new PerfectGamePipeline();
    const normalized = pipeline.normalizeAtBat(
        {
            id: '123',
            batter: { name: 'Player A' },
            pitcher: { name: 'Player B' },
            count: { balls: 1, strikes: 2, outs: 1 },
            result: { description: 'Single to center' },
            pitchMetrics: { velocity: 91.2 },
            updatedAt: '2024-05-01T12:00:00Z',
            raw: { test: true }
        },
        { gameId: 'game-1', sequence: 5 }
    );

    assert.equal(normalized.type, 'at-bat');
    assert.equal(normalized.gameId, 'game-1');
    assert.equal(normalized.sequence, 5);
    assert.equal(normalized.batter.name, 'Player A');
    assert.equal(normalized.pitch.velocity, 91.2);
    assert.deepEqual(normalized.raw, { test: true });
});

test('ingestGame streams from DiamondKast adapter', async () => {
    const diamondEvents = [
        {
            id: 'ab-1',
            batter: { name: 'Lead Off' },
            pitcher: { name: 'Ace' },
            count: { balls: 0, strikes: 0, outs: 0 },
            result: { description: 'Walk' },
            updatedAt: '2024-05-01T00:00:01Z',
            raw: { source: 'dk' }
        },
        {
            id: 'ab-2',
            batter: { name: 'Two Hole' },
            pitcher: { name: 'Ace' },
            count: { balls: 1, strikes: 1, outs: 0 },
            result: { description: 'Flyout' },
            updatedAt: '2024-05-01T00:00:30Z'
        }
    ];

    const pipeline = new PerfectGamePipeline().withAdapters({ diamondKastClient: new MockDiamondKastClient(diamondEvents) });
    const result = await pipeline.ingestGame({ gameId: 'game-1', source: 'diamondkast' });

    assert.equal(result.events.length, 2);
    assert.equal(result.events[0].batter.name, 'Lead Off');
    assert.equal(result.events[1].sequence, 1);
    assert.equal(result.completed, false);
});

test('ingestGame streams from NCAA LiveStats adapter', async () => {
    const livestatsEvents = [
        {
            type: 'pitch',
            payload: {
                playId: 'pitch-1',
                description: 'Called strike',
                balls: 0,
                strikes: 1,
                outs: 0
            },
            raw: '<play id="1">strike</play>',
            receivedAt: '2024-05-01T00:01:00Z'
        },
        {
            type: 'play',
            payload: {
                playId: 'pitch-2',
                description: 'Groundout',
                outs: 1
            },
            raw: '<play id="2">groundout</play>',
            receivedAt: '2024-05-01T00:03:00Z'
        }
    ];

    const pipeline = new PerfectGamePipeline().withAdapters({ liveStatsClient: new MockLiveStatsClient(livestatsEvents) });
    const result = await pipeline.ingestGame({ gameId: 'game-2', source: 'livestats' });

    assert.equal(result.events.length, 2);
    assert.equal(result.events[0].result.description, 'Called strike');
    assert.equal(result.events[1].count.outs, 1);
});

test('ingestGame falls back to boxscore scraper', async () => {
    const scraper = new MockBoxscoreScraper({
        gameId: '55',
        status: 'Final',
        teams: [
            { name: 'Home', runs: 5, hits: 8, errors: 1 },
            { name: 'Away', runs: 2, hits: 6, errors: 2 }
        ],
        linescore: [
            { inning: '1', home: 2, away: 0 },
            { inning: '2', home: 0, away: 1 }
        ],
        lastUpdated: '2024-05-01T04:00:00Z',
        source: 'https://stats.ncaa.org/game/baseball-game/55'
    });

    const pipeline = new PerfectGamePipeline().withAdapters({ boxscoreScraper: scraper });
    const result = await pipeline.ingestGame({ gameId: '55', source: 'boxscore' });

    assert.equal(result.events.length, 1);
    assert.equal(result.events[0].status, 'Final');
    assert.ok(scraper.calls.length > 0);
});
