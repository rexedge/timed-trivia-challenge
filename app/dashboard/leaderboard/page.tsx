import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { getCurrentGame } from "@/lib/game-utils";
import { getLeaderboard } from "@/lib/leaderboard-utils";

export default async function LeaderboardPage() {
  const session = await auth();

  if (!session?.user.id) {
    redirect("/login");
  }

  // Get current game
  const currentGame = await getCurrentGame();

  if (!currentGame) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Leaderboard"
          text="See who's leading the game"
        />
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-2xl font-bold">No Active Game</h2>
          <p className="mt-2 text-muted-foreground">
            There is no active game at the moment. Please check back later.
          </p>
        </div>
      </DashboardShell>
    );
  }

  // Get leaderboard data
  const leaderboard = await getLeaderboard(currentGame.id);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Leaderboard"
        text="See who's leading the game"
      />
      <LeaderboardTable
        leaderboard={leaderboard}
        currentUserId={session.user.id}
      />
    </DashboardShell>
  );
}
