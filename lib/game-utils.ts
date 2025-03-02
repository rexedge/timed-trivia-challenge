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
    include: {
      _count: {
        select: {
          responses: true,
        },
      },
    },
  });

  return activeGame;
}

export async function getUpcomingGames() {
  const now = new Date();

  // Find upcoming scheduled games
  const upcomingGames = await db.game.findMany({
    where: {
      status: GameStatus.SCHEDULED,
      startTime: {
        gt: now,
      },
    },
    orderBy: {
      startTime: "asc",
    },
    include: {
      _count: {
        select: {
          gameQuestions: true,
        },
      },
    },
  });

  return upcomingGames;
}

export async function getPastGames(userId: string) {
  const now = new Date();

  // Find completed games with user's performance
  const pastGames = await db.game.findMany({
    where: {
      OR: [
        { status: GameStatus.COMPLETED },
        {
          status: GameStatus.ACTIVE,
          endTime: {
            lt: now,
          },
        },
      ],
    },
    orderBy: {
      endTime: "desc",
    },
    include: {
      responses: {
        where: {
          userId: userId,
        },
        select: {
          score: true,
        },
      },
      _count: {
        select: {
          gameQuestions: true,
          responses: true,
        },
      },
    },
  });

  return pastGames;
}

// Check if games overlap
export async function checkGameOverlap(startTime: Date, endTime: Date) {
  const overlappingGame = await db.game.findFirst({
    where: {
      AND: [
        {
          status: {
            in: [GameStatus.SCHEDULED, GameStatus.ACTIVE],
          },
        },
        {
          OR: [
            {
              // New game starts during an existing game
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gte: startTime } },
              ],
            },
            {
              // New game ends during an existing game
              AND: [
                { startTime: { lte: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            {
              // New game completely contains an existing game
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
      ],
    },
  });

  return overlappingGame !== null;
}

// Check if user is in an active game
export async function checkUserActiveGame(userId: string) {
  const now = new Date();

  const activeGame = await db.game.findFirst({
    where: {
      status: GameStatus.ACTIVE,
      startTime: {
        lte: now,
      },
      endTime: {
        gte: now,
      },
      responses: {
        some: {
          userId: userId,
        },
      },
    },
  });

  return activeGame !== null;
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
