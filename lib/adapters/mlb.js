function toPythagoreanViewModel(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const record = data;

  const expectedWins = typeof record.expectedWins === 'number' ? record.expectedWins : null;
  const winPercentage = typeof record.winPercentage === 'string' ? record.winPercentage : null;
  const runsScored = typeof record.runsScored === 'number' ? record.runsScored : null;
  const runsAllowed = typeof record.runsAllowed === 'number' ? record.runsAllowed : null;

  if (expectedWins === null && winPercentage === null && runsScored === null && runsAllowed === null) {
    return null;
  }

  return { expectedWins, winPercentage, runsScored, runsAllowed };
}

export function toTeamCardView(data) {
  const source = data ?? {};
  const team = source.team ?? {};
  const division = team.division ?? {};
  const venue = team.venue ?? {};
  const analytics = source.analytics ?? {};

  return {
    name: typeof team.name === 'string' ? team.name : 'St. Louis Cardinals',
    division: typeof division.name === 'string' ? division.name : 'NL Central',
    venue: typeof venue.name === 'string' ? venue.name : 'Busch Stadium',
    analytics: toPythagoreanViewModel(analytics.pythagorean),
    dataSource: typeof analytics.dataSource === 'string' ? analytics.dataSource : 'MLB Stats API',
    lastUpdated: typeof analytics.lastUpdated === 'string' ? analytics.lastUpdated : null,
  };
}

function normalizePercentage(value) {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return value.toFixed(3);
  }

  return 'N/A';
}

export function toStandingsView(data) {
  const nationalLeague = Array.isArray(data?.nationalLeague) ? data.nationalLeague : [];

  const centralRecord = nationalLeague.find((record) => {
    if (!record || typeof record !== 'object') {
      return false;
    }

    const division = record.division;
    return typeof division?.name === 'string' && division.name.toLowerCase().includes('central');
  });

  const rows = Array.isArray(centralRecord?.teamRecords)
    ? centralRecord.teamRecords
        .slice(0, 5)
        .map((entry) => {
          if (!entry || typeof entry !== 'object') {
            return null;
          }

          const teamRecord = entry;
          const team = teamRecord.team ?? {};

          const rank = Number(teamRecord.divisionRank);
          const wins = Number(teamRecord.wins);
          const losses = Number(teamRecord.losses);

          if (!Number.isFinite(rank) || !Number.isFinite(wins) || !Number.isFinite(losses)) {
            return null;
          }

          return {
            rank,
            name: typeof team?.name === 'string' ? team.name : 'Unknown Team',
            wins,
            losses,
            pct: normalizePercentage(teamRecord.winningPercentage),
          };
        })
        .filter((row) => row !== null)
    : [];

  return {
    divisionName: typeof centralRecord?.division?.name === 'string' ? centralRecord.division.name : 'NL Central',
    rows,
    lastUpdated: typeof data?.lastUpdated === 'string' ? data.lastUpdated : null,
  };
}
