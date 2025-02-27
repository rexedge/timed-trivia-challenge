import { db } from "@/lib/db";
import { GameStatus } from "@prisma/client";

export async function getCurrentGame() {
  const now = new Date();

  // Find active game
  const activeGame = await db.game.findFirst({
    where: {
      status: GameStatus.ACTIVE,
      startTime: {
        lte: now,
      },
      endTime: {
        gte: now,
      },
    },
  });

  if (activeGame) {
    return activeGame;
  }

  // Find next scheduled game
  const scheduledGame = await db.game.findFirst({
    where: {
      status: GameStatus.SCHEDULED,
      startTime: {
        gt: now,
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return scheduledGame;
}

export async function getCurrentQuestion(gameId: string) {
  const now = new Date();

  // Find the current question for the game
  const currentQuestion = await db.gameQuestion.findFirst({
    where: {
      gameId,
      displayTime: {
        lte: now,
      },
    },
    orderBy: {
      displayTime: "desc",
    },
    include: {
      question: true,
    },
  });

  return currentQuestion;
}

export async function getNextQuestionTime(gameId: string) {
  const now = new Date();

  // Find the next question for the game
  const nextQuestion = await db.gameQuestion.findFirst({
    where: {
      gameId,
      displayTime: {
        gt: now,
      },
    },
    orderBy: {
      displayTime: "asc",
    },
  });

  return nextQuestion?.displayTime;
}

export function calculateScore(
  isCorrect: boolean,
  timeToAnswer: number,
  questionDuration: number
) {
  if (!isCorrect) return 0;

  // Base score for correct answer
  const baseScore = 10;

  // Calculate time bonus (percentage of time left)
  const timeLeft = questionDuration - timeToAnswer;
  const timeBonus = Math.max(0, (timeLeft / questionDuration) * 10);

  return baseScore + timeBonus;
}
