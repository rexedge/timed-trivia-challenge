import { db } from "@/lib/db";
import { GameStatus } from "@prisma/client";

export async function getAdminStats() {
  // Get total users
  const totalUsers = await db.user.count();

  // Get total questions
  const totalQuestions = await db.question.count();

  // Get active games
  const activeGames = await db.game.count({
    where: {
      status: GameStatus.ACTIVE,
    },
  });

  // Get completed games
  const completedGames = await db.game.count({
    where: {
      status: GameStatus.COMPLETED,
    },
  });

  return {
    totalUsers,
    totalQuestions,
    activeGames,
    completedGames,
  };
}
