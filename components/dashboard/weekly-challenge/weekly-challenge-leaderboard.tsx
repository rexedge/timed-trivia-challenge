'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface WeeklyChallengeLeaderboardProps {
	participants: {
		id: string;
		userId: string;
		userName: string;
		userProfession?: string;
		score: number;
		rank: number;
	}[];
	currentUserId?: string;
}

export function WeeklyChallengeLeaderboard({
	participants,
	currentUserId,
}: WeeklyChallengeLeaderboardProps) {
	const getRankIcon = (rank: number) => {
		switch (rank) {
			case 1:
				return <Trophy className='h-5 w-5 text-yellow-500' />;
			case 2:
				return <Medal className='h-5 w-5 text-gray-400' />;
			case 3:
				return <Medal className='h-5 w-5 text-amber-600' />;
			default:
				return null;
		}
	};

	const getRankColor = (rank: number) => {
		switch (rank) {
			case 1:
				return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800';
			case 2:
				return 'bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800';
			case 3:
				return 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800';
			default:
				return 'bg-background';
		}
	};

	if (participants.length === 0) {
		return (
			<Card>
				<CardContent className='flex flex-col items-center justify-center py-12 text-center'>
					<Trophy className='h-12 w-12 text-muted-foreground mb-4' />
					<h3 className='font-semibold text-lg mb-1'>
						No participants yet
					</h3>
					<p className='text-muted-foreground text-sm max-w-sm'>
						Be the first to complete this weekly challenge!
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Trophy className='h-5 w-5' />
					Weekly Leaderboard
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-2'>
					{participants.map((participant) => {
						const isCurrentUser =
							participant.userId === currentUserId;
						const initials = participant.userName
							.split(' ')
							.map((n) => n[0])
							.join('')
							.toUpperCase()
							.slice(0, 2);

						return (
							<div
								key={participant.id}
								className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${getRankColor(
									participant.rank
								)} ${
									isCurrentUser ? 'ring-2 ring-primary' : ''
								}`}
							>
								{/* Rank */}
								<div className='flex items-center justify-center w-10'>
									{getRankIcon(participant.rank) || (
										<span className='font-semibold text-muted-foreground'>
											{participant.rank}
										</span>
									)}
								</div>

								{/* Avatar */}
								<Avatar className='h-10 w-10'>
									<AvatarFallback>{initials}</AvatarFallback>
								</Avatar>

								{/* User Info */}
								<div className='flex-1 min-w-0'>
									<div className='flex items-center gap-2'>
										<p className='font-semibold truncate'>
											{participant.userName}
										</p>
										{isCurrentUser && (
											<Badge
												variant='secondary'
												className='text-xs'
											>
												You
											</Badge>
										)}
									</div>
									{participant.userProfession && (
										<p className='text-sm text-muted-foreground truncate'>
											{participant.userProfession}
										</p>
									)}
								</div>

								{/* Score */}
								<div className='text-right'>
									<div className='font-bold text-lg'>
										{participant.score}
									</div>
									<div className='text-xs text-muted-foreground'>
										points
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
