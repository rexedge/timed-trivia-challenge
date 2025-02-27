import { db } from "@/lib/db";

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
    //@ts-expect-error: expected the error
    (acc, response) => {
      const userId = response.userId;

      if (!acc[userId]) {
        acc[userId] = {
          user: response.user,
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
        user: any;
        totalScore: number;
        correctAnswers: number;
        totalAnswers: number;
      }
    >
  );

  // Convert to array and sort by total score
  const leaderboard = Object.values(userScores).sort(
    //@ts-expect-error: expected the error
    (a, b) => b.totalScore - a.totalScore
  );

  // Add rank to each entry
  return leaderboard.map((entry, index) => ({
    //@ts-expect-error: expected the error
    ...entry,
    rank: index + 1,
  }));
}
