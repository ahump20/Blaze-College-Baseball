import type { Metadata } from "next";
import StandingsView from "./StandingsView";

export const metadata: Metadata = {
  title: "NCAA Baseball Standings | Blaze Sports Intel",
  description: "Conference tables, RPI trends, and leaderboards for Division I college baseball.",
};

export default function StandingsPage() {
  return (
    <div className="space-y-6">
      <StandingsView />
    </div>
  );
}
