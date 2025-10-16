import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <h2 className="font-serif text-3xl font-semibold text-slate-50">Diamond Insights, Rebuilt</h2>
        <p className="max-w-2xl text-sm text-slate-300">
          Blaze Sports Intel delivers a mobile-first, dark-mode NCAA Division I baseball experience. Track live games,
          dive into every pitch, and keep tabs on the race for Omaha from anywhere.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/baseball/ncaab"
          className="group rounded-3xl border border-slate-800 bg-slate-900/70 p-6 transition hover:border-brand-gold/60 hover:shadow-[0_25px_65px_-45px_rgba(251,191,36,0.6)]"
        >
          <h3 className="text-lg font-semibold text-slate-100">Live Scoreboard</h3>
          <p className="mt-2 text-sm text-slate-400">Real-time updates, live situations, and instant access to box scores.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand-gold">
            Jump in →
          </span>
        </Link>

        <Link
          href="/baseball/ncaab/standings"
          className="group rounded-3xl border border-slate-800 bg-slate-900/70 p-6 transition hover:border-brand-gold/60 hover:shadow-[0_25px_65px_-45px_rgba(251,191,36,0.6)]"
        >
          <h3 className="text-lg font-semibold text-slate-100">Conference Standings</h3>
          <p className="mt-2 text-sm text-slate-400">Track RPI, streaks, and postseason positioning across every league.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand-gold">
            View tables →
          </span>
        </Link>
      </div>
    </section>
  );
}
