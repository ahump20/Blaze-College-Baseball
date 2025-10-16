import { BoxScoreClient } from '../../components/BoxScoreClient';

export default function BoxScorePage({ params }: { params: { gameId: string } }) {
  const gameId = decodeURIComponent(params.gameId);
  return <BoxScoreClient gameId={gameId} />;
}
