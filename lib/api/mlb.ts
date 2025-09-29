const DEFAULT_TEAM_ID = '138';

export interface Fetcher {
  (input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

function resolveDefaultApiBase(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hostname === 'localhost'
      ? 'http://localhost:3000/api'
      : 'https://blazesportsintel.com/api';
  }

  return 'https://blazesportsintel.com/api';
}

function buildUrl(base: string, path: string, query: Record<string, string> = {}): string {
  const url = new URL(path, base.endsWith('/') ? base : `${base}/`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`MLB API request failed with ${response.status}: ${body}`);
  }

  return (await response.json()) as T;
}

export async function getMlbTeam(
  teamId: string = DEFAULT_TEAM_ID,
  apiBase: string = resolveDefaultApiBase(),
  fetcher: Fetcher = fetch,
): Promise<unknown> {
  const url = buildUrl(apiBase, 'mlb', { teamId });
  const response = await fetcher(url, { method: 'GET' });
  return handleResponse(response);
}

export async function getMlbStandings(
  apiBase: string = resolveDefaultApiBase(),
  fetcher: Fetcher = fetch,
): Promise<unknown> {
  const url = buildUrl(apiBase, 'mlb-standings');
  const response = await fetcher(url, { method: 'GET' });
  return handleResponse(response);
}
