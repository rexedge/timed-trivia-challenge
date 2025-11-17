'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface LeaderboardTableProps {
	entries: Array<{
		rank: number;
		userId: string;
		userName: string;
		userImage?: string;
		profession?: string;
		totalScore: number;
		gamesPlayed: number;
		averageScore: number;
		highestScore: number;
	}>;
	currentUserId: string;
	showProfession?: boolean;
}

const getRankBadge = (rank: number) => {
	switch (rank) {
		case 1:
			return '🥇';
		case 2:
			return '🥈';
		case 3:
			return '🥉';
		default:
			return null;
	}
};

const getInitials = (name: string) => {
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
};

const formatNumber = (num: number) => {
	return num.toLocaleString('en-US');
};

export function LeaderboardTable({
	entries,
	currentUserId,
	showProfession = true,
}: LeaderboardTableProps) {
	if (entries.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
				<div className='text-4xl mb-3'>🏆</div>
				<h3 className='text-base font-semibold mb-1'>
					No Leaderboard Data
				</h3>
				<p className='text-sm text-muted-foreground'>
					Be the first to play and claim the top spot!
				</p>
			</div>
		);
	}

	return (
		<div className='w-full'>
			<div className='hidden md:block rounded-lg border bg-card overflow-hidden'>
				<Table>
					<TableHeader>
						<TableRow className='hover:bg-transparent'>
							<TableHead className='w-16 text-xs lg:text-sm'>
								Rank
							</TableHead>
							<TableHead className='text-xs lg:text-sm'>
								Player
							</TableHead>
							{showProfession && (
								<TableHead className='text-xs lg:text-sm'>
									Profession
								</TableHead>
							)}
							<TableHead className='text-right text-xs lg:text-sm'>
								Total Score
							</TableHead>
							<TableHead className='text-right text-xs lg:text-sm'>
								Games
							</TableHead>
							<TableHead className='text-right text-xs lg:text-sm'>
								Avg Score
							</TableHead>
							<TableHead className='text-right text-xs lg:text-sm'>
								Highest
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{entries.map((entry) => {
							const isCurrentUser =
								entry.userId === currentUserId;
							const rankBadge = getRankBadge(entry.rank);
							return (
								<TableRow
									key={entry.userId}
									className={cn(
										'transition-colors',
										isCurrentUser &&
											'bg-accent/50 hover:bg-accent/60'
									)}
								>
									<TableCell className='font-medium text-xs lg:text-sm'>
										<div className='flex items-center gap-1.5'>
											{rankBadge && (
												<span className='text-base lg:text-lg'>
													{rankBadge}
												</span>
											)}
											<span>{entry.rank}</span>
										</div>
									</TableCell>
									<TableCell>
										<div className='flex items-center gap-2.5'>
											<Avatar className='h-8 w-8 lg:h-9 lg:w-9'>
												<AvatarImage
													src={
														entry.userImage ||
														'/placeholder.svg'
													}
													alt={entry.userName}
												/>
												<AvatarFallback className='text-xs lg:text-sm'>
													{getInitials(
														entry.userName
													)}
												</AvatarFallback>
											</Avatar>
											<span className='font-medium text-xs lg:text-sm'>
												{entry.userName}
												{isCurrentUser && (
													<span className='text-muted-foreground ml-1.5'>
														(You)
													</span>
												)}
											</span>
										</div>
									</TableCell>
									{showProfession && (
										<TableCell>
											{entry.profession ? (
												<Badge
													variant='secondary'
													className='text-xs font-normal'
												>
													{entry.profession}
												</Badge>
											) : (
												<span className='text-xs text-muted-foreground'>
													N/A
												</span>
											)}
										</TableCell>
									)}
									<TableCell className='text-right font-semibold text-xs lg:text-sm'>
										{formatNumber(entry.totalScore)}
									</TableCell>
									<TableCell className='text-right text-xs lg:text-sm'>
										{formatNumber(entry.gamesPlayed)}
									</TableCell>
									<TableCell className='text-right text-xs lg:text-sm'>
										{formatNumber(
											Math.round(entry.averageScore)
										)}
									</TableCell>
									<TableCell className='text-right text-xs lg:text-sm'>
										{formatNumber(entry.highestScore)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
