import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { GamesList } from "@/components/dashboard/games/games-list";
import {
  getCurrentGame,
  getUpcomingGames,
  getPastGames,
} from "@/lib/game-utils";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Get current game
  const currentGame = await getCurrentGame();

  // Get upcoming games
  const upcomingGames = await getUpcomingGames();

  // Get past games with user's performance
  const pastGames = await getPastGames(session.user.id);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Welcome to the Timed Trivia Challenge!"
      />
      <div className="grid gap-6">
        <GamesList
          currentGame={currentGame}
          upcomingGames={upcomingGames}
          pastGames={pastGames}
          userId={session.user.id}
        />
      </div>
    </DashboardShell>
  );
}
