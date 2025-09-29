const DEFAULT_TEAM_ID = '138';

function resolveDefaultApiBase() {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hostname === 'localhost'
      ? 'http://localhost:3000/api'
      : 'https://blazesportsintel.com/api';
  }

  return 'https://blazesportsintel.com/api';
}

function buildUrl(base, path, query = {}) {
  const url = new URL(path, base.endsWith('/') ? base : `${base}/`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

async function handleResponse(response) {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`MLB API request failed with ${response.status}: ${body}`);
  }

  return response.json();
}

export async function getMlbTeam(teamId = DEFAULT_TEAM_ID, apiBase = resolveDefaultApiBase(), fetcher = fetch) {
  const url = buildUrl(apiBase, 'mlb', { teamId });
  const response = await fetcher(url, { method: 'GET' });
  return handleResponse(response);
}

export async function getMlbStandings(apiBase = resolveDefaultApiBase(), fetcher = fetch) {
  const url = buildUrl(apiBase, 'mlb-standings');
  const response = await fetcher(url, { method: 'GET' });
  return handleResponse(response);
}
