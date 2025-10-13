export const metadata = {
  title: 'Player Profile — Diamond Insights'
};

export default async function PlayerProfilePage({
  params
}: {
  params: { playerId: string }
}) {
  return (
    <main className="p-4 max-w-[720px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Player Profile</h1>
      <p className="text-sm opacity-70 mb-4">Player ID: {params.playerId}</p>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Bio</h2>
          <p className="text-sm opacity-70">Player biographical information</p>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Season Stats</h2>
          <p className="text-sm opacity-70">Batting and pitching statistics</p>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Game Logs</h2>
          <p className="text-sm opacity-70">Game-by-game performance</p>
        </div>
      </div>
    </main>
  );
}
