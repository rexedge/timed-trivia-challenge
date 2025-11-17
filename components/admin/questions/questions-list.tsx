'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Question } from '@prisma/client';
import { useRouter } from 'next/navigation';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { deleteQuestion } from '@/app/actions/admin-actions';
import { PaginationButton } from '@/components/pagination-button';
import { toast } from 'sonner';

interface QuestionsListProps {
	questions: Question[];
	pagination: {
		total: number;
		pages: number;
		page: number;
		limit: number;
	};
}

export function QuestionsList({ questions, pagination }: QuestionsListProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<string | null>(null);
	const [questionToDelete, setQuestionToDelete] = useState<Question | null>(
		null
	);

	const handleDelete = async (question: Question) => {
		setIsLoading(question.id);
		try {
			const result = await deleteQuestion(question.id);

			if (!result.success) {
				toast.error('Error', {
					description: result.message || 'Failed to delete question',
				});
				return;
			}

			toast.success('Success', {
				description: 'Question deleted successfully',
			});
			router.refresh();
		} catch (error) {
			toast.error('Error', {
				description: 'Something went wrong',
			});
		} finally {
			setIsLoading(null);
			setQuestionToDelete(null);
		}
	};

	const formatOptions = (optionsJson: string) => {
		try {
			const options = JSON.parse(optionsJson);
			// Check if it's an array of objects (new format) or just strings (old format)
			if (Array.isArray(options)) {
				if (options.length > 0 && typeof options[0] === 'object') {
					// New format: array of {optionText, isCorrect}
					return options.map((opt: any) => opt.optionText).join(', ');
				}
				// Old format: array of strings
				return options.join(', ');
			}
			return 'Invalid options';
		} catch {
			return 'Invalid options';
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Questions</CardTitle>
				<CardDescription>
					Manage your trivia questions here. You can add, edit, or
					delete questions.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='rounded-md border'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='w-[50%]'>
									Question
								</TableHead>
								<TableHead>Options</TableHead>
								<TableHead>Correct Answer</TableHead>
								<TableHead className='w-[100px]'>
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{questions.map((question) => (
								<TableRow key={question.id}>
									<TableCell className='font-medium'>
										{question.text}
									</TableCell>
									<TableCell>
										{formatOptions(question.options)}
									</TableCell>
									<TableCell>
										{question.correctAnswer}
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant='ghost'
													className='h-8 w-8 p-0'
													disabled={
														isLoading ===
														question.id
													}
												>
													<span className='sr-only'>
														Open menu
													</span>
													<MoreHorizontal className='h-4 w-4' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='end'>
												<DropdownMenuItem asChild>
													<Link
														href={`/admin/questions/${question.id}/edit`}
														className='flex items-center'
													>
														<Pencil className='mr-2 h-4 w-4' />
														Edit
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem
													className='flex items-center text-destructive focus:text-destructive'
													onSelect={() =>
														setQuestionToDelete(
															question
														)
													}
												>
													<Trash className='mr-2 h-4 w-4' />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
							{questions.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={4}
										className='h-24 text-center'
									>
										No questions found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>

				{pagination.pages > 1 && (
					<div className='mt-4 flex justify-center'>
						<PaginationButton
							currentPage={pagination.page}
							totalPages={pagination.pages}
							baseUrl='/admin/questions'
						/>
					</div>
				)}
			</CardContent>

			<AlertDialog
				open={questionToDelete !== null}
				onOpenChange={(open) => !open && setQuestionToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete this question. This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() =>
								questionToDelete &&
								handleDelete(questionToDelete)
							}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}
