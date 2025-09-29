export interface PythagoreanViewModel {
    expectedWins: number | null;
    winPercentage: string | null;
    runsScored: number | null;
    runsAllowed: number | null;
}
export interface TeamCardViewModel {
    name: string;
    division: string;
    venue: string;
    analytics: PythagoreanViewModel | null;
    dataSource: string;
    lastUpdated: string | null;
}
export interface StandingsRow {
    rank: number;
    name: string;
    wins: number;
    losses: number;
    pct: string;
}
export interface StandingsViewModel {
    divisionName: string;
    rows: StandingsRow[];
    lastUpdated: string | null;
}
export declare function toTeamCardView(data: unknown): TeamCardViewModel;
export declare function toStandingsView(data: unknown): StandingsViewModel;
//# sourceMappingURL=mlb.d.ts.map