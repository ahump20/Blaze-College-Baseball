/**
 * NFL API Client - Query parameter based
 * NO UI changes - data layer only
 */

export async function getNflTeam(teamId = "10") {
  const res = await fetch(`/api/nfl?teamId=${encodeURIComponent(teamId)}`, {
    headers: { Accept: "application/json" },
    cache: "default"
  });

  if (!res.ok) {
    throw new Error(`NFL API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getNflStandings() {
  const res = await fetch("/api/nfl-standings", {
    headers: { Accept: "application/json" },
    cache: "default"
  });

  if (!res.ok) {
    throw new Error(`NFL Standings API Error: ${res.status}`);
  }

  return res.json();
}

export async function getNflLiveGames() {
  const res = await fetch("/api/nfl/scoreboard", {
    headers: { Accept: "application/json" },
    cache: "no-cache" // Live data shouldn't be cached
  });

  if (!res.ok) {
    // Return empty array if no live games
    return { games: [] };
  }

  return res.json();
}