import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getChallenges } from '@/app/actions/challenge-actions';
import { ChallengeList } from '@/components/dashboard/challenges/challenge-list';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { Challenge } from '@/lib/types/challenge';

export default async function ChallengesPage() {
	const session = await auth();

	if (!session?.user) {
		redirect('/login');
	}

	const result = await getChallenges();

	if (!result.success || !result.data) {
		return (
			<div className='container py-6'>
				<Card>
					<CardHeader>
						<CardTitle>Error Loading Challenges</CardTitle>
						<CardDescription>
							{result.message || 'Failed to load challenges'}
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	const { pending, sent, active, completed, declined } = result.data;

	// Convert dates from strings to Date objects
	const convertChallengeDates = (challenges: any[]): Challenge[] => {
		return challenges.map((challenge) => ({
			...challenge,
			expiresAt: new Date(challenge.expiresAt),
			createdAt: new Date(challenge.createdAt),
		}));
	};

	const pendingChallenges = convertChallengeDates(pending);
	const sentChallenges = convertChallengeDates(sent);
	const activeChallenges = convertChallengeDates(active);
	const completedChallenges = convertChallengeDates(completed);
	const declinedChallenges = convertChallengeDates(declined);

	return (
		<div className='container py-6 space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>
						My Challenges
					</h1>
					<p className='text-muted-foreground'>
						Challenge friends and compete in trivia battles
					</p>
				</div>
				<Button asChild>
					<Link href='/dashboard/challenges/create'>
						<Plus className='mr-2 h-4 w-4' />
						New Challenge
					</Link>
				</Button>
			</div>

			{/* Tabs */}
			<Tabs
				defaultValue='pending'
				className='space-y-4'
			>
				<TabsList>
					<TabsTrigger
						value='pending'
						className='relative'
					>
						Pending
						{pendingChallenges.length > 0 && (
							<Badge
								variant='secondary'
								className='ml-2 rounded-full px-1.5 py-0.5 text-xs'
							>
								{pendingChallenges.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger
						value='sent'
						className='relative'
					>
						Sent
						{sentChallenges.length > 0 && (
							<Badge
								variant='secondary'
								className='ml-2 rounded-full px-1.5 py-0.5 text-xs'
							>
								{sentChallenges.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger
						value='active'
						className='relative'
					>
						Active
						{activeChallenges.length > 0 && (
							<Badge
								variant='secondary'
								className='ml-2 rounded-full px-1.5 py-0.5 text-xs'
							>
								{activeChallenges.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value='completed'>Completed</TabsTrigger>
					<TabsTrigger value='declined'>Declined</TabsTrigger>
				</TabsList>

				{/* Pending Challenges */}
				<TabsContent
					value='pending'
					className='space-y-4'
				>
					<Card>
						<CardHeader>
							<CardTitle>Pending Challenges</CardTitle>
							<CardDescription>
								Challenges you&apos;ve received that are waiting
								for your response
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ChallengeList challenges={pendingChallenges} />
						</CardContent>
					</Card>
				</TabsContent>

				{/* Sent Challenges */}
				<TabsContent
					value='sent'
					className='space-y-4'
				>
					<Card>
						<CardHeader>
							<CardTitle>Sent Challenges</CardTitle>
							<CardDescription>
								Challenges you&apos;ve sent that are waiting for
								a response
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ChallengeList challenges={sentChallenges} />
						</CardContent>
					</Card>
				</TabsContent>

				{/* Active Challenges */}
				<TabsContent
					value='active'
					className='space-y-4'
				>
					<Card>
						<CardHeader>
							<CardTitle>Active Challenges</CardTitle>
							<CardDescription>
								Challenges that have been accepted and are ready
								to play
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ChallengeList challenges={activeChallenges} />
						</CardContent>
					</Card>
				</TabsContent>

				{/* Completed Challenges */}
				<TabsContent
					value='completed'
					className='space-y-4'
				>
					<Card>
						<CardHeader>
							<CardTitle>Completed Challenges</CardTitle>
							<CardDescription>
								Challenges that have been completed
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ChallengeList challenges={completedChallenges} />
						</CardContent>
					</Card>
				</TabsContent>

				{/* Declined Challenges */}
				<TabsContent
					value='declined'
					className='space-y-4'
				>
					<Card>
						<CardHeader>
							<CardTitle>Declined Challenges</CardTitle>
							<CardDescription>
								Challenges that were declined
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ChallengeList challenges={declinedChallenges} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
