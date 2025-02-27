import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { GameStatus } from "@/components/dashboard/game-status";
import { getCurrentGame } from "@/lib/game-utils";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Get current game status
  const currentGame = await getCurrentGame();

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Welcome to the Timed Trivia Challenge!"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <GameStatus currentGame={currentGame} />
      </div>
    </DashboardShell>
  );
}
