import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentGame, getGameStatus } from "@/app/actions/game-actions";
import { GameContainer } from "@/components/game/game-container";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { User } from "@prisma/client";

export default async function GamePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const gameResult = await getCurrentGame();

  if (!gameResult.success) {
    redirect("/dashboard");
  }

  const currentGame = gameResult.data;

  // Get initial game status
  const statusResult = await getGameStatus(currentGame.id);

  if (!statusResult.success) {
    return <div>Failed to load game status</div>;
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Current Game"
        text="Answer questions and compete for the highest score!"
      />
      <GameContainer
        gameId={currentGame.id}
        user={session.user as User}
        initialGameData={statusResult.data}
      />
    </DashboardShell>
  );
}
