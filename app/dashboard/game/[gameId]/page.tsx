import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getGameStatus } from '@/app/actions/game-actions';
import { recordDailyChallengeScore } from '@/app/actions/daily-challenge-actions';
import { recordWeeklyChallengeScore } from '@/app/actions/weekly-challenge-actions';
import { GameContainer } from '@/components/game/game-container';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function GamePage({
	params,
	searchParams,
}: {
	params: { gameId: string };
	searchParams: { type?: string; challengeId?: string };
}) {
	const session = await auth();

	if (!session) {
		redirect('/login');
	}

	const { gameId } = params;
	const { type, challengeId } = searchParams;

	// Get game status
	const statusResult = await getGameStatus(gameId);

	if (!statusResult.success) {
		redirect('/dashboard');
	}

	// Server action to handle game completion for daily challenges
	async function handleGameComplete(finalScore: number) {
		'use server';
		if (type === 'daily' && challengeId) {
			await recordDailyChallengeScore(challengeId, finalScore);
			redirect('/dashboard/daily-challenge');
		} else if (type === 'weekly' && challengeId) {
			await recordWeeklyChallengeScore(challengeId, finalScore);
			redirect('/dashboard/weekly-challenge');
		} else {
			redirect('/dashboard');
		}
	}

	return (
		<DashboardShell>
			<DashboardHeader
				heading={
					type === 'daily'
						? 'Daily Challenge'
						: type === 'weekly'
						? 'Weekly Challenge'
						: 'Current Game'
				}
				text='Answer questions and compete for the highest score!'
			/>
			<GameContainer
				gameId={gameId}
				userId={session.user.id}
				initialGameData={statusResult.data}
				onGameComplete={handleGameComplete}
			/>
		</DashboardShell>
	);
}
