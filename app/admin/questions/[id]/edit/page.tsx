import { redirect, notFound } from 'next/navigation';
import { auth } from '@/auth';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminShell } from '@/components/admin/admin-shell';
import { QuestionForm } from '@/components/admin/questions/question-form';
import { getQuestion } from '@/app/actions/question-actions';

interface EditQuestionPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function EditQuestionPage(props: EditQuestionPageProps) {
	const session = await auth();
	const params = await props.params;

	if (!session || session.user.role !== 'ADMIN') {
		redirect('/login');
	}

	const result = await getQuestion(params.id);

	if (!result.success || !result.data) {
		notFound();
	}

	return (
		<AdminShell>
			<AdminHeader
				heading='Edit Question'
				text='Update your trivia question'
			/>
			<QuestionForm question={result.data} />
		</AdminShell>
	);
}
