/**
 * NBA API Client - Query parameter based
 * NO UI changes - data layer only
 */

export async function getNbaTeam(teamId = "29") {
  const res = await fetch(`/api/nba?teamId=${encodeURIComponent(teamId)}`, {
    headers: { Accept: "application/json" },
    cache: "default"
  });

  if (!res.ok) {
    throw new Error(`NBA API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getNbaStandings() {
  const res = await fetch("/api/nba-standings", {
    headers: { Accept: "application/json" },
    cache: "default"
  });

  if (!res.ok) {
    throw new Error(`NBA Standings API Error: ${res.status}`);
  }

  return res.json();
}

export async function getNbaLiveGames() {
  const res = await fetch("/api/nba/scoreboard", {
    headers: { Accept: "application/json" },
    cache: "no-cache" // Live data shouldn't be cached
  });

  if (!res.ok) {
    // Return empty array if no live games
    return { games: [] };
  }

  return res.json();
}