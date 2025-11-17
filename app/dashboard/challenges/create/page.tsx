import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import {
	getAvailableOpponents,
	createChallenge,
} from '@/app/actions/challenge-actions';
import { ChallengeCreateForm } from '@/components/dashboard/challenges/challenge-create-form';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Category, Difficulty } from '@prisma/client';

export default async function CreateChallengePage() {
	const session = await auth();

	if (!session?.user) {
		redirect('/login');
	}

	const result = await getAvailableOpponents();

	if (!result.success || !result.data) {
		return (
			<div className='container py-6'>
				<Card>
					<CardHeader>
						<CardTitle>Error Loading Opponents</CardTitle>
						<CardDescription>
							{result.message ||
								'Failed to load available opponents'}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild>
							<Link href='/dashboard/challenges'>
								<ArrowLeft className='mr-2 h-4 w-4' />
								Back to Challenges
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const opponents = result.data;

	// Wrapper function to handle type conversion
	const handleCreateChallenge = async (data: {
		opponentId: string;
		questionCount: number;
		timeLimit: number;
		category?: string;
		difficulty?: string;
	}): Promise<{ success: boolean; error?: string }> => {
		const result = await createChallenge({
			opponentId: data.opponentId,
			questionCount: data.questionCount,
			timeLimit: data.timeLimit,
			category: data.category as Category | undefined,
			difficulty: data.difficulty as Difficulty | undefined,
		});

		if (result.success) {
			// Redirect to challenges page on success
			window.location.href = '/dashboard/challenges';
		}

		return {
			success: result.success,
			error: result.message,
		};
	};

	return (
		<div className='container max-w-4xl py-6 space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-4'>
				<Button
					variant='ghost'
					size='icon'
					asChild
				>
					<Link href='/dashboard/challenges'>
						<ArrowLeft className='h-4 w-4' />
					</Link>
				</Button>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>
						Create Challenge
					</h1>
					<p className='text-muted-foreground'>
						Challenge a friend to a trivia battle
					</p>
				</div>
			</div>

			{/* Create Form */}
			<Card>
				<CardHeader>
					<CardTitle>Challenge Details</CardTitle>
					<CardDescription>
						Select an opponent and configure your challenge
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ChallengeCreateForm
						opponents={opponents}
						onSubmit={handleCreateChallenge}
						onCancel={() => {
							window.location.href = '/dashboard/challenges';
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
