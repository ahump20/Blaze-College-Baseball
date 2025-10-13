import { Paywall } from '@/app/_components/Paywall';

export const metadata = {
  title: 'Game Center — Diamond Insights'
};

export default async function GameCenterPage({
  params
}: {
  params: { gameId: string }
}) {
  // In production: Fetch game data from database
  // const game = await db.game.findUnique({ where: { id: params.gameId } });
  
  const isPro = false; // Wire to auth/subscription check

  return (
    <main className="p-4 max-w-[720px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Game Center</h1>
      <p className="text-sm opacity-70 mb-4">Game ID: {params.gameId}</p>
      
      <div className="mb-6 p-4 border rounded">
        <div className="text-center">
          <p className="text-lg font-semibold">Team A vs Team B</p>
          <p className="text-3xl font-bold mt-2">0 - 0</p>
          <p className="text-sm opacity-70 mt-1">Scheduled</p>
        </div>
      </div>
      
      <Paywall isPro={isPro}>
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">Live Play-by-Play</h2>
            <p className="text-sm opacity-70">Pitch-by-pitch tracking available during live games</p>
          </div>
          
          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">WPA Chart</h2>
            <p className="text-sm opacity-70">Win probability analysis</p>
          </div>
          
          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">Box Score</h2>
            <p className="text-sm opacity-70">Sortable player statistics</p>
          </div>
        </div>
      </Paywall>
    </main>
  );
}
