export interface TeamRecordViewModel {
    wins: number | null;
    losses: number | null;
    ties: number | null;
    winPercentage: string | null;
    divisionRank: number | null;
    conferenceRank: number | null;
}
export interface TeamCardViewModel {
    name: string;
    abbreviation: string;
    location: string;
    conference: string;
    division: string;
    venue: string;
    record: TeamRecordViewModel | null;
    dataSource: string;
    lastUpdated: string | null;
    truthLabel: string;
}
export interface StandingsRow {
    rank: number;
    name: string;
    abbreviation: string;
    wins: number;
    losses: number;
    ties: number;
    winPercentage: string;
    conferenceRank: number;
    playoffSeed: number | null;
}
export interface StandingsViewModel {
    conference: string;
    division: string;
    rows: StandingsRow[];
    lastUpdated: string | null;
    dataSource: string;
    truthLabel: string;
}
export declare function toTeamCardView(data: unknown): TeamCardViewModel;
export declare function toStandingsView(data: unknown): StandingsViewModel;
//# sourceMappingURL=nfl.d.ts.map