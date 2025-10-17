const DEFAULT_BASE_URL = 'https://baseball.highlightly.net';
function normalizeBaseUrl(baseUrl) {
    if (!baseUrl) {
        return DEFAULT_BASE_URL;
    }
    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}
function parseNumberHeader(value) {
    if (!value)
        return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}
export function buildQueryString(params = {}) {
    const entries = [];
    for (const [key, rawValue] of Object.entries(params)) {
        if (rawValue === undefined || rawValue === null) {
            continue;
        }
        const pushValue = (value) => {
            entries.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        };
        if (Array.isArray(rawValue)) {
            rawValue.filter(v => v !== undefined && v !== null).forEach(value => pushValue(value));
        }
        else {
            pushValue(rawValue);
        }
    }
    return entries.length > 0 ? `?${entries.join('&')}` : '';
}
export class HighlightlyError extends Error {
    constructor(message, status, meta, body) {
        super(message);
        this.name = 'HighlightlyError';
        this.status = status;
        this.meta = meta;
        this.body = body;
    }
}
export class HighlightlyClient {
    constructor(env, fetchImpl = fetch) {
        this.baseUrl = normalizeBaseUrl(env?.HIGHLIGHTLY_BASE_URL);
        this.apiKey = env?.HIGHLIGHTLY_API_KEY ?? '';
        this.apiHost = env?.HIGHLIGHTLY_HOST ?? undefined;
        this.fetchImpl = fetchImpl;
    }
    async request({ path, search, init }) {
        if (!this.apiKey) {
            throw new HighlightlyError('Highlightly API key is missing. Set HIGHLIGHTLY_API_KEY in the environment.', 401, {
                rateLimit: {},
                responseHeaders: new Headers(),
            });
        }
        const url = `${this.baseUrl}${path}${buildQueryString(search ?? {})}`;
        const headers = {
            'x-rapidapi-key': this.apiKey,
            ...(this.apiHost ? { 'x-rapidapi-host': this.apiHost } : {}),
            ...(init?.headers ?? {}),
        };
        const response = await this.fetchImpl(url, {
            ...init,
            headers,
        });
        const rateLimit = {
            limit: parseNumberHeader(response.headers.get('x-ratelimit-requests-limit')),
            remaining: parseNumberHeader(response.headers.get('x-ratelimit-requests-remaining')),
            reset: parseNumberHeader(response.headers.get('x-ratelimit-requests-reset')),
            retryAfter: parseNumberHeader(response.headers.get('retry-after')),
        };
        const meta = {
            rateLimit,
            requestId: response.headers.get('x-request-id'),
            responseHeaders: response.headers,
        };
        if (!response.ok) {
            const contentType = response.headers.get('content-type') ?? '';
            let body = undefined;
            try {
                if (contentType.includes('application/json')) {
                    body = await response.json();
                }
                else {
                    body = await response.text();
                }
            }
            catch (error) {
                body = undefined;
            }
            throw new HighlightlyError(`Highlightly request failed with status ${response.status}`, response.status, meta, body);
        }
        const data = (await response.json());
        return {
            data,
            status: response.status,
            meta,
        };
    }
    getMatches(params) {
        return this.request({
            path: '/matches',
            search: params,
        });
    }
}
export function createHighlightlyClient(env, fetchImpl) {
    return new HighlightlyClient(env, fetchImpl);
}
//# sourceMappingURL=highlightly.js.map
