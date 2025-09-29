/**
 * NCAA API Client - Query parameter based
 * NO UI changes - data layer only
 */

export async function getNcaaTeam(teamId = "251") {
  const res = await fetch(`/api/ncaa?teamId=${encodeURIComponent(teamId)}`, {
    headers: { Accept: "application/json" },
    cache: "default"
  });

  if (!res.ok) {
    throw new Error(`NCAA API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getNcaaStandings() {
  const res = await fetch("/api/ncaa-standings", {
    headers: { Accept: "application/json" },
    cache: "default"
  });

  if (!res.ok) {
    throw new Error(`NCAA Standings API Error: ${res.status}`);
  }

  return res.json();
}

export async function getNcaaLiveGames() {
  const res = await fetch("/api/ncaa/scoreboard", {
    headers: { Accept: "application/json" },
    cache: "no-cache" // Live data shouldn't be cached
  });

  if (!res.ok) {
    // Return empty array if no live games
    return { games: [] };
  }

  return res.json();
}