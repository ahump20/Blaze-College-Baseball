import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
        <header className="rounded-lg border border-border bg-surface/80 p-6 shadow-card backdrop-blur">
          <p className="font-serif text-sm uppercase tracking-[0.35em] text-text-muted">Diamond Insights</p>
          <h1 className="mt-3 font-serif text-3xl text-text">College Baseball Intelligence Hub</h1>
          <p className="mt-4 max-w-2xl text-sm text-text-muted">
            BlazeSportsIntel is rebuilding its platform on Next.js 15. Explore the live scoreboard, deep box scores, and
            conference dashboards optimised for mobile and dark mode first experiences.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/baseball/ncaab"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-background transition hover:bg-crimson"
            >
              View Live Scoreboard
            </Link>
            <Link
              href="/baseball/ncaab/standings"
              className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2 text-sm font-medium text-text hover:border-accent hover:text-accent"
            >
              Conference Standings
            </Link>
          </div>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <h2 className="font-serif text-xl text-text">Live Scoreboard</h2>
            <p className="mt-2 text-sm text-text-muted">
              Dark-mode cards, real-time polling, and quick filters across SEC, ACC, Big 12, Pac-12, and Big Ten matchups.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <h2 className="font-serif text-xl text-text">Box Score Engine</h2>
            <p className="mt-2 text-sm text-text-muted">
              Full batting and pitching splits with inning-by-inning line scores and live refresh for ongoing games.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <h2 className="font-serif text-xl text-text">Standings Dashboard</h2>
            <p className="mt-2 text-sm text-text-muted">
              Conference snapshots with RPI, streak indicators, and postseason markers for top programs.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <h2 className="font-serif text-xl text-text">Mobile First Architecture</h2>
            <p className="mt-2 text-sm text-text-muted">
              Optimized layouts, bottom navigation, and touch-friendly interactions powered by Tailwind CSS tokens.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
