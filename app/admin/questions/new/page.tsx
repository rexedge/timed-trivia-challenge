import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { QuestionForm } from "@/components/admin/questions/question-form";

export default async function NewQuestionPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminShell>
      <AdminHeader heading="Add Question" text="Create a new trivia question" />
      <QuestionForm />
    </AdminShell>
  );
}
