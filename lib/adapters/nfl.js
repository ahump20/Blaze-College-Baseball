function toTeamRecordViewModel(data) {
    if (!data || typeof data !== 'object') {
        return null;
    }
    const record = data;
    if (!Array.isArray(record.items) || record.items.length === 0) {
        return null;
    }
    const stats = record.items[0]?.stats;
    if (!Array.isArray(stats)) {
        return null;
    }
    // Extract wins, losses, ties from stats array
    const winsEntry = stats.find(s => s.name === 'wins');
    const lossesEntry = stats.find(s => s.name === 'losses');
    const tiesEntry = stats.find(s => s.name === 'ties');
    const winPctEntry = stats.find(s => s.name === 'winPercent');
    const wins = typeof winsEntry?.value === 'number' ? winsEntry.value : null;
    const losses = typeof lossesEntry?.value === 'number' ? lossesEntry.value : null;
    const ties = typeof tiesEntry?.value === 'number' ? tiesEntry.value : null;
    const winPercentage = typeof winPctEntry?.value === 'number'
        ? winPctEntry.value.toFixed(3)
        : null;
    if (wins === null && losses === null && ties === null) {
        return null;
    }
    return {
        wins,
        losses,
        ties,
        winPercentage,
        divisionRank: null, // Will be populated from standings data
        conferenceRank: null, // Will be populated from standings data
    };
}
export function toTeamCardView(data) {
    const source = data ?? {};
    const team = source.team ?? {};
    const venue = team.venue ?? {};
    const groups = team.groups ?? {};
    const analytics = source.analytics ?? {};
    // Extract conference and division from groups structure
    const parentName = typeof groups.parent?.name === 'string' ? groups.parent.name : '';
    const [conference, division] = parentName.includes(' - ')
        ? parentName.split(' - ')
        : [parentName || 'Unknown Conference', 'Unknown Division'];
    return {
        name: typeof team.displayName === 'string' ? team.displayName : 'Tennessee Titans',
        abbreviation: typeof team.abbreviation === 'string' ? team.abbreviation : 'TEN',
        location: typeof team.location === 'string' ? team.location : 'Nashville',
        conference,
        division,
        venue: typeof venue.fullName === 'string' ? venue.fullName : 'Nissan Stadium',
        record: toTeamRecordViewModel(team.record),
        dataSource: typeof analytics.dataSource === 'string' ? analytics.dataSource : 'ESPN API',
        lastUpdated: typeof analytics.lastUpdated === 'string' ? analytics.lastUpdated : null,
        truthLabel: typeof analytics.truthLabel === 'string' ? analytics.truthLabel : 'LIVE DATA',
    };
}
function normalizeWinPercentage(value) {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number') {
        return value.toFixed(3);
    }
    return 'N/A';
}
export function toStandingsView(data) {
    const standingsData = data;
    const standings = Array.isArray(standingsData?.standings) ? standingsData.standings : [];
    // Find AFC South division (Titans' division)
    const afcSouth = standings.find((division) => {
        return typeof division.division === 'string' &&
            division.division.toLowerCase().includes('south') &&
            typeof division.conference === 'string' &&
            division.conference.toLowerCase().includes('afc');
    });
    const rows = Array.isArray(afcSouth?.teams)
        ? afcSouth.teams
            .slice(0, 4) // AFC South has 4 teams
            .map((entry) => {
            if (!entry || typeof entry !== 'object') {
                return null;
            }
            const divisionRank = Number(entry.divisionRank);
            const wins = Number(entry.wins);
            const losses = Number(entry.losses);
            const ties = Number(entry.ties) || 0;
            const conferenceRank = Number(entry.conferenceRank);
            if (!Number.isFinite(divisionRank) || !Number.isFinite(wins) || !Number.isFinite(losses)) {
                return null;
            }
            return {
                rank: divisionRank,
                name: typeof entry.name === 'string' ? entry.name : 'Unknown Team',
                abbreviation: typeof entry.abbreviation === 'string' ? entry.abbreviation : 'UNK',
                wins,
                losses,
                ties,
                winPercentage: normalizeWinPercentage(entry.winPercentage),
                conferenceRank,
                playoffSeed: typeof entry.playoffSeed === 'number' ? entry.playoffSeed : null,
            };
        })
            .filter((row) => row !== null)
            .sort((a, b) => a.rank - b.rank)
        : [];
    return {
        conference: afcSouth?.conference || 'AFC',
        division: afcSouth?.division || 'AFC South',
        rows,
        lastUpdated: typeof standingsData?.lastUpdated === 'string' ? standingsData.lastUpdated : null,
        dataSource: typeof standingsData?.dataSource === 'string' ? standingsData.dataSource : 'ESPN API',
        truthLabel: typeof standingsData?.truthLabel === 'string' ? standingsData.truthLabel : 'LIVE DATA',
    };
}
//# sourceMappingURL=nfl.js.map