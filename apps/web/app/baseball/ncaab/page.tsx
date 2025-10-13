import Link from 'next/link';

export const metadata = {
  title: 'D1 Baseball Hub — Diamond Insights',
  description: 'Complete Division I college baseball coverage with live scores, stats, and analysis.'
};

export default function BaseballHubPage() {
  return (
    <main className="p-4 max-w-[720px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Diamond Insights</h1>
      <p className="opacity-80 mb-6">Division I College Baseball — Live context, not just scores.</p>
      
      <nav className="grid gap-3">
        <Link 
          href="/baseball/ncaab/games" 
          className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <h2 className="font-semibold">Games & Scores</h2>
          <p className="text-sm opacity-70">Live games, schedules, and final scores</p>
        </Link>
        
        <Link 
          href="/baseball/ncaab/teams" 
          className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <h2 className="font-semibold">Teams</h2>
          <p className="text-sm opacity-70">Team pages, rosters, and stats</p>
        </Link>
        
        <Link 
          href="/baseball/ncaab/standings" 
          className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <h2 className="font-semibold">Standings</h2>
          <p className="text-sm opacity-70">Conference and national standings</p>
        </Link>
        
        <Link 
          href="/baseball/ncaab/rankings" 
          className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <h2 className="font-semibold">Rankings</h2>
          <p className="text-sm opacity-70">Top 25 polls and rankings</p>
        </Link>
        
        <Link 
          href="/baseball/ncaab/news" 
          className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <h2 className="font-semibold">News</h2>
          <p className="text-sm opacity-70">Auto-generated previews and recaps</p>
        </Link>
      </nav>
    </main>
  );
}
