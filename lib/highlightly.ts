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

const DEFAULT_BASE_URL = 'https://baseball.highlightly.net';

function normalizeBaseUrl(baseUrl?: string): string {
  if (!baseUrl) {
    return DEFAULT_BASE_URL;
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function parseNumberHeader(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function buildQueryString(params: QueryParams = {}): string {
  const entries: string[] = [];

  for (const [key, rawValue] of Object.entries(params)) {
    if (rawValue === undefined || rawValue === null) {
      continue;
    }

    const pushValue = (value: string | number | boolean): void => {
      entries.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    };

    if (Array.isArray(rawValue)) {
      rawValue.filter(v => v !== undefined && v !== null).forEach(value => pushValue(value));
    } else {
      pushValue(rawValue);
    }
  }

  return entries.length > 0 ? `?${entries.join('&')}` : '';
}

export class HighlightlyError extends Error {
  public readonly status: number;
  public readonly meta: HighlightlyMeta;
  public readonly body?: unknown;

  constructor(message: string, status: number, meta: HighlightlyMeta, body?: unknown) {
    super(message);
    this.name = 'HighlightlyError';
    this.status = status;
    this.meta = meta;
    this.body = body;
  }
}

export class HighlightlyClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiHost?: string;
  private readonly fetchImpl: Fetcher;

  constructor(env: HighlightlyEnv, fetchImpl: Fetcher = fetch) {
    this.baseUrl = normalizeBaseUrl(env?.HIGHLIGHTLY_BASE_URL);
    this.apiKey = env?.HIGHLIGHTLY_API_KEY ?? '';
    this.apiHost = env?.HIGHLIGHTLY_HOST ?? undefined;
    this.fetchImpl = fetchImpl;
  }

  public async request<T>({ path, search, init }: HighlightlyRequestOptions): Promise<HighlightlyResponse<T>> {
    if (!this.apiKey) {
      throw new HighlightlyError(
        'Highlightly API key is missing. Set HIGHLIGHTLY_API_KEY in the environment.',
        401,
        {
          rateLimit: {},
          responseHeaders: new Headers(),
        }
      );
    }

    const url = `${this.baseUrl}${path}${buildQueryString(search ?? {})}`;

    const headers: HeadersInit = {
      'x-rapidapi-key': this.apiKey,
      ...(this.apiHost ? { 'x-rapidapi-host': this.apiHost } : {}),
      ...(init?.headers ?? {}),
    };

    const response = await this.fetchImpl(url, {
      ...init,
      headers,
    });

    const rateLimit: HighlightlyRateLimitMeta = {
      limit: parseNumberHeader(response.headers.get('x-ratelimit-requests-limit')),
      remaining: parseNumberHeader(response.headers.get('x-ratelimit-requests-remaining')),
      reset: parseNumberHeader(response.headers.get('x-ratelimit-requests-reset')),
      retryAfter: parseNumberHeader(response.headers.get('retry-after')),
    };

    const meta: HighlightlyMeta = {
      rateLimit,
      requestId: response.headers.get('x-request-id'),
      responseHeaders: response.headers,
    };

    if (!response.ok) {
      const contentType = response.headers.get('content-type') ?? '';
      let body: unknown = undefined;

      try {
        if (contentType.includes('application/json')) {
          body = await response.json();
        } else {
          body = await response.text();
        }
      } catch (error) {
        body = undefined;
      }

      throw new HighlightlyError(
        `Highlightly request failed with status ${response.status}`,
        response.status,
        meta,
        body
      );
    }

    const data = (await response.json()) as T;

    return {
      data,
      status: response.status,
      meta,
    };
  }

  public getMatches<T = unknown>(params: QueryParams): Promise<HighlightlyResponse<T>> {
    return this.request<T>({
      path: '/matches',
      search: params,
    });
  }
}

export function createHighlightlyClient(env: HighlightlyEnv, fetchImpl?: Fetcher): HighlightlyClient {
  return new HighlightlyClient(env, fetchImpl);
}
