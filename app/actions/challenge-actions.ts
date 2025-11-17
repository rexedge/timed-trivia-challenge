'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { ChallengeStatus, Category, Difficulty } from '@prisma/client';

type ActionResponse = {
	success: boolean;
	message?: string;
	data?: any;
	errors?: Record<string, string>;
};

export async function createChallenge(data: {
	opponentId: string;
	category?: Category;
	difficulty?: Difficulty;
	questionCount: number;
	timeLimit: number;
}): Promise<ActionResponse> {
	try {
		const session = await auth();

		if (!session?.user) {
			return { success: false, message: 'Not authenticated' };
		}

		// Validate inputs
		if (data.questionCount < 1 || data.questionCount > 20) {
			return {
				success: false,
				message: 'Question count must be between 1 and 20',
			};
		}

		if (data.timeLimit < 30 || data.timeLimit > 600) {
			return {
				success: false,
				message: 'Time limit must be between 30 and 600 seconds',
			};
		}

		// Check if challenging self
		if (session.user.id === data.opponentId) {
			return { success: false, message: 'You cannot challenge yourself' };
		}

		// Check if opponent exists
		const opponent = await db.user.findUnique({
			where: { id: data.opponentId },
		});

		if (!opponent) {
			return { success: false, message: 'Opponent not found' };
		}

		// Check for existing pending challenge between these users
		const existingChallenge = await db.challenge.findFirst({
			where: {
				OR: [
					{
						challengerId: session.user.id,
						opponentId: data.opponentId,
						status: ChallengeStatus.PENDING,
					},
					{
						challengerId: data.opponentId,
						opponentId: session.user.id,
						status: ChallengeStatus.PENDING,
					},
				],
			},
		});

		if (existingChallenge) {
			return {
				success: false,
				message:
					'There is already a pending challenge between you and this player',
			};
		}

		// Get random questions based on filters
		const whereClause: any = {};
		if (data.category) {
			whereClause.category = data.category;
		}
		if (data.difficulty) {
			whereClause.difficulty = data.difficulty;
		}

		const availableQuestions = await db.question.findMany({
			where: whereClause,
			select: { id: true },
		});

		if (availableQuestions.length < data.questionCount) {
			return {
				success: false,
				message: `Not enough questions available. Found ${availableQuestions.length}, need ${data.questionCount}`,
			};
		}

		// Shuffle and select questions
		const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
		const selectedQuestions = shuffled.slice(0, data.questionCount);

		// Create a game for this challenge (type ONE_ON_ONE)
		const startTime = new Date();
		const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours to complete

		const game = await db.game.create({
			data: {
				gameType: 'ONE_ON_ONE',
				startTime,
				endTime,
				status: 'SCHEDULED',
				category: data.category,
				difficulty: data.difficulty,
				answerTime: data.timeLimit,
				resultTime: 5,
				intervalTime: 2,
			},
		});

		// Create game questions
		const gameQuestions = selectedQuestions.map((q, index) => ({
			gameId: game.id,
			questionId: q.id,
			displayTime: new Date(
				startTime.getTime() + index * (data.timeLimit + 7) * 1000
			),
			duration: data.timeLimit,
		}));

		await db.gameQuestion.createMany({
			data: gameQuestions,
		});

		// Create challenge (expires in 7 days)
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);

		const challenge = await db.challenge.create({
			data: {
				challengerId: session.user.id,
				opponentId: data.opponentId,
				gameId: game.id,
				status: ChallengeStatus.PENDING,
				category: data.category,
				difficulty: data.difficulty,
				questionCount: data.questionCount,
				timeLimit: data.timeLimit,
				expiresAt,
			},
			include: {
				challenger: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				opponent: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
			},
		});

		revalidatePath('/dashboard/challenges');
		return { success: true, data: challenge };
	} catch (error) {
		console.error('Error creating challenge:', error);
		return {
			success: false,
			message: 'Failed to create challenge',
		};
	}
}

export async function acceptChallenge(
	challengeId: string
): Promise<ActionResponse> {
	try {
		const session = await auth();

		if (!session?.user) {
			return { success: false, message: 'Not authenticated' };
		}

		const challenge = await db.challenge.findUnique({
			where: { id: challengeId },
			include: { game: true },
		});

		if (!challenge) {
			return { success: false, message: 'Challenge not found' };
		}

		if (challenge.opponentId !== session.user.id) {
			return {
				success: false,
				message: 'You are not the opponent of this challenge',
			};
		}

		if (challenge.status !== ChallengeStatus.PENDING) {
			return {
				success: false,
				message: 'Challenge is no longer pending',
			};
		}

		// Update challenge status
		const updatedChallenge = await db.challenge.update({
			where: { id: challengeId },
			data: {
				status: ChallengeStatus.ACCEPTED,
			},
		});

		// Update game status to ACTIVE
		if (challenge.gameId) {
			await db.game.update({
				where: { id: challenge.gameId },
				data: { status: 'ACTIVE' },
			});
		}

		revalidatePath('/dashboard/challenges');
		return { success: true, data: updatedChallenge };
	} catch (error) {
		console.error('Error accepting challenge:', error);
		return {
			success: false,
			message: 'Failed to accept challenge',
		};
	}
}

export async function declineChallenge(
	challengeId: string
): Promise<ActionResponse> {
	try {
		const session = await auth();

		if (!session?.user) {
			return { success: false, message: 'Not authenticated' };
		}

		const challenge = await db.challenge.findUnique({
			where: { id: challengeId },
		});

		if (!challenge) {
			return { success: false, message: 'Challenge not found' };
		}

		if (challenge.opponentId !== session.user.id) {
			return {
				success: false,
				message: 'You are not the opponent of this challenge',
			};
		}

		if (challenge.status !== ChallengeStatus.PENDING) {
			return {
				success: false,
				message: 'Challenge is no longer pending',
			};
		}

		// Update challenge status
		const updatedChallenge = await db.challenge.update({
			where: { id: challengeId },
			data: {
				status: ChallengeStatus.DECLINED,
			},
		});

		// Update game status to CANCELLED
		if (challenge.gameId) {
			await db.game.update({
				where: { id: challenge.gameId },
				data: { status: 'CANCELLED' },
			});
		}

		revalidatePath('/dashboard/challenges');
		return { success: true, data: updatedChallenge };
	} catch (error) {
		console.error('Error declining challenge:', error);
		return {
			success: false,
			message: 'Failed to decline challenge',
		};
	}
}

export async function getChallenges(): Promise<ActionResponse> {
	try {
		const session = await auth();

		if (!session?.user) {
			return { success: false, message: 'Not authenticated' };
		}

		const challenges = await db.challenge.findMany({
			where: {
				OR: [
					{ challengerId: session.user.id },
					{ opponentId: session.user.id },
				],
			},
			include: {
				challenger: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				opponent: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				game: {
					include: {
						_count: {
							select: {
								responses: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		// Separate into different categories
		const pending = challenges.filter(
			(c) =>
				c.status === ChallengeStatus.PENDING &&
				c.opponentId === session.user.id
		);
		const sent = challenges.filter(
			(c) =>
				c.status === ChallengeStatus.PENDING &&
				c.challengerId === session.user.id
		);
		const active = challenges.filter(
			(c) => c.status === ChallengeStatus.ACCEPTED
		);
		const completed = challenges.filter(
			(c) => c.status === ChallengeStatus.COMPLETED
		);
		const declined = challenges.filter(
			(c) => c.status === ChallengeStatus.DECLINED
		);

		return {
			success: true,
			data: {
				pending,
				sent,
				active,
				completed,
				declined,
				all: challenges,
			},
		};
	} catch (error) {
		console.error('Error getting challenges:', error);
		return {
			success: false,
			message: 'Failed to get challenges',
		};
	}
}

export async function getChallengeById(
	challengeId: string
): Promise<ActionResponse> {
	try {
		const session = await auth();

		if (!session?.user) {
			return { success: false, message: 'Not authenticated' };
		}

		// First, get basic challenge info to use in the query
		const basicChallenge = await db.challenge.findUnique({
			where: { id: challengeId },
			select: {
				challengerId: true,
				opponentId: true,
			},
		});

		if (!basicChallenge) {
			return { success: false, message: 'Challenge not found' };
		}

		// Now get the full challenge with all relations
		const challenge = await db.challenge.findUnique({
			where: { id: challengeId },
			include: {
				challenger: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				opponent: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				game: {
					include: {
						gameQuestions: {
							include: {
								question: true,
								responses: {
									where: {
										OR: [
											{
												userId: basicChallenge.challengerId,
											},
											{
												userId: basicChallenge.opponentId,
											},
										],
									},
									include: {
										user: {
											select: {
												id: true,
												name: true,
												image: true,
											},
										},
									},
								},
							},
							orderBy: {
								displayTime: 'asc',
							},
						},
						responses: {
							where: {
								OR: [
									{ userId: basicChallenge.challengerId },
									{ userId: basicChallenge.opponentId },
								],
							},
						},
					},
				},
			},
		});

		if (!challenge) {
			return { success: false, message: 'Challenge not found' };
		}

		// Check if user is part of this challenge
		if (
			challenge.challengerId !== session.user.id &&
			challenge.opponentId !== session.user.id
		) {
			return {
				success: false,
				message: 'You are not part of this challenge',
			};
		}

		// Calculate scores
		const challengerScore = challenge.game
			? challenge.game.responses
					.filter((r: any) => r.userId === challenge.challengerId)
					.reduce((sum: number, r: any) => sum + r.score, 0) || 0
			: 0;

		const opponentScore = challenge.game
			? challenge.game.responses
					.filter((r: any) => r.userId === challenge.opponentId)
					.reduce((sum: number, r: any) => sum + r.score, 0) || 0
			: 0;

		return {
			success: true,
			data: {
				challenge,
				scores: {
					challenger: challengerScore,
					opponent: opponentScore,
				},
			},
		};
	} catch (error) {
		console.error('Error getting challenge:', error);
		return {
			success: false,
			message: 'Failed to get challenge',
		};
	}
}

export async function getAvailableOpponents(): Promise<ActionResponse> {
	try {
		const session = await auth();

		if (!session?.user) {
			return { success: false, message: 'Not authenticated' };
		}

		// Get all users except the current user (and who have phoneNumber)
		const users = await db.user.findMany({
			where: {
				id: {
					not: session.user.id,
				},
				phoneNumber: {
					not: null,
				},
			},
			select: {
				id: true,
				name: true,
				image: true,
				profession: true,
			},
			orderBy: {
				name: 'asc',
			},
		});

		return {
			success: true,
			data: users,
		};
	} catch (error) {
		console.error('Error getting available opponents:', error);
		return {
			success: false,
			message: 'Failed to get available opponents',
		};
	}
}
