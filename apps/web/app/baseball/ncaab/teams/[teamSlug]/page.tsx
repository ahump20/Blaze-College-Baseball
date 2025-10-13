export const metadata = {
  title: 'Team Hub — Diamond Insights'
};

export default async function TeamHubPage({
  params
}: {
  params: { teamSlug: string }
}) {
  return (
    <main className="p-4 max-w-[720px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Team Hub</h1>
      <p className="text-sm opacity-70 mb-4">Team: {params.teamSlug}</p>
      
      <nav className="grid gap-2 mb-6">
        <a href={`/baseball/ncaab/teams/${params.teamSlug}/schedule`} className="p-3 border rounded">
          Schedule
        </a>
        <a href={`/baseball/ncaab/teams/${params.teamSlug}/roster`} className="p-3 border rounded">
          Roster
        </a>
        <a href={`/baseball/ncaab/teams/${params.teamSlug}/stats`} className="p-3 border rounded">
          Stats
        </a>
        <a href={`/baseball/ncaab/teams/${params.teamSlug}/news`} className="p-3 border rounded">
          News
        </a>
      </nav>
      
      <div className="p-4 border rounded">
        <h2 className="font-semibold mb-2">Team Overview</h2>
        <p className="text-sm opacity-70">Team data will appear here when connected to database</p>
      </div>
    </main>
  );
}
