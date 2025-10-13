export const metadata = {
  title: 'Teams — Diamond Insights',
  description: 'Division I college baseball teams, rosters, and stats.'
};

export default function TeamsPage() {
  return (
    <main className="p-4 max-w-[720px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teams</h1>
      <p className="opacity-70 mb-4">Division I college baseball teams</p>
      
      <div className="space-y-2">
        <div className="p-4 border rounded">
          <p className="text-sm opacity-70">No teams available</p>
          <p className="text-xs opacity-50 mt-2">
            Connect your database to see team listings
          </p>
        </div>
      </div>
    </main>
  );
}
