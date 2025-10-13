export const metadata = {
  title: 'Standings — Diamond Insights',
  description: 'Division I college baseball conference and national standings.'
};

export default function StandingsPage() {
  return (
    <main className="p-4 max-w-[720px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Standings</h1>
      <p className="opacity-70 mb-4">Conference and national standings</p>
      
      <div className="space-y-2">
        <div className="p-4 border rounded">
          <p className="text-sm opacity-70">Standings will appear here</p>
        </div>
      </div>
    </main>
  );
}
