import type { Metadata } from "next";
import BoxScoreView from "./BoxScoreView";

export const metadata: Metadata = {
  title: "Game Box Score | Blaze Sports Intel",
  description: "Full box score, pitching matchups, and hitting lines for every Division I baseball game.",
};

export default async function BoxScorePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  return (
    <div className="space-y-6">
      <BoxScoreView gameId={gameId} />
    </div>
  );
}
