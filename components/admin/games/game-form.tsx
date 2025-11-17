'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { GameType, Category, Difficulty } from '@prisma/client';
import { Loader2 } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createGame } from '@/app/actions/game-actions';

// Friendly labels
const gameTypeLabels: Record<GameType, string> = {
	PUBLIC: 'Public Game',
	ONE_ON_ONE: 'One-on-One',
	DAILY: 'Daily Challenge',
	WEEKLY: 'Weekly Challenge',
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

// Badge color variants
const difficultyColors: Record<Difficulty, string> = {
	EASY: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
	MEDIUM: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
	HARD: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
	EXPERT: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
};

const categoryColors: Record<Category, string> = {
	GENERAL_KNOWLEDGE:
		'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
	SCIENCE:
		'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
	HISTORY:
		'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
	GEOGRAPHY:
		'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20',
	SPORTS: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
	ENTERTAINMENT:
		'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
	TECHNOLOGY:
		'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
	ARTS_LITERATURE:
		'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
	CURRENT_EVENTS:
		'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
};

// Question type
interface Question {
	id: string;
	text: string;
	category: Category;
	difficulty: Difficulty;
}

const formSchema = z
	.object({
		gameType: z.nativeEnum(GameType),
		startTime: z.string().min(1, 'Start time is required'),
		endTime: z.string().min(1, 'End time is required'),
		categoryFilter: z.string().optional(),
		difficultyFilter: z.string().optional(),
		questions: z.array(z.string()).min(1, {
			message: 'Select at least one question',
		}),
		answerTime: z.number().min(5).max(600),
		resultTime: z.number().min(5).max(600),
		intervalTime: z.number().min(5).max(900),
	})
	.refine((data) => new Date(data.startTime) < new Date(data.endTime), {
		message: 'End time must be after start time',
		path: ['endTime'],
	});

interface GameFormProps {
	questions: Question[];
}

export function GameForm({ questions }: GameFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			gameType: GameType.PUBLIC,
			startTime: '',
			endTime: '',
			categoryFilter: 'ALL',
			difficultyFilter: 'ALL',
			questions: [],
			answerTime: 300,
			resultTime: 300,
			intervalTime: 300,
		},
	});

	// Get current filter values
	const categoryFilter = form.watch('categoryFilter');
	const difficultyFilter = form.watch('difficultyFilter');
	const selectedQuestionIds = form.watch('questions');

	// Filter questions in real-time
	const filteredQuestions = useMemo(() => {
		return questions.filter((question) => {
			const matchesCategory =
				!categoryFilter ||
				categoryFilter === 'ALL' ||
				question.category === categoryFilter;
			const matchesDifficulty =
				!difficultyFilter ||
				difficultyFilter === 'ALL' ||
				question.difficulty === difficultyFilter;
			return matchesCategory && matchesDifficulty;
		});
	}, [questions, categoryFilter, difficultyFilter]);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		try {
			const result = await createGame({
				gameType: values.gameType,
				startTime: new Date(values.startTime),
				endTime: new Date(values.endTime),
				questions: values.questions,
				answerTime: values.answerTime,
				resultTime: values.resultTime,
				intervalTime: values.intervalTime,
			});

			if (!result.success) {
				toast.error(result.message || 'Failed to schedule game');
				return;
			}

			toast.success('Game scheduled successfully');
			router.push('/admin/games');
		} catch (error) {
			toast.error('Failed to schedule game');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Schedule Game</CardTitle>
				<CardDescription>
					Set up a new trivia game session
				</CardDescription>
			</CardHeader>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<CardContent className='space-y-6'>
						{/* Game Type */}
						<FormField
							control={form.control}
							name='gameType'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Game Type</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder='Select game type' />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{Object.values(GameType).map(
												(type) => (
													<SelectItem
														key={type}
														value={type}
													>
														{gameTypeLabels[type]}
													</SelectItem>
												)
											)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Time Fields */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<FormField
								control={form.control}
								name='startTime'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Start Time</FormLabel>
										<FormControl>
											<Input
												type='datetime-local'
												{...field}
											/>
										</FormControl>
										<FormDescription>
											When the game will start
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='endTime'
								render={({ field }) => (
									<FormItem>
										<FormLabel>End Time</FormLabel>
										<FormControl>
											<Input
												type='datetime-local'
												{...field}
											/>
										</FormControl>
										<FormDescription>
											When the game will end
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Filter Section */}
						<Card className='border-muted'>
							<CardHeader className='pb-3'>
								<CardTitle className='text-base'>
									Question Filters
								</CardTitle>
								<CardDescription className='text-sm'>
									Filter questions by category and difficulty
									(optional)
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid gap-4 sm:grid-cols-2'>
									<FormField
										control={form.control}
										name='categoryFilter'
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Category Filter
												</FormLabel>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder='All Categories' />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value='ALL'>
															All Categories
														</SelectItem>
														{Object.values(
															Category
														).map((cat) => (
															<SelectItem
																key={cat}
																value={cat}
															>
																{
																	categoryLabels[
																		cat
																	]
																}
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
										name='difficultyFilter'
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Difficulty Filter
												</FormLabel>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder='All Difficulties' />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value='ALL'>
															All Difficulties
														</SelectItem>
														{Object.values(
															Difficulty
														).map((diff) => (
															<SelectItem
																key={diff}
																value={diff}
															>
																{
																	difficultyLabels[
																		diff
																	]
																}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Timer Settings */}
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<FormField
								control={form.control}
								name='answerTime'
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Answer Time (seconds)
										</FormLabel>
										<FormControl>
											<Input
												type='number'
												min={5}
												max={600}
												{...field}
												onChange={(e) =>
													field.onChange(
														Number(e.target.value)
													)
												}
											/>
										</FormControl>
										<FormDescription>
											Time to answer each question
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='resultTime'
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Result Time (seconds)
										</FormLabel>
										<FormControl>
											<Input
												type='number'
												min={5}
												max={600}
												{...field}
												onChange={(e) =>
													field.onChange(
														Number(e.target.value)
													)
												}
											/>
										</FormControl>
										<FormDescription>
											Time to display results
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='intervalTime'
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Interval Time (seconds)
										</FormLabel>
										<FormControl>
											<Input
												type='number'
												min={5}
												max={900}
												{...field}
												onChange={(e) =>
													field.onChange(
														Number(e.target.value)
													)
												}
											/>
										</FormControl>
										<FormDescription>
											Time between questions
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Questions Selection */}
						<FormField
							control={form.control}
							name='questions'
							render={() => (
								<FormItem>
									<div className='mb-4 flex items-center justify-between'>
										<div>
											<FormLabel className='text-base'>
												Questions
											</FormLabel>
											<FormDescription>
												Select questions for this game (
												{filteredQuestions.length}{' '}
												available)
											</FormDescription>
										</div>
										<Badge
											variant='secondary'
											className='text-xs'
										>
											{selectedQuestionIds.length}{' '}
											selected
										</Badge>
									</div>
									<Card className='border-muted'>
										<CardContent className='pt-6'>
											{filteredQuestions.length === 0 ? (
												<div className='py-8 text-center text-sm text-muted-foreground'>
													No questions available with
													the selected filters
												</div>
											) : (
												<div className='space-y-3 max-h-96 overflow-y-auto pr-2'>
													{filteredQuestions.map(
														(question) => (
															<FormField
																key={
																	question.id
																}
																control={
																	form.control
																}
																name='questions'
																render={({
																	field,
																}) => {
																	return (
																		<FormItem
																			key={
																				question.id
																			}
																			className='flex flex-row items-start gap-3 space-y-0 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50'
																		>
																			<FormControl>
																				<Checkbox
																					checked={field.value?.includes(
																						question.id
																					)}
																					onCheckedChange={(
																						checked
																					) => {
																						const value =
																							field.value ||
																							[];
																						if (
																							checked
																						) {
																							field.onChange(
																								[
																									...value,
																									question.id,
																								]
																							);
																						} else {
																							field.onChange(
																								value.filter(
																									(
																										val
																									) =>
																										val !==
																										question.id
																								)
																							);
																						}
																					}}
																				/>
																			</FormControl>
																			<div className='flex-1 space-y-2'>
																				<FormLabel className='text-sm font-normal leading-relaxed cursor-pointer'>
																					{
																						question.text
																					}
																				</FormLabel>
																				<div className='flex flex-wrap gap-2'>
																					<Badge
																						variant='outline'
																						className={`text-xs ${
																							categoryColors[
																								question
																									.category
																							]
																						}`}
																					>
																						{
																							categoryLabels[
																								question
																									.category
																							]
																						}
																					</Badge>
																					<Badge
																						variant='outline'
																						className={`text-xs ${
																							difficultyColors[
																								question
																									.difficulty
																							]
																						}`}
																					>
																						{
																							difficultyLabels[
																								question
																									.difficulty
																							]
																						}
																					</Badge>
																				</div>
																			</div>
																		</FormItem>
																	);
																}}
															/>
														)
													)}
												</div>
											)}
										</CardContent>
									</Card>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
					<CardFooter className='flex justify-between mt-4'>
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
							{isLoading && (
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							)}
							{isLoading ? 'Scheduling...' : 'Schedule Game'}
						</Button>
					</CardFooter>
				</form>
			</Form>
		</Card>
	);
}
