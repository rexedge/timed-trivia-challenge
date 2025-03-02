"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { GameStatus, UserRole } from "@prisma/client";

// const gameSchema = z.object({
//   startTime: z.date(),
//   endTime: z.date(),
//   questions: z.array(z.string()).min(1, "At least one question is required"),
// });

type ActionResponse = {
  success: boolean;
  message?: string;
  data?: any;
  errors?: Record<string, string>;
};

export async function createGame(data: {
  startTime: Date;
  endTime: Date;
  questions: string[];
  answerTime: number;
  resultTime: number;
  intervalTime: number;
}): Promise<ActionResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: "Not authenticated" };
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: "Not authorized" };
    }

    // Validate durations
    if (data.answerTime < 5 || data.answerTime > 600) {
      return { success: false, message: "Invalid answer time duration" };
    }
    if (data.resultTime < 5 || data.resultTime > 600) {
      return { success: false, message: "Invalid result time duration" };
    }
    if (data.intervalTime < 5 || data.intervalTime > 900) {
      return { success: false, message: "Invalid interval time duration" };
    }

    // Check for overlapping games
    const overlappingGame = await db.game.findFirst({
      where: {
        OR: [
          {
            startTime: {
              lt: data.endTime,
            },
            endTime: {
              gt: data.startTime,
            },
          },
        ],
      },
    });

    if (overlappingGame) {
      return {
        success: false,
        message: "Another game is scheduled during this time period",
      };
    }

    // Create game with custom durations
    const game = await db.game.create({
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        status: GameStatus.SCHEDULED,
        answerTime: data.answerTime,
        resultTime: data.resultTime,
        intervalTime: data.intervalTime,
      },
    });

    // Calculate total cycle time
    const cycleDuration = data.answerTime + data.resultTime + data.intervalTime;

    // Create game questions with display times
    const gameQuestions = data.questions.map((questionId, index) => {
      const displayTime = new Date(
        data.startTime.getTime() + index * cycleDuration * 1000
      );

      return {
        gameId: game.id,
        questionId,
        displayTime,
        duration: data.answerTime, // Use the custom answer time
      };
    });

    await db.gameQuestion.createMany({
      data: gameQuestions,
    });

    revalidatePath("/admin/games");
    return { success: true, data: game };
  } catch (error) {
    console.error("Error creating game:", error);
    return {
      success: false,
      message: "Failed to create game",
    };
  }
}

export async function submitAnswer(data: {
  gameId: string;
  questionId: string;
  answer: string;
}): Promise<ActionResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: "Not authenticated" };
    }

    const now = new Date();

    // Get the game and question
    const gameQuestion = await db.gameQuestion.findFirst({
      where: {
        gameId: data.gameId,
        questionId: data.questionId,
        game: {
          status: GameStatus.ACTIVE,
          startTime: {
            lte: now,
          },
          endTime: {
            gte: now,
          },
        },
      },
      include: {
        question: true,
      },
    });

    if (!gameQuestion) {
      return {
        success: false,
        message: "Question not found or game not active",
      };
    }

    // Check if question is currently active
    const questionEndTime = new Date(
      gameQuestion.displayTime.getTime() + gameQuestion.duration * 1000
    );

    if (now > questionEndTime) {
      return {
        success: false,
        message: "Question time has expired",
      };
    }

    // Check for existing response
    const existingResponse = await db.response.findFirst({
      where: {
        gameId: data.gameId,
        questionId: data.questionId,
        userId: session.user.id,
      },
    });

    if (existingResponse) {
      return {
        success: false,
        message: "You have already answered this question",
      };
    }

    // Calculate score
    const isCorrect = data.answer === gameQuestion.question.correctAnswer;
    const timeElapsed =
      (now.getTime() - gameQuestion.displayTime.getTime()) / 1000;
    const timeLeft = gameQuestion.duration - timeElapsed;
    const speedBonus = isCorrect ? (timeLeft / gameQuestion.duration) * 10 : 0;
    const totalScore = isCorrect ? 10 + speedBonus : 0;

    // Save response
    const response = await db.response.create({
      data: {
        gameId: data.gameId,
        questionId: data.questionId,
        userId: session.user.id,
        gameQuestionId: gameQuestion.id,
        answer: data.answer,
        score: totalScore,
        answeredAt: now,
        timeToAnswer: timeElapsed,
      },
    });

    revalidatePath(`/dashboard/game`);

    return {
      success: true,
      data: {
        response,
        isCorrect,
        score: totalScore,
        speedBonus,
      },
    };
  } catch (error) {
    console.error("Error submitting answer:", error);
    return {
      success: false,
      message: "Failed to submit answer",
    };
  }
}

export async function getCurrentGame(): Promise<ActionResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: "Not authenticated" };
    }

    const now = new Date();

    const currentGame = await db.game.findFirst({
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
        gameQuestions: {
          include: {
            question: true,
          },
          orderBy: {
            displayTime: "asc",
          },
        },
        responses: {
          where: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!currentGame) {
      return {
        success: false,
        message: "No active game found",
      };
    }

    return {
      success: true,
      data: currentGame,
    };
  } catch (error) {
    console.error("Error getting current game:", error);
    return {
      success: false,
      message: "Failed to get current game",
    };
  }
}

export async function getGameLeaderboard(
  gameId: string
): Promise<ActionResponse> {
  try {
    const responses = await db.response.findMany({
      where: {
        gameId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Calculate total scores per user
    const userScores = responses.reduce((acc, response) => {
      const userId = response.user.id;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          userName: response.user.name || "Unknown",
          userImage: response.user.image || "",
          score: 0,
        };
      }
      acc[userId].score += response.score;
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by score
    const leaderboard = Object.values(userScores)
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return {
      success: true,
      data: leaderboard,
    };
  } catch (error) {
    console.error("Error getting game leaderboard:", error);
    return {
      success: false,
      message: "Failed to get game leaderboard",
    };
  }
}

export async function getGameStatus(gameId: string): Promise<ActionResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: "Not authenticated" };
    }

    // Get game with all related data
    const game = await db.game.findUnique({
      where: { id: gameId },
      include: {
        gameQuestions: {
          include: {
            question: true,
            responses: {
              where: {
                userId: session.user.id,
              },
            },
          },
          orderBy: {
            displayTime: "asc",
          },
        },
        responses: {
          where: {
            userId: session.user.id,
          },
        },
        _count: {
          select: {
            gameQuestions: true,
          },
        },
      },
    });

    if (!game) {
      return {
        success: false,
        message: "Game not found",
      };
    }

    // Get leaderboard data
    const leaderboard = await db.response.groupBy({
      by: ["userId"],
      where: {
        gameId: gameId,
      },
      _sum: {
        score: true,
      },
      orderBy: {
        _sum: {
          score: "desc",
        },
      },
      take: 10,
    });

    // Get user details for leaderboard
    const userIds = leaderboard.map((entry) => entry.userId);
    const users = await db.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    // Combine leaderboard data with user details
    const leaderboardWithDetails = leaderboard.map((entry, index) => {
      const user = users.find((u) => u.id === entry.userId);
      return {
        rank: index + 1,
        userId: entry.userId,
        userName: user?.name || "Unknown",
        userImage: user?.image || "",
        score: entry._sum.score || 0,
      };
    });

    return {
      success: true,
      data: {
        game,
        currentStatus: {
          totalQuestions: game._count.gameQuestions,
          questionsAnswered: game.responses.length,
          currentScore: game.responses.reduce((sum, r) => sum + r.score, 0),
        },
        leaderboard: leaderboardWithDetails,
      },
    };
  } catch (error) {
    console.error("Error getting game status:", error);
    return {
      success: false,
      message: "Failed to get game status",
    };
  }
}
