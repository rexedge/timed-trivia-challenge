import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import {
	getActiveWeeklyChallenge,
	getPreviousWeeklyChallenges,
	createWeeklyChallengeGame,
	getWeeklyChallengeLeaderboard,
} from '@/app/actions/weekly-challenge-actions';
import { WeeklyChallengeCard } from '@/components/dashboard/weekly-challenge-card';
import { WeeklyChallengeLeaderboard } from '@/components/dashboard/weekly-challenge/weekly-challenge-leaderboard';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default async function WeeklyChallengePage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect('/login');
	}

	// Fetch active weekly challenge
	const activeChallengeResult = await getActiveWeeklyChallenge();
	const previousChallengesResult = await getPreviousWeeklyChallenges(4);

	// Handle participation
	async function handleParticipate(challengeId: string) {
		'use server';
		const result = await createWeeklyChallengeGame(challengeId);
		if (result.success && result.data?.gameId) {
			redirect(
				`/dashboard/game/${result.data.gameId}?type=weekly&challengeId=${result.data.challengeId}`
			);
		}
	}

	// Handle view leaderboard
	async function handleViewLeaderboard(challengeId: string) {
		'use server';
		// This will be handled by the Tabs component
		return challengeId;
	}

	// Get active challenge leaderboard if exists
	let activeLeaderboard = null;
	if (activeChallengeResult.success && activeChallengeResult.data) {
		const leaderboardResult = await getWeeklyChallengeLeaderboard(
			activeChallengeResult.data.id
		);
		if (leaderboardResult.success && leaderboardResult.data) {
			activeLeaderboard = leaderboardResult.data;
		}
	}

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold tracking-tight'>
					Weekly Challenge
				</h1>
				<p className='text-muted-foreground'>
					Complete weekly challenges and compete for the top spot
				</p>
			</div>

			<Tabs
				defaultValue='this-week'
				className='space-y-6'
			>
				<TabsList>
					<TabsTrigger value='this-week'>
						This Week's Challenge
					</TabsTrigger>
					<TabsTrigger value='history'>History</TabsTrigger>
					{activeLeaderboard && (
						<TabsTrigger value='leaderboard'>
							Leaderboard
						</TabsTrigger>
					)}
				</TabsList>

				{/* This Week's Challenge Tab */}
				<TabsContent
					value='this-week'
					className='space-y-4'
				>
					{!activeChallengeResult.success ? (
						<Alert variant='destructive'>
							<AlertCircle className='h-4 w-4' />
							<AlertDescription>
								{activeChallengeResult.error}
							</AlertDescription>
						</Alert>
					) : !activeChallengeResult.data ? (
						<Card>
							<CardContent className='flex flex-col items-center justify-center py-12 text-center'>
								<AlertCircle className='h-12 w-12 text-muted-foreground mb-4' />
								<h3 className='font-semibold text-lg mb-1'>
									No Active Challenge
								</h3>
								<p className='text-muted-foreground text-sm max-w-sm'>
									There is no active weekly challenge at the
									moment. Check back later!
								</p>
							</CardContent>
						</Card>
					) : (
						<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
							<WeeklyChallengeCard
								challenge={activeChallengeResult.data}
								onParticipate={handleParticipate}
								onViewLeaderboard={handleViewLeaderboard}
							/>
						</div>
					)}
				</TabsContent>

				{/* History Tab */}
				<TabsContent
					value='history'
					className='space-y-4'
				>
					{!previousChallengesResult.success ? (
						<Alert variant='destructive'>
							<AlertCircle className='h-4 w-4' />
							<AlertDescription>
								{previousChallengesResult.error}
							</AlertDescription>
						</Alert>
					) : previousChallengesResult.data &&
					  previousChallengesResult.data.length > 0 ? (
						<>
							<Card>
								<CardHeader>
									<CardTitle>Previous Challenges</CardTitle>
									<CardDescription>
										Your recent weekly challenge
										participation
									</CardDescription>
								</CardHeader>
							</Card>
							<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
								{previousChallengesResult.data.map(
									(challenge) => (
										<WeeklyChallengeCard
											key={challenge.id}
											challenge={challenge}
											onParticipate={handleParticipate}
											onViewLeaderboard={
												handleViewLeaderboard
											}
										/>
									)
								)}
							</div>
						</>
					) : (
						<Card>
							<CardContent className='flex flex-col items-center justify-center py-12 text-center'>
								<AlertCircle className='h-12 w-12 text-muted-foreground mb-4' />
								<h3 className='font-semibold text-lg mb-1'>
									No Previous Challenges
								</h3>
								<p className='text-muted-foreground text-sm max-w-sm'>
									You haven't participated in any weekly
									challenges yet
								</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Leaderboard Tab */}
				{activeLeaderboard && (
					<TabsContent
						value='leaderboard'
						className='space-y-4'
					>
						<Card>
							<CardHeader>
								<CardTitle>This Week's Leaderboard</CardTitle>
								<CardDescription>
									Top {activeLeaderboard.participants.length}{' '}
									participants -{' '}
									{activeLeaderboard.challenge.participantCount.toLocaleString()}{' '}
									total
								</CardDescription>
							</CardHeader>
						</Card>
						<WeeklyChallengeLeaderboard
							participants={activeLeaderboard.participants}
							currentUserId={session.user.id}
						/>
					</TabsContent>
				)}
			</Tabs>
		</div>
	);
}
