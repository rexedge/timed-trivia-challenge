import { GameStatus } from "@prisma/client";
import { pusherServer } from "@/lib/pusher";
import type {
  ExtendedGame,
  ExtendedGameQuestion,
  GameEvents,
} from "@/lib/types/game";

export function getCurrentQuestion(
  game: ExtendedGame
): ExtendedGameQuestion | null {
  if (game.status !== GameStatus.IN_PROGRESS) {
    return null;
  }

  const now = new Date();
  return (
    game.gameQuestions.find((q) => {
      const displayTime = new Date(q.displayTime);
      const endTime = new Date(displayTime.getTime() + game.answerTime * 1000);
      return now >= displayTime && now <= endTime;
    }) || null
  );
}

export function calculateScore(timeToAnswer: number, maxTime: number): number {
  const baseScore = 1000;
  const timeBonus = Math.round((1 - timeToAnswer / maxTime) * 500);
  return baseScore + timeBonus;
}

export async function triggerGameEvent<K extends keyof GameEvents>(
  gameId: string,
  event: K,
  data: GameEvents[K]
) {
  await pusherServer.trigger(`game-${gameId}`, event, data);
}
