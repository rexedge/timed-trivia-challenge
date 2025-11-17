'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { GeneratedQuestion } from '@/lib/types/ai-generation';
import { Category, Difficulty } from '@prisma/client';

interface AIReviewQuestionsProps {
	questions: GeneratedQuestion[];
	selectedIds: string[];
	onToggleSelection: (id: string) => void;
	onApprove: () => void;
	isApproving?: boolean;
}

const difficultyColors: Record<Difficulty, string> = {
	EASY: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
	MEDIUM: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
	HARD: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
	EXPERT: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
};

const categoryLabels: Record<Category, string> = {
	GENERAL_KNOWLEDGE: 'General Knowledge',
	SCIENCE: 'Science',
	HISTORY: 'History',
	GEOGRAPHY: 'Geography',
	SPORTS: 'Sports',
	ENTERTAINMENT: 'Entertainment',
	TECHNOLOGY: 'Technology',
	ARTS_LITERATURE: 'Arts & Literature',
	CURRENT_EVENTS: 'Current Events',
};

const difficultyLabels: Record<Difficulty, string> = {
	EASY: 'Easy',
	MEDIUM: 'Medium',
	HARD: 'Hard',
	EXPERT: 'Expert',
};

export function AIReviewQuestions({
	questions,
	selectedIds,
	onToggleSelection,
	onApprove,
	isApproving = false,
}: AIReviewQuestionsProps) {
	const selectedCount = selectedIds.length;
	const hasQuestions = questions.length > 0;

	if (!hasQuestions) {
		return (
			<div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
				<AlertCircle className='h-12 w-12 text-muted-foreground mb-4' />
				<h3 className='text-lg font-semibold mb-2'>
					No Questions Available
				</h3>
				<p className='text-sm text-muted-foreground max-w-sm'>
					Generate AI questions using the form above to review and
					approve them.
				</p>
			</div>
		);
	}

	return (
		<div className='space-y-4'>
			{/* Header with selection count and approve button */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/50 rounded-lg'>
				<div className='flex items-center gap-2'>
					<span className='text-sm font-medium'>
						{selectedCount} of {questions.length} selected
					</span>
				</div>
				<Button
					onClick={onApprove}
					disabled={selectedCount === 0 || isApproving}
					size='sm'
					className='w-full sm:w-auto'
				>
					<CheckCircle2 className='h-4 w-4 mr-2' />
					{isApproving
						? 'Approving...'
						: `Approve Selected (${selectedCount})`}
				</Button>
			</div>

			{/* Questions grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{questions.map((question) => {
					const isSelected = selectedIds.includes(question.id);
					const generatedDate = new Date(
						question.aiMetadata.generatedAt
					).toLocaleDateString('en-US', {
						day: 'numeric',
						month: 'short',
						year: 'numeric',
					});

					const correctOptionIndex = question.options.findIndex(
						(opt) => opt.isCorrect
					);

					return (
						<Card
							key={question.id}
							className={`transition-all ${
								isSelected
									? 'ring-2 ring-primary shadow-md'
									: ''
							}`}
						>
							<CardHeader className='pb-3'>
								<div className='flex items-start gap-3'>
									<Checkbox
										id={`question-${question.id}`}
										checked={isSelected}
										onCheckedChange={() =>
											onToggleSelection(question.id)
										}
										className='mt-1'
									/>
									<div className='flex-1 space-y-2'>
										<label
											htmlFor={`question-${question.id}`}
											className='text-sm font-medium leading-relaxed cursor-pointer'
										>
											{question.questionText}
										</label>
										<div className='flex flex-wrap gap-2'>
											<Badge
												variant='secondary'
												className='text-xs'
											>
												{
													categoryLabels[
														question.category
													]
												}
											</Badge>
											<Badge
												variant='secondary'
												className={`text-xs ${
													difficultyColors[
														question.difficulty
													]
												}`}
											>
												{
													difficultyLabels[
														question.difficulty
													]
												}
											</Badge>
											{question.topic && (
												<Badge
													variant='outline'
													className='text-xs'
												>
													{question.topic}
												</Badge>
											)}
										</div>
									</div>
								</div>
							</CardHeader>

							<CardContent className='space-y-3'>
								{/* Options */}
								<div className='space-y-2'>
									{question.options.map((option, index) => {
										const isCorrect = option.isCorrect;
										return (
											<div
												key={index}
												className={`text-xs p-2 rounded-md transition-colors ${
													isCorrect
														? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-100 border border-emerald-500/20'
														: 'bg-muted/50 text-muted-foreground'
												}`}
											>
												<span className='font-medium mr-2'>
													{String.fromCharCode(
														65 + index
													)}
													.
												</span>
												{option.optionText}
												{isCorrect && (
													<CheckCircle2 className='h-3 w-3 inline-block ml-2 text-emerald-600 dark:text-emerald-400' />
												)}
											</div>
										);
									})}
								</div>

								{/* Explanation */}
								{question.explanation && (
									<div className='pt-2 border-t'>
										<p className='text-xs text-muted-foreground leading-relaxed'>
											<span className='font-medium text-foreground'>
												Explanation:
											</span>{' '}
											{question.explanation}
										</p>
									</div>
								)}

								{/* AI Metadata */}
								<div className='pt-2 border-t'>
									<div className='flex flex-col gap-1'>
										<p className='text-xs text-muted-foreground'>
											<span className='font-medium'>
												Model:
											</span>{' '}
											{question.aiMetadata.model}
										</p>
										<p className='text-xs text-muted-foreground'>
											<span className='font-medium'>
												Generated:
											</span>{' '}
											{generatedDate}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
