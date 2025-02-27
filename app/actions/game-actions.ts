"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { calculateScore } from "@/lib/game-utils";

export async function submitAnswer({
  userId,
  gameId,
  questionId,
  answer,
  timeToAnswer,
}: {
  userId: string;
  gameId: string;
  questionId: string;
  answer: string;
  timeToAnswer: number;
}) {
  try {
    // Get the question to check the correct answer
    const question = await db.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error("Question not found");
    }

    const isCorrect = answer === question.correctAnswer;

    // Calculate score
    const score = calculateScore(isCorrect, timeToAnswer, 5 * 60); // 5 minutes = 300 seconds

    // Save the response
    const response = await db.response.create({
      data: {
        userId,
        gameId,
        questionId,
        answer,
        timeToAnswer,
        score,
      },
    });

    revalidatePath(`/dashboard/game`);
    revalidatePath(`/dashboard/leaderboard`);

    return {
      isCorrect,
      score,
      timeToAnswer,
    };
  } catch (error) {
    console.error("Error submitting answer:", error);
    throw error;
  }
}
