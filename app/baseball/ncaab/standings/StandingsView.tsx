"use client";

import { useEffect, useState } from "react";
import { StandingsPayload, StandingTeam } from "../types";

const CONFERENCES = [
  { value: "sec", label: "SEC" },
  { value: "acc", label: "ACC" },
  { value: "big12", label: "Big 12" },
  { value: "pac12", label: "Pac-12" },
  { value: "big10", label: "Big Ten" },
];

export default function StandingsView() {
  const [conference, setConference] = useState<string>("sec");
  const [data, setData] = useState<StandingsPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadStandings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/college-baseball/standings?conference=${conference.toUpperCase()}`, {
          next: { revalidate: 600 },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        if (mounted) {
          const rawData: unknown = payload.success ? payload.data : null;
          const rawObject = rawData && !Array.isArray(rawData) && typeof rawData === 'object' ? (rawData as { teams?: unknown; leaders?: StandingsPayload['leaders']; }) : null;

          const teams: StandingTeam[] = Array.isArray(rawData)
            ? (rawData as StandingTeam[])
            : Array.isArray(rawObject?.teams)
              ? (rawObject.teams as StandingTeam[])
              : [];

          const leaders = rawObject?.leaders ?? {
            batting: [],
            homeruns: [],
            era: [],
            strikeouts: [],
          };

          setData({
            teams,
            leaders,
          });
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load standings");
          setData(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadStandings();

    return () => {
      mounted = false;
    };
  }, [conference]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">College Baseball</p>
          <h1 className="text-3xl font-semibold text-slate-100">Conference Standings</h1>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-300">Updated nightly with RPI and streak indicators.</p>
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
        </div>
      </header>

      {isLoading && (
        <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 py-12 text-slate-400">
          Loading standings...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-red-900/40 bg-red-950/40 px-6 py-5 text-sm text-red-200">{error}</div>
      )}

      {!isLoading && !error && data && (
        <section className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-100">
                <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Team</th>
                    <th className="px-3 py-3 text-center">Conf</th>
                    <th className="px-3 py-3 text-center">Overall</th>
                    <th className="px-3 py-3 text-center">RPI</th>
                    <th className="px-3 py-3 text-center">Home</th>
                    <th className="px-3 py-3 text-center">Away</th>
                    <th className="px-3 py-3 text-center">Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.teams.map((team, index) => (
                    <tr key={team.team.id} className={index < 2 ? "bg-brand-gold/5" : undefined}>
                      <td className="px-4 py-3 text-left font-semibold text-slate-200">{team.rank ?? index + 1}</td>
                      <td className="px-4 py-3 text-left font-medium text-slate-100">{team.team.name}</td>
                      <td className="px-3 py-3 text-center text-slate-300">
                        {team.conferenceRecord.wins}-{team.conferenceRecord.losses}
                      </td>
                      <td className="px-3 py-3 text-center text-slate-300">
                        {team.overallRecord.wins}-{team.overallRecord.losses}
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-sm text-slate-200">
                        {team.rpi ? team.rpi.toFixed(4) : "N/A"}
                      </td>
                      <td className="px-3 py-3 text-center text-slate-400">
                        {team.overallRecord.wins}-{team.overallRecord.losses}
                      </td>
                      <td className="px-3 py-3 text-center text-slate-400">
                        {team.overallRecord.wins}-{team.overallRecord.losses}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {team.streakType && team.streakCount ? (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              team.streakType === "W"
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-rose-500/10 text-rose-300"
                            }`}
                          >
                            {team.streakType}
                            {team.streakCount}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data.leaders && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {(
                [
                  { title: "Batting Average", key: "batting" as const, statKey: "avg" },
                  { title: "Home Runs", key: "homeruns" as const, statKey: "hr" },
                  { title: "ERA", key: "era" as const, statKey: "era" },
                  { title: "Strikeouts", key: "strikeouts" as const, statKey: "k" },
                ] as const
              ).map((category) => {
                const leaders = data.leaders?.[category.key] ?? [];
                if (leaders.length === 0) return null;

                return (
                  <article key={category.key} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                    <h3 className="text-base font-semibold text-slate-100">{category.title}</h3>
                    <ul className="mt-4 space-y-3">
                      {leaders.map((player, index) => (
                        <li key={player.name} className="flex items-center justify-between text-sm text-slate-200">
                          <div>
                            <span className="font-semibold text-slate-100">{index + 1}.</span>{" "}
                            {player.name}
                            <span className="text-slate-400"> · {player.team}</span>
                          </div>
                          <span className="font-mono text-xs text-brand-gold">
                            {player[category.statKey] ?? ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
