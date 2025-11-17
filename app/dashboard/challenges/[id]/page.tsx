import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getChallengeById } from '@/app/actions/challenge-actions';
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

export default async function ChallengePage({
	params,
}: {
	params: { id: string };
}) {
	const session = await auth();

	if (!session?.user) {
		redirect('/login');
	}

	const result = await getChallengeById(params.id);

	if (!result.success || !result.data) {
		return (
			<div className='container py-6'>
				<Card>
					<CardHeader>
						<CardTitle>Challenge Not Found</CardTitle>
						<CardDescription>
							{result.message ||
								'This challenge does not exist or you do not have access to it'}
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

	const challenge = result.data;

	// If challenge has a game, redirect to the game page
	if (challenge.gameId) {
		redirect(`/dashboard/game/${challenge.gameId}`);
	}

	// If no game yet, show challenge details
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
						Challenge Details
					</h1>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Challenge Information</CardTitle>
					<CardDescription>
						This challenge is waiting to be started
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div>
						<p className='text-sm text-muted-foreground'>Status</p>
						<p className='text-lg font-medium'>
							{challenge.status}
						</p>
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>
							Opponent
						</p>
						<p className='text-lg font-medium'>
							{challenge.challenger?.name ||
								challenge.opponent?.name}
						</p>
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>
							Question Count
						</p>
						<p className='text-lg font-medium'>
							{challenge.questionCount} questions
						</p>
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>
							Time Limit
						</p>
						<p className='text-lg font-medium'>
							{challenge.timeLimit} seconds per question
						</p>
					</div>
					{challenge.category && (
						<div>
							<p className='text-sm text-muted-foreground'>
								Category
							</p>
							<p className='text-lg font-medium'>
								{challenge.category}
							</p>
						</div>
					)}
					{challenge.difficulty && (
						<div>
							<p className='text-sm text-muted-foreground'>
								Difficulty
							</p>
							<p className='text-lg font-medium'>
								{challenge.difficulty}
							</p>
						</div>
					)}
					<Button
						asChild
						className='w-full'
					>
						<Link href='/dashboard/challenges'>
							Back to Challenges
						</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
