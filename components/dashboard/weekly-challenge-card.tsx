'use client';

import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Trophy, Users, Clock } from 'lucide-react';
import { useState } from 'react';

interface WeeklyChallengeCardProps {
	challenge: {
		id: string;
		weekNumber: number;
		year: number;
		startDate: Date;
		endDate: Date;
		category: string | null;
		difficulty: string | null;
		questionCount: number;
		timeLimit: number;
		participantCount: number;
		hasParticipated: boolean;
		userScore?: number;
		userRank?: number;
	};
	onParticipate: (challengeId: string) => Promise<void>;
	onViewLeaderboard: (challengeId: string) => void;
	isLoading?: boolean;
}

// Helper function to get difficulty color
const getDifficultyColor = (difficulty: string | null): string => {
	if (!difficulty) return 'bg-gray-500';

	const difficultyMap: Record<string, string> = {
		EASY: 'bg-green-500',
		MEDIUM: 'bg-yellow-500',
		HARD: 'bg-orange-500',
		EXPERT: 'bg-red-500',
	};

	return difficultyMap[difficulty] || 'bg-gray-500';
};

// Helper function to format category
const formatCategory = (category: string | null): string => {
	if (!category) return 'General';

	return category
		.split('_')
		.map(
			(word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
		)
		.join(' ');
};

// Helper function to format difficulty
const formatDifficulty = (difficulty: string | null): string => {
	if (!difficulty) return 'Mixed';

	return (
		difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()
	);
};

// Helper function to format week range
const formatWeekRange = (startDate: Date, endDate: Date): string => {
	const start = format(startDate, 'MMM d');
	const end = format(endDate, 'MMM d, yyyy');
	return `${start}-${end}`;
};

export function WeeklyChallengeCard({
	challenge,
	onParticipate,
	onViewLeaderboard,
	isLoading = false,
}: WeeklyChallengeCardProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleParticipate = async () => {
		setIsSubmitting(true);
		try {
			await onParticipate(challenge.id);
		} finally {
			setIsSubmitting(false);
		}
	};

	const timePerQuestion = Math.floor(
		challenge.timeLimit / challenge.questionCount
	);

	return (
		<Card className='overflow-hidden border-0 shadow-lg transition-all hover:shadow-xl'>
			{/* Gradient Header - Purple to Pink */}
			<CardHeader className='bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white'>
				<div className='space-y-2'>
					<div className='text-sm font-medium opacity-90'>
						Weekly Challenge
					</div>
					<div className='text-2xl font-bold'>
						Week {challenge.weekNumber} • {challenge.year}
					</div>
					<div className='text-sm opacity-90'>
						{formatWeekRange(
							challenge.startDate,
							challenge.endDate
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className='space-y-4 p-6'>
				{/* Category and Difficulty Badges */}
				<div className='flex flex-wrap gap-2'>
					{challenge.category && (
						<Badge
							variant='outline'
							className='bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
						>
							{formatCategory(challenge.category)}
						</Badge>
					)}
					{challenge.difficulty && (
						<Badge
							className={`${getDifficultyColor(
								challenge.difficulty
							)} text-white`}
						>
							{formatDifficulty(challenge.difficulty)}
						</Badge>
					)}
				</div>

				{/* Challenge Details */}
				<div className='grid grid-cols-2 gap-4 text-sm'>
					<div className='space-y-1'>
						<div className='text-muted-foreground'>Questions</div>
						<div className='font-semibold'>
							{challenge.questionCount}
						</div>
					</div>
					<div className='space-y-1'>
						<div className='text-muted-foreground'>
							Time/Question
						</div>
						<div className='flex items-center gap-1 font-semibold'>
							<Clock className='h-3.5 w-3.5' />
							{timePerQuestion}s
						</div>
					</div>
				</div>

				{/* Participant Count */}
				<div className='flex items-center gap-2 rounded-lg bg-muted p-3 text-sm'>
					<Users className='h-4 w-4 text-muted-foreground' />
					<span className='font-medium'>
						{challenge.participantCount.toLocaleString()}
					</span>
					<span className='text-muted-foreground'>
						{challenge.participantCount === 1
							? 'participant'
							: 'participants'}
					</span>
				</div>

				{/* Conditional Content Based on Participation */}
				{challenge.hasParticipated ? (
					<div className='space-y-3'>
						{/* User Score and Rank */}
						<div className='rounded-lg border bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:from-purple-950/20 dark:to-pink-950/20'>
							<div className='flex items-center justify-between'>
								<div className='space-y-1'>
									<div className='text-sm text-muted-foreground'>
										Your Score
									</div>
									<div className='text-2xl font-bold text-pink-600 dark:text-pink-400'>
										{challenge.userScore}
									</div>
								</div>
								<div className='flex items-center gap-2'>
									<Trophy className='h-6 w-6 text-purple-500' />
									<div className='space-y-1 text-right'>
										<div className='text-sm text-muted-foreground'>
											Rank
										</div>
										<div className='text-xl font-bold'>
											#{challenge.userRank}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* View Leaderboard Button */}
						<Button
							onClick={() => onViewLeaderboard(challenge.id)}
							className='w-full'
							variant='outline'
							disabled={isLoading}
						>
							View Leaderboard
						</Button>
					</div>
				) : (
					// Start Challenge Button
					<Button
						onClick={handleParticipate}
						className='w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
						disabled={isLoading || isSubmitting}
					>
						{isSubmitting ? (
							<>
								<div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
								Starting...
							</>
						) : (
							<>
								<Play className='mr-2 h-4 w-4' />
								Start Challenge
							</>
						)}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
