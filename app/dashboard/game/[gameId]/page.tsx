import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { GameContainer } from "@/components/game/game-container";

interface GamePageProps {
  params: {
    gameId: string;
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const game = await db.game.findUnique({
    where: { id: params.gameId },
    include: {
      gameQuestions: {
        include: {
          question: true,
        },
        orderBy: {
          displayTime: "asc",
        },
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          score: "desc",
        },
      },
      responses: {
        where: {
          userId: session.user.id,
        },
        include: {
          gameQuestion: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      },
    },
  });

  if (!game) {
    redirect("/dashboard");
  }

  // Auto-join the game if not already participating
  if (!game.participants.some((p) => p.userId === session.user.id)) {
    await db.gameParticipant.create({
      data: {
        gameId: game.id,
        userId: session.user.id,
      },
    });
  }

  return (
    <div className="container mx-auto p-4">
      <GameContainer game={game} userId={session.user.id} />
    </div>
  );
}

// Add metadata
export const metadata = {
  title: "Game",
  description: "Live trivia game",
};
