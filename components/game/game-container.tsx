"use client";

import { GameStatus } from "@prisma/client";
import { useGameState } from "@/hooks/use-game-state";
import { GameHeader } from "./game-header";
import { GameQuestion } from "./game-question";
import { GameResult } from "./game-result";
// import { GameChat } from "./game-chat";
import { GameLeaderboard } from "./game-leaderboard";
// import { GameStats } from "./game-stats";
// import { GameCountdown } from "./game-countdown";
import type { ExtendedGame } from "@/lib/types/game";
import { GameStats } from "./game-stats";

interface GameContainerProps {
  game: ExtendedGame;
  userId: string;
}

export function GameContainer({
  game: initialGame,
  userId,
}: GameContainerProps) {
  const { game, currentQuestion } = useGameState(initialGame);

  const isParticipant = game.participants.some((p) => p.userId === userId);
  const userResponses = game.responses.filter((r) => r.userId === userId);
  const hasAnsweredCurrent = currentQuestion
    ? userResponses.some((r) => r.gameQuestionId === currentQuestion.id)
    : false;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr,300px]">
      <div className="space-y-6">
        <GameHeader game={game} currentQuestion={currentQuestion} />

        {/* {game.status === GameStatus.SCHEDULED && (
          <GameCountdown startTime={game.startTime} />
        )} */}

        {game.status === GameStatus.IN_PROGRESS && currentQuestion && (
          <GameQuestion
            question={currentQuestion}
            gameId={game.id}
            userId={userId}
            answerTime={game.answerTime}
            hasAnswered={hasAnsweredCurrent}
            isParticipant={isParticipant}
          />
        )}

        {game.status === GameStatus.IN_PROGRESS && !currentQuestion && (
          <GameResult
            gameId={game.id}
            userId={userId}
            resultTime={game.resultTime}
          />
        )}

        {/* <GameChat
          gameId={game.id}
          userId={userId}
          initialMessages={game.messages}
        /> */}
      </div>

      <div className="space-y-6">
        <GameLeaderboard participants={game.participants} userId={userId} />

        {(game.status === GameStatus.ENDED || !currentQuestion) && (
          <GameStats game={game} userId={userId} />
        )}
      </div>
    </div>
  );
}
