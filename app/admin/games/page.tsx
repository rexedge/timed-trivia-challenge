import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { GamesList } from "@/components/admin/games/game-list";

export default async function GamesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const games = await db.game.findMany({
    orderBy: {
      startTime: "desc",
    },
    include: {
      _count: {
        select: {
          gameQuestions: true,
          responses: true,
        },
      },
      gameQuestions: {
        include: {
          question: {
            select: {
              id: true,
              text: true,
            },
          },
        },
      },
    },
  });

  const availableQuestions = await db.question.findMany({
    select: {
      id: true,
      text: true,
    },
  });

  return (
    <AdminShell>
      <AdminHeader heading="Games" text="Manage trivia games">
        <Link href="/admin/games/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Game
          </Button>
        </Link>
      </AdminHeader>
      <GamesList games={games} availableQuestions={availableQuestions} />
    </AdminShell>
  );
}
