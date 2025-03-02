import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getQuestions } from "@/app/actions/question-actions";
import { Button } from "@/components/ui/button";
import { QuestionsList } from "@/components/admin/questions/questions-list";
import { ExcelUpload } from "@/components/admin/questions/excel-upload";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminHeader } from "@/components/admin/admin-header";
import { PlusCircle } from "lucide-react";

interface QuestionsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function QuestionsPage(props: QuestionsPageProps) {
  const session = await auth();
  const searchParams = await props.searchParams;

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const page = Number(searchParams.page) || 1;
  const result = await getQuestions(page);

  if (!result.success) {
    return <div>Failed to load questions</div>;
  }

  const questions = result.data?.questions ?? [];
  const pagination = result.data?.pagination ?? {
    total: 0,
    pages: 0,
    page: 0,
    limit: 10,
  };

  return (
    <AdminShell>
      <AdminHeader heading="Questions" text="Manage your trivia questions">
        <div className="flex gap-4">
          <ExcelUpload />
          <Link href="/admin/questions/new">
            <Button asChild>
              <span>
                <PlusCircle className="h-4 w-4" />
                <span className="ml-2 hidden md:block">Add Question</span>
              </span>
            </Button>
          </Link>
        </div>
      </AdminHeader>
      <QuestionsList questions={questions} pagination={pagination} />
    </AdminShell>
  );
}
