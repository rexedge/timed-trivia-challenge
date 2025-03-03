import { useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import type {
  ExtendedGame,
  ExtendedGameQuestion,
  GameEvents,
} from "@/lib/types/game";
import { getCurrentQuestion } from "@/lib/utils/game";

export function useGameState(initialGame: ExtendedGame) {
  const [game, setGame] = useState(initialGame);
  const [currentQuestion, setCurrentQuestion] =
    useState<ExtendedGameQuestion | null>(getCurrentQuestion(game));

  useEffect(() => {
    const channel = pusherClient.subscribe(`game-${game.id}`);

    channel.bind("game-update", (data: GameEvents["game-update"]) => {
      setGame((prev) => ({ ...prev, ...data }));
    });

    channel.bind("question-update", (data: GameEvents["question-update"]) => {
      setCurrentQuestion(data.question);
    });

    channel.bind(
      "leaderboard-update",
      (data: GameEvents["leaderboard-update"]) => {
        setGame((prev) => ({
          ...prev,
          participants: data.participants,
        }));
      }
    );

    return () => {
      pusherClient.unsubscribe(`game-${game.id}`);
    };
  }, [game.id]);

  return {
    game,
    currentQuestion,
    setGame,
    setCurrentQuestion,
  };
}
