import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const gameId = (await params).gameId;

    // Get all responses for this game
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

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
