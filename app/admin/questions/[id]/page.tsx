import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminShell } from '@/components/admin/admin-shell';
import { getQuestion } from '@/app/actions/question-actions';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, ArrowLeft } from 'lucide-react';

interface QuestionPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function QuestionPage(props: QuestionPageProps) {
	const session = await auth();
	const params = await props.params;

	if (!session || session.user.role !== 'ADMIN') {
		redirect('/login');
	}

	const result = await getQuestion(params.id);

	if (!result.success || !result.data) {
		notFound();
	}

	const question = result.data;
	const options = JSON.parse(question.options);

	return (
		<AdminShell>
			<AdminHeader
				heading='Question Details'
				text='View question information'
			>
				<div className='flex gap-2'>
					<Link href='/admin/questions'>
						<Button variant='outline'>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Back to Questions
						</Button>
					</Link>
					<Link href={`/admin/questions/${params.id}/edit`}>
						<Button>
							<Pencil className='h-4 w-4 mr-2' />
							Edit Question
						</Button>
					</Link>
				</div>
			</AdminHeader>

			<Card>
				<CardHeader>
					<CardTitle>Question</CardTitle>
					<CardDescription>
						Created on{' '}
						{new Date(question.createdAt).toLocaleDateString()}
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6'>
					<div>
						<h3 className='text-sm font-medium text-muted-foreground mb-2'>
							Question Text
						</h3>
						<p className='text-lg'>{question.text}</p>
					</div>

					<div>
						<h3 className='text-sm font-medium text-muted-foreground mb-3'>
							Options
						</h3>
						<div className='space-y-2'>
							{options.map((option: string, index: number) => (
								<div
									key={index}
									className='flex items-center gap-2 p-3 rounded-lg border bg-card'
								>
									<span className='flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm font-medium'>
										{index + 1}
									</span>
									<span>{option}</span>
									{option === question.correctAnswer && (
										<Badge
											variant='default'
											className='ml-auto'
										>
											Correct Answer
										</Badge>
									)}
								</div>
							))}
						</div>
					</div>

					<div>
						<h3 className='text-sm font-medium text-muted-foreground mb-2'>
							Correct Answer
						</h3>
						<p className='text-lg font-medium text-green-600 dark:text-green-400'>
							{question.correctAnswer}
						</p>
					</div>

					<div className='pt-4 border-t'>
						<div className='flex gap-6 text-sm text-muted-foreground'>
							<div>
								<span className='font-medium'>Created:</span>{' '}
								{new Date(question.createdAt).toLocaleString()}
							</div>
							<div>
								<span className='font-medium'>Updated:</span>{' '}
								{new Date(question.updatedAt).toLocaleString()}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</AdminShell>
	);
}
