"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { GameStatus, UserRole } from "@prisma/client";
import { auth } from "@/auth";

type ActionResponse = {
  success: boolean;
  message?: string;
};

// Question Actions
export async function createQuestion(data: {
  text: string;
  options: string[];
  correctAnswer: string;
}): Promise<ActionResponse> {
  try {
    await db.question.create({
      data: {
        text: data.text,
        options: JSON.stringify(data.options),
        correctAnswer: data.correctAnswer,
      },
    });

    revalidatePath("/admin/questions");
    return { success: true };
  } catch (error) {
    console.error("Error creating question:", error);
    return { success: false, message: "Failed to create question" };
  }
}

export async function updateQuestion(
  id: string,
  data: {
    text: string;
    options: string[];
    correctAnswer: string;
  }
): Promise<ActionResponse> {
  try {
    await db.question.update({
      where: { id },
      data: {
        text: data.text,
        options: JSON.stringify(data.options),
        correctAnswer: data.correctAnswer,
      },
    });

    revalidatePath("/admin/questions");
    return { success: true };
  } catch (error) {
    console.error("Error updating question:", error);
    return { success: false, message: "Failed to update question" };
  }
}

export async function deleteQuestion(id: string): Promise<ActionResponse> {
  try {
    await db.question.delete({
      where: { id },
    });

    revalidatePath("/admin/questions");
    return { success: true };
  } catch (error) {
    console.error("Error deleting question:", error);
    return { success: false, message: "Failed to delete question" };
  }
}

// Game Actions
export async function createGame(data: {
  startTime: Date;
  endTime: Date;
  questions: string[];
}): Promise<ActionResponse> {
  try {
    // Create the game
    const game = await db.game.create({
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        status: GameStatus.SCHEDULED,
      },
    });

    // Calculate question display times
    const startTime = new Date(data.startTime);
    const intervalMs = 15 * 60 * 1000; // 15 minutes in milliseconds

    // Create game questions with display times
    const gameQuestions = data.questions.map((questionId, index) => {
      const displayTime = new Date(startTime.getTime() + index * intervalMs);

      return {
        gameId: game.id,
        questionId,
        displayTime,
      };
    });

    // Create game questions
    await db.gameQuestion.createMany({
      data: gameQuestions,
    });

    revalidatePath("/admin/games");
    return { success: true };
  } catch (error) {
    console.error("Error creating game:", error);
    return { success: false, message: "Failed to create game" };
  }
}

export async function updateGameStatus(
  id: string,
  status: GameStatus
): Promise<ActionResponse> {
  try {
    await db.game.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/games");
    return { success: true };
  } catch (error) {
    console.error("Error updating game status:", error);
    return { success: false, message: "Failed to update game status" };
  }
}

export async function deleteGame(id: string): Promise<ActionResponse> {
  try {
    await db.game.delete({
      where: { id },
    });

    revalidatePath("/admin/games");
    return { success: true };
  } catch (error) {
    console.error("Error deleting game:", error);
    return { success: false, message: "Failed to delete game" };
  }
}

// Settings Actions
export async function updateGameSettings(data: {
  gameStartTime: string;
  gameEndTime: string;
  questionInterval: number;
  questionDuration: number;
}): Promise<ActionResponse> {
  try {
    // Get the first settings record or create if it doesn't exist
    const settings = await db.gameSettings.findFirst();

    if (settings) {
      await db.gameSettings.update({
        where: { id: settings.id },
        data,
      });
    } else {
      await db.gameSettings.create({
        data,
      });
    }

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating game settings:", error);
    return { success: false, message: "Failed to update game settings" };
  }
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<ActionResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated" };
    }

    // Check if the current user is an admin
    if (session.user.role !== UserRole.ADMIN) {
      return { success: false, message: "Not authorized" };
    }

    // Prevent admin from changing their own role
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
    return { success: false, message: "Failed to update user role" };
  }
}
