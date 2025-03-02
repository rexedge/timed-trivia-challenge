"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

type ActionResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

export async function getAllUsers(
  page = 1,
  limit = 10
): Promise<ActionResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: "Not authenticated" };
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: "Not authorized" };
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          _count: {
            select: {
              responses: true,
            },
          },
        },
      }),
      db.user.count(),
    ]);

    return {
      success: true,
      data: {
        users,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      message: "Failed to fetch users",
    };
  }
}

export async function getUserDetails(userId: string): Promise<ActionResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: "Not authenticated" };
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: "Not authorized" };
    }

    const [user, gameHistory] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              responses: true,
            },
          },
        },
      }),
      db.response.findMany({
        where: {
          userId,
        },
        include: {
          game: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Process game history
    const processedHistory = await Promise.all(
      gameHistory.map(async (response) => {
        const totalPlayers = await db.response.groupBy({
          by: ["userId"],
          where: {
            gameId: response.gameId,
          },
          _count: true,
        });

        const playerRanks = await db.response.groupBy({
          by: ["userId"],
          where: {
            gameId: response.gameId,
          },
          _sum: {
            score: true,
          },
          orderBy: {
            _sum: {
              score: "desc",
            },
          },
        });

        const rank = playerRanks.findIndex((p) => p.userId === userId) + 1;

        return {
          gameId: response.gameId,
          gameName: `Game ${new Date(
            response.game.startTime
          ).toLocaleDateString()}`,
          playedAt: response.createdAt,
          score: response.score,
          rank,
          totalPlayers: totalPlayers.length,
        };
      })
    );

    return {
      success: true,
      data: {
        user,
        gameHistory: processedHistory,
      },
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return {
      success: false,
      message: "Failed to fetch user details",
    };
  }
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<ActionResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, message: "Not authenticated" };
    }

    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: "Not authorized" };
    }

    if (userId === session.user.id) {
      return { success: false, message: "Cannot change your own role" };
    }

    await db.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      success: false,
      message: "Failed to update user role",
    };
  }
}
