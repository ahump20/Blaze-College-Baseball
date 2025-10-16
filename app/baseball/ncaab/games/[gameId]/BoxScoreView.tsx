"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BoxScorePayload } from "../../types";

type BoxScoreTab = "batting" | "pitching";

interface BoxScoreViewProps {
  gameId: string;
}

export default function BoxScoreView({ gameId }: BoxScoreViewProps) {
  const router = useRouter();
  const [tab, setTab] = useState<BoxScoreTab>("batting");
  const [data, setData] = useState<BoxScorePayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadBoxScore = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/college-baseball/boxscore?gameId=${gameId}`, {
          next: { revalidate: 15 },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        if (mounted) {
          setData(payload.success ? (payload.data as BoxScorePayload) : null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to load box score");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadBoxScore();
    const intervalId = setInterval(loadBoxScore, 15_000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [gameId]);

  const innings = useMemo(() => {
    if (!data) return 0;
    return Math.max(data.awayTeam.lineScore?.length ?? 0, data.homeTeam.lineScore?.length ?? 0);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-300">
        <span className="text-sm">Loading box score...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-red-900/40 bg-red-950/40 px-6 py-5 text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-12 text-center text-slate-300">
        No box score is available for this game yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-900/40 bg-red-950/40 px-6 py-5 text-sm text-red-200">{error}</div>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-brand-gold/50"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-xl font-semibold text-slate-100">
            {data.awayTeam.team.name} at {data.homeTeam.team.name}
          </h1>
          {data.lastUpdate && <p className="text-xs text-slate-400">Last update · {data.lastUpdate}</p>}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-100">
            <thead className="bg-slate-900/90 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Team</th>
                {Array.from({ length: innings }).map((_, inning) => (
                  <th key={inning} className="px-3 py-3 text-center">
                    {inning + 1}
                  </th>
                ))}
                <th className="px-3 py-3 text-center">R</th>
                <th className="px-3 py-3 text-center">H</th>
                <th className="px-3 py-3 text-center">E</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-medium">{data.awayTeam.team.shortName}</td>
                {Array.from({ length: innings }).map((_, inning) => (
                  <td key={inning} className="px-3 py-3 text-center text-slate-300">
                    {data.awayTeam.lineScore?.[inning] ?? "-"}
                  </td>
                ))}
                <td className="px-3 py-3 text-center font-semibold">{data.awayTeam.score}</td>
                <td className="px-3 py-3 text-center text-slate-300">{data.awayTeam.hits ?? "-"}</td>
                <td className="px-3 py-3 text-center text-slate-300">{data.awayTeam.errors ?? "-"}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">{data.homeTeam.team.shortName}</td>
                {Array.from({ length: innings }).map((_, inning) => (
                  <td key={inning} className="px-3 py-3 text-center text-slate-300">
                    {data.homeTeam.lineScore?.[inning] ?? "-"}
                  </td>
                ))}
                <td className="px-3 py-3 text-center font-semibold">{data.homeTeam.score}</td>
                <td className="px-3 py-3 text-center text-slate-300">{data.homeTeam.hits ?? "-"}</td>
                <td className="px-3 py-3 text-center text-slate-300">{data.homeTeam.errors ?? "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-2 rounded-full bg-slate-900/70 p-1 text-sm text-slate-200">
        {(["batting", "pitching"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`flex-1 rounded-full px-4 py-2 font-medium transition ${
              tab === item ? "bg-brand-gold/90 text-slate-950" : "bg-transparent"
            }`}
          >
            {item === "batting" ? "Batting" : "Pitching"}
          </button>
        ))}
      </div>

      {tab === "batting" ? <BattingTables data={data} /> : <PitchingTables data={data} />}
    </div>
  );
}

function BattingTables({ data }: { data: BoxScorePayload }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[data.awayTeam, data.homeTeam].map((team) => (
        <section key={team.team.shortName} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <header>
            <h2 className="text-lg font-semibold text-slate-100">{team.team.shortName}</h2>
          </header>
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">Player</th>
                  <th className="px-3 py-3 text-center">AB</th>
                  <th className="px-3 py-3 text-center">R</th>
                  <th className="px-3 py-3 text-center">H</th>
                  <th className="px-3 py-3 text-center">RBI</th>
                  <th className="px-3 py-3 text-center">BB</th>
                  <th className="px-3 py-3 text-center">K</th>
                  <th className="px-3 py-3 text-center">AVG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {team.batting.map((player) => (
                  <tr key={player.playerId}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-100">{player.playerName}</span>
                        {player.position && <span className="text-xs text-slate-400">{player.position}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">{player.atBats}</td>
                    <td className="px-3 py-3 text-center">{player.runs}</td>
                    <td className="px-3 py-3 text-center">{player.hits}</td>
                    <td className="px-3 py-3 text-center">{player.rbi}</td>
                    <td className="px-3 py-3 text-center">{player.walks}</td>
                    <td className="px-3 py-3 text-center">{player.strikeouts}</td>
                    <td className="px-3 py-3 text-center font-mono text-sm">{player.avg.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function PitchingTables({ data }: { data: BoxScorePayload }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[data.awayTeam, data.homeTeam].map((team) => (
        <section key={team.team.shortName} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <header>
            <h2 className="text-lg font-semibold text-slate-100">{team.team.shortName}</h2>
          </header>
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">Pitcher</th>
                  <th className="px-3 py-3 text-center">IP</th>
                  <th className="px-3 py-3 text-center">H</th>
                  <th className="px-3 py-3 text-center">R</th>
                  <th className="px-3 py-3 text-center">ER</th>
                  <th className="px-3 py-3 text-center">BB</th>
                  <th className="px-3 py-3 text-center">K</th>
                  <th className="px-3 py-3 text-center">PC</th>
                  <th className="px-3 py-3 text-center">ERA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {team.pitching.map((player) => (
                  <tr key={player.playerId} className={player.decision ? "bg-emerald-500/5" : undefined}>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-slate-100">{player.playerName}</span>
                        {player.decision && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                            {player.decision}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-sm">{player.innings}</td>
                    <td className="px-3 py-3 text-center">{player.hits}</td>
                    <td className="px-3 py-3 text-center">{player.runs}</td>
                    <td className="px-3 py-3 text-center">{player.earnedRuns}</td>
                    <td className="px-3 py-3 text-center">{player.walks}</td>
                    <td className="px-3 py-3 text-center">{player.strikeouts}</td>
                    <td className="px-3 py-3 text-center">{player.pitches}</td>
                    <td className="px-3 py-3 text-center font-mono text-sm">{player.era.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
