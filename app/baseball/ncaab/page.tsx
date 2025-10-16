import type { Metadata } from "next";
import ScoreboardView from "./(scoreboard)/ScoreboardView";

export const metadata: Metadata = {
  title: "NCAA Baseball Scoreboard | Blaze Sports Intel",
  description: "Live Division I college baseball scoreboard with conference filters and mobile-first layouts.",
};

export const dynamic = "force-dynamic";

export default function BaseballScoreboardRoot() {
  return (
    <div className="space-y-6">
      <ScoreboardView />
    </div>
  );
}
