export const metadata = {
  title: 'Games & Scores — Diamond Insights',
  description: 'Live scores and schedules for Division I college baseball.'
};

export default function GamesPage() {
  return (
    <main className="p-4 max-w-[720px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Games & Scores</h1>
      <p className="opacity-70 mb-4">Division I college baseball games and schedules</p>
      
      <div className="space-y-2">
        <div className="p-4 border rounded">
          <p className="text-sm opacity-70">No games scheduled</p>
          <p className="text-xs opacity-50 mt-2">
            Connect your data source to see live games and scores
          </p>
        </div>
      </div>
    </main>
  );
}
