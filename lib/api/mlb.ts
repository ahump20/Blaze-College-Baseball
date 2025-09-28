/**
 * MLB API Client - Query parameter based
 * NO UI changes - data layer only
 */

export async function getMlbTeam(teamId = "138") {
  const res = await fetch(`/api/mlb?teamId=${encodeURIComponent(teamId)}`, {
    headers: { Accept: "application/json" },
    cache: "default"
  });

  if (!res.ok) {
    throw new Error(`MLB API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getMlbStandings() {
  const res = await fetch("/api/mlb-standings", {
    headers: { Accept: "application/json" },
    cache: "default"
  });

  if (!res.ok) {
    throw new Error(`MLB Standings API Error: ${res.status}`);
  }

  return res.json();
}

export async function getMlbLiveGames() {
  const res = await fetch("/api/mlb/scoreboard", {
    headers: { Accept: "application/json" },
    cache: "no-cache" // Live data shouldn't be cached
  });

  if (!res.ok) {
    // Return empty array if no live games
    return { games: [] };
  }

  return res.json();
}