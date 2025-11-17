'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Question, Category, Difficulty, QuestionSource } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { createQuestion, updateQuestion } from '@/app/actions/question-actions';

// Friendly labels for enums
const CategoryLabels: Record<Category, string> = {
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

const DifficultyLabels: Record<Difficulty, string> = {
	EASY: 'Easy',
	MEDIUM: 'Medium',
	HARD: 'Hard',
	EXPERT: 'Expert',
};

const SourceLabels: Record<QuestionSource, string> = {
	MANUAL: 'Manual',
	AI_GENERATED: 'AI Generated',
	IMPORTED: 'Imported',
};

const formSchema = z.object({
	text: z.string().min(10, 'Question must be at least 10 characters'),
	options: z
		.array(
			z.object({
				value: z.string().min(1, 'Option cannot be empty'),
			})
		)
		.min(2, 'At least 2 options are required')
		.max(10, 'Maximum 10 options allowed'),
	correctAnswer: z.string().min(1, 'Correct answer is required'),
	category: z.nativeEnum(Category),
	difficulty: z.nativeEnum(Difficulty),
	source: z.nativeEnum(QuestionSource),
});

type FormValues = z.infer<typeof formSchema>;

interface QuestionFormProps {
	question?: Question;
}

export function QuestionForm({ question }: QuestionFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	// Parse existing question options or use defaults
	const existingOptions = question
		? JSON.parse(question.options).map((opt: string) => ({ value: opt }))
		: [{ value: '' }, { value: '' }];

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			text: question?.text || '',
			options: existingOptions,
			correctAnswer: question?.correctAnswer || '',
			category: question?.category || Category.GENERAL_KNOWLEDGE,
			difficulty: question?.difficulty || Difficulty.MEDIUM,
			source: question?.source || QuestionSource.MANUAL,
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'options',
	});

	async function onSubmit(values: FormValues) {
		setIsLoading(true);
		try {
			// Transform options back to string array
			const optionsArray = values.options.map((opt) => opt.value);

			const payload = {
				text: values.text,
				options: optionsArray,
				correctAnswer: values.correctAnswer,
				category: values.category,
				difficulty: values.difficulty,
				source: values.source,
			};

			const action = question
				? updateQuestion(question.id, payload)
				: createQuestion(payload);

			const result = await action;

			if (!result.success) {
				toast.error('Error', {
					description: result.message || 'Something went wrong',
				});
				return;
			}

			toast.success('Success', {
				description: `Question ${
					question ? 'updated' : 'created'
				} successfully`,
			});
			router.push('/admin/questions');
		} catch (error) {
			toast.error('Error', {
				description: 'Something went wrong',
			});
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{question ? 'Edit Question' : 'New Question'}
				</CardTitle>
				<CardDescription>
					{question
						? 'Update your trivia question'
						: 'Create a new trivia question'}
				</CardDescription>
			</CardHeader>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<CardContent className='space-y-6'>
						{/* Question Text */}
						<FormField
							control={form.control}
							name='text'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Question Text</FormLabel>
									<FormControl>
										<Textarea
											placeholder='Enter your trivia question here...'
											className='min-h-24 resize-none'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Options */}
						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<FormLabel>
									Options ({fields.length}/10)
								</FormLabel>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={() => append({ value: '' })}
									disabled={fields.length >= 10}
								>
									<Plus className='mr-1.5 h-4 w-4' />
									Add Option
								</Button>
							</div>
							<div className='space-y-2'>
								{fields.map((field, index) => (
									<FormField
										key={field.id}
										control={form.control}
										name={`options.${index}.value`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<div className='flex gap-2'>
														<Input
															placeholder={`Option ${
																index + 1
															}`}
															className='flex-1'
															{...field}
														/>
														<Button
															type='button'
															variant='ghost'
															size='icon'
															onClick={() =>
																remove(index)
															}
															disabled={
																fields.length <=
																2
															}
															className='shrink-0'
														>
															<X className='h-4 w-4' />
															<span className='sr-only'>
																Remove option
															</span>
														</Button>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								))}
							</div>
							<FormDescription className='text-xs'>
								Add between 2 and 10 answer options for this
								question
							</FormDescription>
						</div>

						{/* Correct Answer */}
						<FormField
							control={form.control}
							name='correctAnswer'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Correct Answer</FormLabel>
									<FormControl>
										<Input
											placeholder='Enter the correct answer'
											{...field}
										/>
									</FormControl>
									<FormDescription className='text-xs'>
										This should match one of the options
										above
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Category and Difficulty */}
						<div className='grid gap-6 sm:grid-cols-2'>
							<FormField
								control={form.control}
								name='category'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Select a category' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Object.entries(
													CategoryLabels
												).map(([key, label]) => (
													<SelectItem
														key={key}
														value={key}
													>
														{label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='difficulty'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Difficulty Level</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Select difficulty' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Object.entries(
													DifficultyLabels
												).map(([key, label]) => (
													<SelectItem
														key={key}
														value={key}
													>
														{label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Source (readonly) */}
						<FormField
							control={form.control}
							name='source'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Source</FormLabel>
									<FormControl>
										<Input
											value={SourceLabels[field.value]}
											disabled
											className='bg-muted'
										/>
									</FormControl>
									<FormDescription className='text-xs'>
										This field shows how the question was
										created
									</FormDescription>
								</FormItem>
							)}
						/>
					</CardContent>
					<CardFooter className='flex justify-between'>
						<Button
							type='button'
							variant='outline'
							onClick={() => router.back()}
						>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={isLoading}
						>
							{isLoading
								? 'Saving...'
								: question
								? 'Update'
								: 'Create'}
						</Button>
					</CardFooter>
				</form>
			</Form>
		</Card>
	);
}
