import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { GameForm } from "@/components/admin/games/game-form";
import { db } from "@/lib/db";

export default async function NewGamePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get all available questions
  const questions = await db.question.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <AdminShell>
      <AdminHeader
        heading="Schedule New Game"
        text="Create a new trivia game"
      />
      <GameForm questions={questions} />
    </AdminShell>
  );
}
