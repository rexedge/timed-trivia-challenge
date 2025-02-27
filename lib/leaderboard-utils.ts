import { db } from "@/lib/db";
import { User } from "@prisma/client";

export async function getLeaderboard(gameId: string) {
  // Get all responses for the game
  const responses = await db.response.findMany({
    where: {
      gameId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          profession: true,
        },
      },
    },
  });

  // Group responses by user and calculate total score
  const userScores = responses.reduce(
    (acc, response) => {
      const userId = response.userId;

      if (!acc[userId]) {
        acc[userId] = {
          user: response.user as User,
          totalScore: 0,
          correctAnswers: 0,
          totalAnswers: 0,
        };
      }

      acc[userId].totalScore += response.score;
      acc[userId].totalAnswers += 1;

      if (response.score > 0) {
        acc[userId].correctAnswers += 1;
      }

      return acc;
    },
    {} as Record<
      string,
      {
        user: User;
        totalScore: number;
        correctAnswers: number;
        totalAnswers: number;
      }
    >
  );

  // Convert to array and sort by total score
  const leaderboard = Object.values(userScores).sort(
    (a, b) => b.totalScore - a.totalScore
  );

  // Add rank to each entry
  return leaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
