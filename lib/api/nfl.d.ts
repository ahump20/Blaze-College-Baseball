export interface Fetcher {
    (input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}
export interface NflTeamResponse {
    team: {
        id: string;
        name: string;
        abbreviation: string;
        displayName: string;
        location: string;
        color: string;
        alternateColor: string;
        logo: string;
        record?: {
            items: Array<{
                description: string;
                type: string;
                summary: string;
                stats: Array<{
                    name: string;
                    value: number;
                }>;
            }>;
        };
        venue?: {
            id: string;
            fullName: string;
            address: {
                city: string;
                state: string;
            };
        };
        groups?: {
            parent?: {
                name: string;
            };
        };
    };
    analytics: {
        dataSource: string;
        lastUpdated: string;
        truthLabel: string;
    };
}
export declare function getNflTeam(teamId?: string, apiBase?: string, fetcher?: Fetcher): Promise<NflTeamResponse>;
export interface NflStandingsResponse {
    season: number;
    lastUpdated: string;
    standings: Array<{
        conference: string;
        division: string;
        teams: Array<{
            teamId: string;
            name: string;
            abbreviation: string;
            wins: number;
            losses: number;
            ties: number;
            winPercentage: number;
            divisionRank: number;
            conferenceRank: number;
            playoffSeed?: number;
        }>;
    }>;
    dataSource: string;
    truthLabel: string;
}
export declare function getNflStandings(apiBase?: string, fetcher?: Fetcher): Promise<NflStandingsResponse>;
//# sourceMappingURL=nfl.d.ts.map