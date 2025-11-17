'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { AdminHeader } from '@/components/admin/admin-header';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AIReviewQuestions } from '@/components/admin/questions/ai-review-questions';
import {
	generateQuestions,
	approveGeneratedQuestions,
} from '@/app/actions/ai-generation-actions';
import type {
	GeneratedQuestion,
	GenerationStatus,
} from '@/lib/types/ai-generation';
import { Category, Difficulty } from '@prisma/client';
import { Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES: { value: Category; label: string }[] = [
	{ value: 'GENERAL_KNOWLEDGE', label: 'General Knowledge' },
	{ value: 'SCIENCE', label: 'Science' },
	{ value: 'HISTORY', label: 'History' },
	{ value: 'GEOGRAPHY', label: 'Geography' },
	{ value: 'SPORTS', label: 'Sports' },
	{ value: 'ENTERTAINMENT', label: 'Entertainment' },
	{ value: 'TECHNOLOGY', label: 'Technology' },
	{ value: 'ARTS_LITERATURE', label: 'Arts & Literature' },
	{ value: 'CURRENT_EVENTS', label: 'Current Events' },
];

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
	{ value: 'EASY', label: 'Easy' },
	{ value: 'MEDIUM', label: 'Medium' },
	{ value: 'HARD', label: 'Hard' },
	{ value: 'EXPERT', label: 'Expert' },
];

export default function GenerateQuestionsPage() {
	const router = useRouter();

	// Form state
	const [category, setCategory] = useState<Category | ''>('');
	const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
	const [count, setCount] = useState<string>('5');
	const [topic, setTopic] = useState<string>('');
	const [context, setContext] = useState<string>('');

	// Generation state
	const [status, setStatus] = useState<GenerationStatus>('idle');
	const [generatedQuestions, setGeneratedQuestions] = useState<
		GeneratedQuestion[]
	>([]);
	const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
	const [error, setError] = useState<string>('');

	const handleGenerate = async () => {
		// Validate
		if (!category || !difficulty) {
			toast.error('Please select category and difficulty');
			return;
		}

		const questionCount = parseInt(count);
		if (isNaN(questionCount) || questionCount < 1 || questionCount > 20) {
			toast.error('Count must be between 1 and 20');
			return;
		}

		setStatus('generating');
		setError('');

		try {
			const result = await generateQuestions({
				category,
				difficulty,
				count: questionCount,
				topic: topic.trim() || undefined,
				context: context.trim() || undefined,
			});

			if (result.success && result.data) {
				setGeneratedQuestions(result.data.questions);
				setSelectedQuestions(result.data.questions.map((q) => q.id)); // Select all by default
				setStatus('success');
				toast.success(
					`Generated ${result.data.questions.length} questions successfully!`
				);
			} else {
				setError(result.error || 'Failed to generate questions');
				setStatus('error');
				toast.error(result.error || 'Failed to generate questions');
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'An error occurred';
			setError(errorMessage);
			setStatus('error');
			toast.error(errorMessage);
		}
	};

	const handleToggleSelection = (id: string) => {
		setSelectedQuestions((prev) =>
			prev.includes(id) ? prev.filter((qid) => qid !== id) : [...prev, id]
		);
	};

	const handleApprove = async () => {
		if (selectedQuestions.length === 0) {
			toast.error('Please select at least one question to approve');
			return;
		}

		const questionsToApprove = generatedQuestions
			.filter((q) => selectedQuestions.includes(q.id))
			.map((q) => ({
				questionText: q.questionText,
				category: q.category,
				difficulty: q.difficulty,
				options: q.options,
				explanation: q.explanation,
				aiMetadata: JSON.stringify(q.aiMetadata),
			}));

		try {
			const result = await approveGeneratedQuestions({
				questions: questionsToApprove,
			});

			if (result.success && result.data) {
				toast.success(
					`Successfully approved ${result.data.savedCount} questions!`
				);
				// Reset state
				setGeneratedQuestions([]);
				setSelectedQuestions([]);
				setStatus('idle');
				// Optionally redirect to questions list
				// router.push('/admin/questions');
			} else {
				toast.error(result.error || 'Failed to save questions');
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to save questions';
			toast.error(errorMessage);
		}
	};

	return (
		<AdminShell>
			<AdminHeader
				heading='AI Question Generation'
				text='Generate trivia questions using AI and review them before adding to the database'
			/>

			<div className='grid gap-6'>
				{/* Generation Form */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Sparkles className='h-5 w-5 text-primary' />
							Generate Questions
						</CardTitle>
						<CardDescription>
							Configure the AI to generate trivia questions based
							on your requirements
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{/* Category */}
							<div className='space-y-2'>
								<Label htmlFor='category'>
									Category{' '}
									<span className='text-red-500'>*</span>
								</Label>
								<Select
									value={category}
									onValueChange={(value) =>
										setCategory(value as Category)
									}
								>
									<SelectTrigger id='category'>
										<SelectValue placeholder='Select category' />
									</SelectTrigger>
									<SelectContent>
										{CATEGORIES.map((cat) => (
											<SelectItem
												key={cat.value}
												value={cat.value}
											>
												{cat.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Difficulty */}
							<div className='space-y-2'>
								<Label htmlFor='difficulty'>
									Difficulty{' '}
									<span className='text-red-500'>*</span>
								</Label>
								<Select
									value={difficulty}
									onValueChange={(value) =>
										setDifficulty(value as Difficulty)
									}
								>
									<SelectTrigger id='difficulty'>
										<SelectValue placeholder='Select difficulty' />
									</SelectTrigger>
									<SelectContent>
										{DIFFICULTIES.map((diff) => (
											<SelectItem
												key={diff.value}
												value={diff.value}
											>
												{diff.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Count */}
							<div className='space-y-2'>
								<Label htmlFor='count'>
									Number of Questions (1-20)
								</Label>
								<Input
									id='count'
									type='number'
									min='1'
									max='20'
									value={count}
									onChange={(e) => setCount(e.target.value)}
									placeholder='5'
								/>
							</div>

							{/* Topic (Optional) */}
							<div className='space-y-2'>
								<Label htmlFor='topic'>
									Specific Topic (Optional)
								</Label>
								<Input
									id='topic'
									value={topic}
									onChange={(e) => setTopic(e.target.value)}
									placeholder='e.g., World War II, React Hooks'
								/>
							</div>
						</div>

						{/* Context (Optional) */}
						<div className='space-y-2'>
							<Label htmlFor='context'>
								Additional Context (Optional)
							</Label>
							<Textarea
								id='context'
								value={context}
								onChange={(e) => setContext(e.target.value)}
								placeholder='Provide any additional requirements or constraints for the AI'
								rows={3}
							/>
						</div>

						{/* Error Display */}
						{error && (
							<Alert variant='destructive'>
								<AlertCircle className='h-4 w-4' />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{/* Generate Button */}
						<Button
							onClick={handleGenerate}
							disabled={status === 'generating'}
							size='lg'
							className='w-full'
						>
							{status === 'generating' ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Generating Questions...
								</>
							) : (
								<>
									<Sparkles className='mr-2 h-4 w-4' />
									Generate Questions
								</>
							)}
						</Button>
					</CardContent>
				</Card>

				{/* Review Generated Questions */}
				{generatedQuestions.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<CheckCircle2 className='h-5 w-5 text-green-600' />
								Review Generated Questions
							</CardTitle>
							<CardDescription>
								Review the AI-generated questions and select
								which ones to approve
							</CardDescription>
						</CardHeader>
						<CardContent>
							<AIReviewQuestions
								questions={generatedQuestions}
								selectedIds={selectedQuestions}
								onToggleSelection={handleToggleSelection}
								onApprove={handleApprove}
								isApproving={false}
							/>
						</CardContent>
					</Card>
				)}
			</div>
		</AdminShell>
	);
}
