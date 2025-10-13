export const metadata = {
  title: 'Rankings — Diamond Insights',
  description: 'Top 25 polls and rankings for Division I college baseball.'
};

export default function RankingsPage() {
  return (
    <main className="p-4 max-w-[720px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rankings</h1>
      <p className="opacity-70 mb-4">Top 25 polls and rankings</p>
      
      <div className="space-y-2">
        <div className="p-4 border rounded">
          <p className="text-sm opacity-70">Rankings will appear here</p>
        </div>
      </div>
    </main>
  );
}
