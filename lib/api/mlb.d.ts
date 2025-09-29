export interface Fetcher {
    (input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}
export declare function getMlbTeam(teamId?: string, apiBase?: string, fetcher?: Fetcher): Promise<unknown>;
export interface MlbStandingsResponse {
    season: number;
    lastUpdated: string;
    standings: Array<{
        division: string;
        teams: Array<{
            teamId: string;
            name: string;
            wins: number;
            losses: number;
            pct: string;
            gb: string;
        }>;
    }>;
}
export declare function getMlbStandings(apiBase?: string, fetcher?: Fetcher): Promise<MlbStandingsResponse>;
//# sourceMappingURL=mlb.d.ts.map