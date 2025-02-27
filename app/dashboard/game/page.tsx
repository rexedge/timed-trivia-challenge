import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { GameComponent } from "@/components/game/game-component";
import {
  getCurrentGame,
  getCurrentQuestion,
  getNextQuestionTime,
} from "@/lib/game-utils";

export default async function GamePage() {
  const session = await auth();

  if (!session?.user.id) {
    redirect("/login");
  }

  // Get current game
  const currentGame = await getCurrentGame();

  if (!currentGame || currentGame.status !== "ACTIVE") {
    return (
      <DashboardShell>
        <DashboardHeader heading="Game" text="Play the current trivia game" />
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-2xl font-bold">No Active Game</h2>
          <p className="mt-2 text-muted-foreground">
            There is no active game at the moment. Please check back later.
          </p>
        </div>
      </DashboardShell>
    );
  }

  // Get current question
  const currentQuestion = await getCurrentQuestion(currentGame.id);

  // Get next question time
  const nextQuestionTime = await getNextQuestionTime(currentGame.id);

  return (
    <DashboardShell>
      <DashboardHeader heading="Game" text="Play the current trivia game" />
      <GameComponent
        gameId={currentGame.id}
        currentQuestion={currentQuestion}
        nextQuestionTime={nextQuestionTime}
        userId={session.user.id}
      />
    </DashboardShell>
  );
}
