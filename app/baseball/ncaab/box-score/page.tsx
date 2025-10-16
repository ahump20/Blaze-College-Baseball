import Link from 'next/link';

export default function BoxScoreLandingPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="font-serif text-2xl text-text">Box Score Center</h2>
        <p className="text-sm text-text-muted">
          Choose any game from the live scoreboard to load its full batting and pitching breakdown.
        </p>
      </header>
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/70 bg-surface/80 p-12 text-center shadow-card">
        <span className="text-4xl">📊</span>
        <p className="text-sm text-text-muted">No game selected yet.</p>
        <Link
          href="/baseball/ncaab"
          className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-accent hover:text-accent"
        >
          Go to live scoreboard
        </Link>
      </div>
    </section>
  );
}
