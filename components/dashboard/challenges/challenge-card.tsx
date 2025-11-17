'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';
import {
	ChallengeCardProps,
	ChallengeCategory,
	ChallengeDifficulty,
	ChallengeStatus,
} from '@/lib/types/challenge';
import {
	Calendar,
	Clock,
	TrendingUp,
	X,
	Check,
	Play,
	Eye,
	Loader2,
} from 'lucide-react';
import { useState } from 'react';

// Friendly labels for enums
const categoryLabels: Record<ChallengeCategory, string> = {
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

const difficultyLabels: Record<ChallengeDifficulty, string> = {
	EASY: 'Easy',
	MEDIUM: 'Medium',
	HARD: 'Hard',
	EXPERT: 'Expert',
};

const statusConfig: Record<ChallengeStatus, { label: string; color: string }> =
	{
		PENDING: { label: 'Pending', color: 'bg-yellow-500 text-yellow-50' },
		ACCEPTED: { label: 'Accepted', color: 'bg-blue-500 text-blue-50' },
		IN_PROGRESS: {
			label: 'In Progress',
			color: 'bg-purple-500 text-purple-50',
		},
		COMPLETED: { label: 'Completed', color: 'bg-green-500 text-green-50' },
		DECLINED: { label: 'Declined', color: 'bg-red-500 text-red-50' },
	};

function getExpirationText(expiresAt: Date): string {
	const now = new Date();
	const diffTime = expiresAt.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays < 0) return 'Expired';
	if (diffDays === 0) return 'Expires today';
	if (diffDays === 1) return 'Expires in 1 day';
	return `Expires in ${diffDays} days`;
}

export function ChallengeCard({
	challenge,
	onAccept,
	onDecline,
	onCancel,
	onStart,
	onContinue,
	onViewResults,
}: ChallengeCardProps) {
	const [loadingAction, setLoadingAction] = useState<string | null>(null);

	const isExpired = new Date(challenge.expiresAt) < new Date();
	const isDisabled = isExpired || challenge.status === 'DECLINED';

	const handleAction = async (action: () => void, actionName: string) => {
		setLoadingAction(actionName);
		try {
			await action();
		} finally {
			setLoadingAction(null);
		}
	};

	const renderActions = () => {
		if (isDisabled) return null;

		switch (challenge.status) {
			case 'PENDING':
				if (!challenge.isSender) {
					// Received challenge - show Accept/Decline
					return (
						<div className='flex gap-2'>
							<Button
								onClick={() =>
									onAccept &&
									handleAction(
										() => onAccept(challenge.id),
										'accept'
									)
								}
								disabled={!onAccept || loadingAction !== null}
								className='flex-1'
							>
								{loadingAction === 'accept' ? (
									<Loader2 className='h-4 w-4 animate-spin' />
								) : (
									<Check className='h-4 w-4 mr-1' />
								)}
								Accept
							</Button>
							<Button
								onClick={() =>
									onDecline &&
									handleAction(
										() => onDecline(challenge.id),
										'decline'
									)
								}
								disabled={!onDecline || loadingAction !== null}
								variant='destructive'
								className='flex-1'
							>
								{loadingAction === 'decline' ? (
									<Loader2 className='h-4 w-4 animate-spin' />
								) : (
									<X className='h-4 w-4 mr-1' />
								)}
								Decline
							</Button>
						</div>
					);
				} else {
					// Sent challenge - show waiting message
					return (
						<div className='flex items-center justify-between gap-2'>
							<p className='text-sm text-muted-foreground flex-1'>
								Waiting for response...
							</p>
							<Button
								onClick={() =>
									onCancel &&
									handleAction(
										() => onCancel(challenge.id),
										'cancel'
									)
								}
								disabled={!onCancel || loadingAction !== null}
								variant='outline'
								size='sm'
							>
								{loadingAction === 'cancel' ? (
									<Loader2 className='h-4 w-4 animate-spin' />
								) : (
									'Cancel'
								)}
							</Button>
						</div>
					);
				}

			case 'ACCEPTED':
				return (
					<Button
						onClick={() =>
							onStart &&
							handleAction(() => onStart(challenge.id), 'start')
						}
						disabled={!onStart || loadingAction !== null}
						className='w-full'
					>
						{loadingAction === 'start' ? (
							<Loader2 className='h-4 w-4 animate-spin' />
						) : (
							<Play className='h-4 w-4 mr-1' />
						)}
						Start Challenge
					</Button>
				);

			case 'IN_PROGRESS':
				return (
					<Button
						onClick={() =>
							onContinue &&
							handleAction(
								() => onContinue(challenge.id),
								'continue'
							)
						}
						disabled={!onContinue || loadingAction !== null}
						className='w-full'
					>
						{loadingAction === 'continue' ? (
							<Loader2 className='h-4 w-4 animate-spin' />
						) : (
							<Play className='h-4 w-4 mr-1' />
						)}
						Continue
					</Button>
				);

			case 'COMPLETED':
				return (
					<Button
						onClick={() =>
							onViewResults &&
							handleAction(
								() => onViewResults(challenge.id),
								'view'
							)
						}
						disabled={!onViewResults || loadingAction !== null}
						variant='outline'
						className='w-full'
					>
						{loadingAction === 'view' ? (
							<Loader2 className='h-4 w-4 animate-spin' />
						) : (
							<Eye className='h-4 w-4 mr-1' />
						)}
						View Results
					</Button>
				);

			default:
				return null;
		}
	};

	return (
		<Card
			className={`transition-all hover:shadow-lg ${
				isDisabled ? 'opacity-60' : ''
			}`}
		>
			<CardHeader className='space-y-3 pb-4'>
				<div className='flex items-start justify-between gap-2'>
					<div className='flex-1 min-w-0'>
						<h3 className='font-semibold text-lg leading-tight truncate'>
							{challenge.opponent.name}
						</h3>
						{challenge.opponent.profession && (
							<p className='text-sm text-muted-foreground truncate'>
								{challenge.opponent.profession}
							</p>
						)}
					</div>
					<Badge className={statusConfig[challenge.status].color}>
						{statusConfig[challenge.status].label}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className='space-y-4 pb-4'>
				{/* Challenge Details */}
				<div className='grid grid-cols-2 gap-3 text-sm'>
					<div className='flex items-center gap-2'>
						<TrendingUp className='h-4 w-4 text-muted-foreground shrink-0' />
						<span className='text-muted-foreground truncate'>
							{challenge.questionCount}{' '}
							{challenge.questionCount === 1
								? 'question'
								: 'questions'}
						</span>
					</div>
					<div className='flex items-center gap-2'>
						<Clock className='h-4 w-4 text-muted-foreground shrink-0' />
						<span className='text-muted-foreground truncate'>
							{challenge.timeLimit}s per question
						</span>
					</div>
				</div>

				{/* Category and Difficulty Badges */}
				{(challenge.category || challenge.difficulty) && (
					<div className='flex flex-wrap gap-2'>
						{challenge.category && (
							<Badge
								variant='outline'
								className='text-xs'
							>
								{categoryLabels[challenge.category]}
							</Badge>
						)}
						{challenge.difficulty && (
							<Badge
								variant='secondary'
								className='text-xs'
							>
								{difficultyLabels[challenge.difficulty]}
							</Badge>
						)}
					</div>
				)}

				{/* Expiration Date */}
				<div className='flex items-center gap-2 text-sm'>
					<Calendar className='h-4 w-4 text-muted-foreground shrink-0' />
					<span
						className={`text-muted-foreground ${
							isExpired ? 'text-red-500' : ''
						}`}
					>
						{getExpirationText(challenge.expiresAt)}
					</span>
				</div>
			</CardContent>

			<CardFooter>{renderActions()}</CardFooter>
		</Card>
	);
}
