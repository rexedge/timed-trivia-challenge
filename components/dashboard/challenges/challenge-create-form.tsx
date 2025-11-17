'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, X } from 'lucide-react';
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Types
export type Opponent = {
	id: string;
	name: string;
	email?: string;
	profession?: string;
};

type Category =
	| 'SCIENCE'
	| 'HISTORY'
	| 'GEOGRAPHY'
	| 'SPORTS'
	| 'ENTERTAINMENT'
	| 'ARTS'
	| 'TECHNOLOGY'
	| 'LITERATURE'
	| 'GENERAL_KNOWLEDGE';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

// Validation Schema
const challengeFormSchema = z.object({
	opponentId: z.string().min(1, 'Please select an opponent'),
	questionCount: z.number().min(1).max(20),
	timeLimit: z.number().min(30).max(600),
	category: z.string().optional(),
	difficulty: z.string().optional(),
});

type ChallengeFormValues = z.infer<typeof challengeFormSchema>;

// Enum to friendly label mappings
const categoryLabels: Record<Category, string> = {
	SCIENCE: 'Science',
	HISTORY: 'History',
	GEOGRAPHY: 'Geography',
	SPORTS: 'Sports',
	ENTERTAINMENT: 'Entertainment',
	ARTS: 'Arts',
	TECHNOLOGY: 'Technology',
	LITERATURE: 'Literature',
	GENERAL_KNOWLEDGE: 'General Knowledge',
};

const difficultyLabels: Record<Difficulty, string> = {
	EASY: 'Easy',
	MEDIUM: 'Medium',
	HARD: 'Hard',
	EXPERT: 'Expert',
};

// Time limit options with formatted labels
const timeLimitOptions = [
	{ value: 30, label: '30 seconds (0m 30s)' },
	{ value: 60, label: '60 seconds (1m 0s)' },
	{ value: 90, label: '90 seconds (1m 30s)' },
	{ value: 120, label: '120 seconds (2m 0s)' },
	{ value: 180, label: '180 seconds (3m 0s)' },
	{ value: 240, label: '240 seconds (4m 0s)' },
	{ value: 300, label: '300 seconds (5m 0s)' },
	{ value: 600, label: '600 seconds (10m 0s)' },
];

// Component Props
type ChallengeCreateFormProps = {
	opponents: Opponent[];
	onSubmit: (
		data: ChallengeFormValues
	) => Promise<{ success: boolean; error?: string }>;
	onCancel?: () => void;
};

export function ChallengeCreateForm({
	opponents,
	onSubmit,
	onCancel,
}: ChallengeCreateFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<ChallengeFormValues>({
		resolver: zodResolver(challengeFormSchema),
		defaultValues: {
			opponentId: '',
			questionCount: 5,
			timeLimit: 300,
			category: undefined,
			difficulty: undefined,
		},
	});

	const handleSubmit = async (data: ChallengeFormValues) => {
		setIsSubmitting(true);
		try {
			const result = await onSubmit(data);

			if (result.success) {
				toast.success(
					'Challenge Sent! Your challenge has been sent successfully.'
				);
				form.reset();
			} else {
				toast.error(
					result.error ||
						'Failed to send challenge. Please try again.'
				);
			}
		} catch (error) {
			toast.error('An unexpected error occurred. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		form.reset();
		onCancel?.();
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className='space-y-6'
			>
				{/* Two-column grid layout on desktop */}
				<div className='grid gap-6 md:grid-cols-2'>
					{/* Left Column */}
					<div className='space-y-4'>
						{/* Opponent Select */}
						<FormField
							control={form.control}
							name='opponentId'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Challenge Opponent</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder='Select an opponent' />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{opponents.map((opponent) => (
												<SelectItem
													key={opponent.id}
													value={opponent.id}
												>
													<div className='flex flex-col'>
														<span className='font-medium'>
															{opponent.name}
														</span>
														{(opponent.email ||
															opponent.profession) && (
															<span className='text-xs text-muted-foreground'>
																{opponent.profession &&
																	opponent.profession}
																{opponent.profession &&
																	opponent.email &&
																	' • '}
																{opponent.email &&
																	opponent.email}
															</span>
														)}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Question Count */}
						<FormField
							control={form.control}
							name='questionCount'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Number of Questions</FormLabel>
									<Select
										onValueChange={(value) =>
											field.onChange(parseInt(value))
										}
										value={field.value.toString()}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{Array.from(
												{ length: 20 },
												(_, i) => i + 1
											).map((num) => (
												<SelectItem
													key={num}
													value={num.toString()}
												>
													{num}{' '}
													{num === 1
														? 'question'
														: 'questions'}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Right Column */}
					<div className='space-y-4'>
						{/* Time Limit */}
						<FormField
							control={form.control}
							name='timeLimit'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Time Limit (seconds)</FormLabel>
									<Select
										onValueChange={(value) =>
											field.onChange(parseInt(value))
										}
										value={field.value.toString()}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{timeLimitOptions.map((option) => (
												<SelectItem
													key={option.value}
													value={option.value.toString()}
												>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										Time per question
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Category Filter */}
						<FormField
							control={form.control}
							name='category'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Category (Optional)</FormLabel>
									<div className='flex gap-2'>
										<Select
											onValueChange={field.onChange}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Any Category' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Object.entries(
													categoryLabels
												).map(([value, label]) => (
													<SelectItem
														key={value}
														value={value}
													>
														{label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{field.value && (
											<Button
												type='button'
												variant='outline'
												size='icon'
												onClick={() =>
													field.onChange(undefined)
												}
												className='shrink-0'
											>
												<X className='h-4 w-4' />
												<span className='sr-only'>
													Clear category
												</span>
											</Button>
										)}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Difficulty Filter */}
						<FormField
							control={form.control}
							name='difficulty'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Difficulty (Optional)</FormLabel>
									<div className='flex gap-2'>
										<Select
											onValueChange={field.onChange}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Any Difficulty' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Object.entries(
													difficultyLabels
												).map(([value, label]) => (
													<SelectItem
														key={value}
														value={value}
													>
														{label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{field.value && (
											<Button
												type='button'
												variant='outline'
												size='icon'
												onClick={() =>
													field.onChange(undefined)
												}
												className='shrink-0'
											>
												<X className='h-4 w-4' />
												<span className='sr-only'>
													Clear difficulty
												</span>
											</Button>
										)}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				{/* Action Buttons */}
				<div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
					<Button
						type='button'
						variant='outline'
						onClick={handleCancel}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						type='submit'
						disabled={isSubmitting}
					>
						{isSubmitting && (
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
						)}
						{isSubmitting ? 'Sending...' : 'Send Challenge'}
					</Button>
				</div>
			</form>
		</Form>
	);
}
