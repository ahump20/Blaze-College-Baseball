export interface HighlightlyEnv {
    HIGHLIGHTLY_BASE_URL?: string;
    HIGHLIGHTLY_API_KEY?: string;
    HIGHLIGHTLY_HOST?: string;
}
export type QueryValue = string | number | boolean | null | undefined | Array<string | number | boolean>;
export type QueryParams = Record<string, QueryValue>;
export interface HighlightlyRequestOptions {
    path: string;
    search?: QueryParams;
    init?: RequestInit;
}
export interface HighlightlyRateLimitMeta {
    limit?: number;
    remaining?: number;
    reset?: number;
    retryAfter?: number;
}
export interface HighlightlyMeta {
    rateLimit: HighlightlyRateLimitMeta;
    requestId?: string | null;
    responseHeaders: Headers;
}
export interface HighlightlyResponse<T> {
    data: T;
    status: number;
    meta: HighlightlyMeta;
}
export type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
export declare function buildQueryString(params?: QueryParams): string;
export declare class HighlightlyError extends Error {
    readonly status: number;
    readonly meta: HighlightlyMeta;
    readonly body?: unknown;
    constructor(message: string, status: number, meta: HighlightlyMeta, body?: unknown);
}
export declare class HighlightlyClient {
    private readonly baseUrl;
    private readonly apiKey;
    private readonly apiHost?;
    private readonly fetchImpl;
    constructor(env: HighlightlyEnv, fetchImpl?: Fetcher);
    request<T>({ path, search, init }: HighlightlyRequestOptions): Promise<HighlightlyResponse<T>>;
    getMatches<T = unknown>(params: QueryParams): Promise<HighlightlyResponse<T>>;
}
export declare function createHighlightlyClient(env: HighlightlyEnv, fetchImpl?: Fetcher): HighlightlyClient;
//# sourceMappingURL=highlightly.d.ts.map