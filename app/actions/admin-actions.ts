"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { GameStatus } from "@prisma/client";

// Question Actions
export async function createQuestion(data: {
  text: string;
  options: string[];
  correctAnswer: string;
}) {
  try {
    await db.question.create({
      data: {
        text: data.text,
        options: JSON.stringify(data.options),
        correctAnswer: data.correctAnswer,
      },
    });

    revalidatePath("/admin/questions");
    redirect("/admin/questions");
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
}

export async function updateQuestion(
  id: string,
  data: {
    text: string;
    options: string[];
    correctAnswer: string;
  }
) {
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
    redirect("/admin/questions");
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
}

export async function deleteQuestion(id: string) {
  try {
    await db.question.delete({
      where: { id },
    });

    revalidatePath("/admin/questions");
    return { success: true };
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
}

// Game Actions
export async function createGame(data: {
  startTime: Date;
  endTime: Date;
  questions: string[];
}) {
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
    const endTime = new Date(data.endTime);
    // const totalDuration = endTime.getTime() - startTime.getTime();
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
    redirect("/admin/games");
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
}

export async function updateGameStatus(id: string, status: GameStatus) {
  try {
    await db.game.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/games");
    return { success: true };
  } catch (error) {
    console.error("Error updating game status:", error);
    throw error;
  }
}

export async function deleteGame(id: string) {
  try {
    await db.game.delete({
      where: { id },
    });

    revalidatePath("/admin/games");
    return { success: true };
  } catch (error) {
    console.error("Error deleting game:", error);
    throw error;
  }
}

// Settings Actions
export async function updateGameSettings(data: {
  gameStartTime: string;
  gameEndTime: string;
  questionInterval: number;
  questionDuration: number;
}) {
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
    throw error;
  }
}
