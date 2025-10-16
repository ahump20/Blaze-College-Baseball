"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GameSummary, GameStatus } from "../types";

const REFRESH_INTERVAL_MS = 30_000;

const STATUS_BADGE: Record<GameStatus, string> = {
  live: "bg-emerald-500/10 text-emerald-400",
  final: "bg-slate-500/20 text-slate-300",
  scheduled: "bg-brand-gold/10 text-brand-gold",
};

const CONFERENCES = [
  { value: "all", label: "All" },
  { value: "sec", label: "SEC" },
  { value: "acc", label: "ACC" },
  { value: "big12", label: "Big 12" },
  { value: "pac12", label: "Pac-12" },
  { value: "big10", label: "Big Ten" },
];

function formatStatus(game: GameSummary): string {
  if (game.status === "live" && game.inning) {
    const half = game.inning.half?.toUpperCase() === "BOTTOM" ? "Bot" : "Top";
    return `${half} ${game.inning.number ?? ""}`.trim();
  }

  if (game.status === "final") {
    return "Final";
  }

  return game.scheduledTime ?? "TBD";
}

export default function ScoreboardView() {
  const [conference, setConference] = useState<string>("all");
  const [games, setGames] = useState<GameSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadGames = async (showSpinner: boolean) => {
      try {
        if (showSpinner) {
          setIsLoading(true);
        }
        setError(null);
        const params = new URLSearchParams();
        if (conference !== "all") {
          params.set("conference", conference.toUpperCase());
        }
        const response = await fetch(`/api/college-baseball/games${
          params.size > 0 ? `?${params.toString()}` : ""
        }`, {
          next: { revalidate: 30 },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        if (mounted) {
          const rawData: unknown = payload.success ? payload.data : null;
          setGames(Array.isArray(rawData) ? (rawData as GameSummary[]) : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load games");
          setGames([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadGames(true);
    const intervalId = setInterval(() => loadGames(false), REFRESH_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [conference]);

  const sortedGames = useMemo(
    () =>
      [...games].sort((a, b) => {
        const statusOrder: Record<GameStatus, number> = {
          live: 0,
          scheduled: 1,
          final: 2,
        };
        return statusOrder[a.status] - statusOrder[b.status];
      }),
    [games]
  );

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">College Baseball</p>
          <h1 className="text-3xl font-semibold text-slate-100">Division I Scoreboard</h1>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live games refresh every 30 seconds</span>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-200">
            <span className="sr-only">Filter by conference</span>
            <select
              value={conference}
              onChange={(event) => setConference(event.target.value)}
              className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-100 shadow-inner focus:border-brand-gold focus:outline-none"
            >
              {CONFERENCES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="grid gap-4">
        {isLoading && (
          <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 py-12 text-slate-400">
            Fetching the latest action...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-900/40 bg-red-950/40 px-6 py-5 text-sm text-red-200">
            {error}
          </div>
        )}

        {!isLoading && !error && sortedGames.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-12 text-center">
            <span className="text-4xl">⚾</span>
            <p className="text-base text-slate-300">No games right now. Check back soon.</p>
          </div>
        )}

        {!isLoading && !error &&
          sortedGames.map((game) => {
            const statusBadge = STATUS_BADGE[game.status];
            const awayLeading = (game.awayTeam.score ?? 0) > (game.homeTeam.score ?? 0);
            const homeLeading = (game.homeTeam.score ?? 0) > (game.awayTeam.score ?? 0);

            return (
              <Link
                key={game.id}
                href={`/baseball/ncaab/games/${game.id}`}
                className="group block overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.9)] transition hover:border-brand-gold/50 hover:shadow-[0_20px_60px_-35px_rgba(251,191,36,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusBadge}`}>
                      {game.status === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
                      {formatStatus(game)}
                    </span>
                    {game.status === "live" && game.situation && (
                      <span className="text-xs text-slate-300">
                        {game.situation.outs ?? 0} Out · {game.situation.runners ?? "Bases clear"}
                      </span>
                    )}
                  </div>

                  {game.venue && <p className="text-xs text-slate-400">{game.venue}</p>}
                </div>

                <div className="mt-4 grid gap-3">
                  <div
                    className={`flex items-center justify-between rounded-2xl bg-slate-800/40 px-4 py-3 ${
                      awayLeading ? "ring-1 ring-emerald-500/60" : ""
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium text-slate-100">
                        {game.awayTeam.name ?? game.awayTeam.shortName}
                      </span>
                      {game.awayTeam.record && (
                        <span className="text-xs text-slate-400">
                          {game.awayTeam.record.wins}-{game.awayTeam.record.losses}
                        </span>
                      )}
                    </div>
                    <span className="text-2xl font-semibold text-slate-100">
                      {game.awayTeam.score ?? "-"}
                    </span>
                  </div>

                  <div
                    className={`flex items-center justify-between rounded-2xl bg-slate-800/40 px-4 py-3 ${
                      homeLeading ? "ring-1 ring-emerald-500/60" : ""
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium text-slate-100">
                        {game.homeTeam.name ?? game.homeTeam.shortName}
                      </span>
                      {game.homeTeam.record && (
                        <span className="text-xs text-slate-400">
                          {game.homeTeam.record.wins}-{game.homeTeam.record.losses}
                        </span>
                      )}
                    </div>
                    <span className="text-2xl font-semibold text-slate-100">
                      {game.homeTeam.score ?? "-"}
                    </span>
                  </div>
                </div>

                {game.status === "live" && (
                  <div className="mt-4 grid gap-2 text-xs text-slate-300 md:grid-cols-2">
                    {game.currentPitcher && (
                      <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2">
                        <span className="font-semibold text-slate-200">P:</span>{" "}
                        {game.currentPitcher.name}
                        {typeof game.currentPitcher.pitches === "number" && (
                          <span className="text-slate-400"> · {game.currentPitcher.pitches} P</span>
                        )}
                        {typeof game.currentPitcher.era === "number" && (
                          <span className="text-slate-400"> · {game.currentPitcher.era.toFixed(2)} ERA</span>
                        )}
                      </div>
                    )}

                    {game.currentBatter && (
                      <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2">
                        <span className="font-semibold text-slate-200">AB:</span>{" "}
                        {game.currentBatter.name}
                        {typeof game.currentBatter.avg === "number" && (
                          <span className="text-slate-400"> · {game.currentBatter.avg.toFixed(3)} AVG</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex justify-end text-xs font-semibold text-brand-gold">
                  View box score →
                </div>
              </Link>
            );
          })}
      </div>
    </section>
  );
}
