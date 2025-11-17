import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import {
	getActiveDailyChallenge,
	getPreviousDailyChallenges,
	createDailyChallengeGame,
	getDailyChallengeLeaderboard,
} from '@/app/actions/daily-challenge-actions';
import { DailyChallengeCard } from '@/components/dashboard/daily-challenge/daily-challenge-card';
import { DailyChallengeLeaderboard } from '@/components/dashboard/daily-challenge/daily-challenge-leaderboard';
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

export default async function DailyChallengePage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect('/login');
	}

	// Fetch active daily challenge
	const activeChallengeResult = await getActiveDailyChallenge();
	const previousChallengesResult = await getPreviousDailyChallenges(7);

	// Handle participation
	async function handleParticipate(challengeId: string) {
		'use server';
		const result = await createDailyChallengeGame(challengeId);
		if (result.success && result.data?.gameId) {
			redirect(
				`/dashboard/game/${result.data.gameId}?type=daily&challengeId=${result.data.challengeId}`
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
		const leaderboardResult = await getDailyChallengeLeaderboard(
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
					Daily Challenge
				</h1>
				<p className='text-muted-foreground'>
					Complete daily challenges and compete with players worldwide
				</p>
			</div>

			<Tabs
				defaultValue='today'
				className='space-y-6'
			>
				<TabsList>
					<TabsTrigger value='today'>Today's Challenge</TabsTrigger>
					<TabsTrigger value='history'>History</TabsTrigger>
					{activeLeaderboard && (
						<TabsTrigger value='leaderboard'>
							Leaderboard
						</TabsTrigger>
					)}
				</TabsList>

				{/* Today's Challenge Tab */}
				<TabsContent
					value='today'
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
									There is no active daily challenge at the
									moment. Check back later!
								</p>
							</CardContent>
						</Card>
					) : (
						<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
							<DailyChallengeCard
								challenge={{
									...activeChallengeResult.data,
									date: new Date(
										activeChallengeResult.data.date
									),
								}}
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
										Your recent daily challenge
										participation
									</CardDescription>
								</CardHeader>
							</Card>
							<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
								{previousChallengesResult.data.map(
									(challenge) => (
										<DailyChallengeCard
											key={challenge.id}
											challenge={{
												...challenge,
												date: new Date(challenge.date),
											}}
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
									You haven't participated in any daily
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
								<CardTitle>Today's Leaderboard</CardTitle>
								<CardDescription>
									Top {activeLeaderboard.participants.length}{' '}
									participants -{' '}
									{activeLeaderboard.totalParticipants.toLocaleString()}{' '}
									total
								</CardDescription>
							</CardHeader>
						</Card>
						<DailyChallengeLeaderboard
							participants={activeLeaderboard.participants}
							currentUserId={session.user.id}
						/>
					</TabsContent>
				)}
			</Tabs>
		</div>
	);
}
