import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { QuestionsList } from "@/components/admin/questions/questions-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function QuestionsPage() {
  const session = await auth();

  if (!session?.user.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Get all questions
  const questions = await db.question.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <AdminShell>
      <AdminHeader heading="Questions" text="Manage trivia questions">
        <Link href="/admin/questions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </Link>
      </AdminHeader>
      <QuestionsList questions={questions} />
    </AdminShell>
  );
}
