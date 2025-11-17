'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Category, Difficulty, GameStatus, GameType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

/**
 * Generate a new daily challenge
 * Admin only - creates a new daily challenge for the current date
 */
export async function generateDailyChallenge(data: {
	category?: Category;
	difficulty?: Difficulty;
	questionCount?: number;
	timeLimit?: number;
}) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		// Check if user is admin
		const user = await db.user.findUnique({
			where: { id: session.user.id },
			select: { role: true },
		});

		if (user?.role !== 'ADMIN') {
			throw new Error('Only admins can generate daily challenges');
		}

		// Check if a daily challenge already exists for today
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const existingChallenge = await db.dailyChallenge.findFirst({
			where: {
				date: {
					gte: today,
					lt: tomorrow,
				},
			},
		});

		if (existingChallenge) {
			throw new Error('A daily challenge already exists for today');
		}

		// Create the daily challenge
		const dailyChallenge = await db.dailyChallenge.create({
			data: {
				date: today,
				category: data.category || Category.GENERAL_KNOWLEDGE,
				difficulty: data.difficulty || Difficulty.MEDIUM,
				questionCount: data.questionCount || 10,
				timeLimit: data.timeLimit || 30, // 30 seconds per question
			},
		});

		revalidatePath('/dashboard/daily-challenge');
		revalidatePath('/admin/challenges');

		return { success: true, data: dailyChallenge };
	} catch (error) {
		console.error('Error generating daily challenge:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to generate daily challenge',
		};
	}
}

/**
 * Get the active daily challenge
 */
export async function getActiveDailyChallenge() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const dailyChallenge = await db.dailyChallenge.findFirst({
			where: {
				date: {
					gte: today,
					lt: tomorrow,
				},
			},
			include: {
				_count: {
					select: { participations: true },
				},
			},
		});

		if (!dailyChallenge) {
			return { success: true, data: null };
		}

		// Check if user has participated
		const participation = await db.dailyChallengeParticipation.findFirst({
			where: {
				dailyChallengeId: dailyChallenge.id,
				userId: session.user.id,
			},
		});

		// Get user's rank if they participated
		let userRank: number | undefined;
		if (participation && participation.completedAt) {
			const higherScores = await db.dailyChallengeParticipation.count({
				where: {
					dailyChallengeId: dailyChallenge.id,
					score: {
						gt: participation.score || 0,
					},
				},
			});
			userRank = higherScores + 1;
		}

		return {
			success: true,
			data: {
				...dailyChallenge,
				participantCount: dailyChallenge._count.participations,
				hasParticipated: !!participation,
				userScore: participation?.score || undefined,
				userRank,
			},
		};
	} catch (error) {
		console.error('Error getting active daily challenge:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to get daily challenge',
		};
	}
}

/**
 * Participate in the daily challenge
 * Returns challenge details for the user to play
 */
export async function participateInDailyChallenge(dailyChallengeId: string) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		// Check if daily challenge exists
		const dailyChallenge = await db.dailyChallenge.findUnique({
			where: { id: dailyChallengeId },
		});

		if (!dailyChallenge) {
			throw new Error('Daily challenge not found');
		}

		// Check if user already participated
		const existingParticipation =
			await db.dailyChallengeParticipation.findFirst({
				where: {
					dailyChallengeId,
					userId: session.user.id,
				},
			});

		if (existingParticipation) {
			throw new Error(
				'You have already participated in this daily challenge'
			);
		}

		revalidatePath('/dashboard/daily-challenge');

		return {
			success: true,
			data: {
				challengeId: dailyChallengeId,
				category: dailyChallenge.category,
				difficulty: dailyChallenge.difficulty,
				questionCount: dailyChallenge.questionCount,
				timeLimit: dailyChallenge.timeLimit,
			},
		};
	} catch (error) {
		console.error('Error participating in daily challenge:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to participate in daily challenge',
		};
	}
}

/**
 * Record score for daily challenge participation
 */
export async function recordDailyChallengeScore(
	dailyChallengeId: string,
	score: number
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		// Check if daily challenge exists
		const dailyChallenge = await db.dailyChallenge.findUnique({
			where: { id: dailyChallengeId },
		});

		if (!dailyChallenge) {
			throw new Error('Daily challenge not found');
		}

		// Create or update participation record
		const participation = await db.dailyChallengeParticipation.upsert({
			where: {
				userId_dailyChallengeId: {
					userId: session.user.id,
					dailyChallengeId,
				},
			},
			create: {
				userId: session.user.id,
				dailyChallengeId,
				score,
			},
			update: {
				score,
				completedAt: new Date(),
			},
		});

		revalidatePath('/dashboard/daily-challenge');

		return { success: true, data: participation };
	} catch (error) {
		console.error('Error recording daily challenge score:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to record score',
		};
	}
}

/**
 * Get daily challenge leaderboard
 */
export async function getDailyChallengeLeaderboard(dailyChallengeId: string) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		const dailyChallenge = (await db.dailyChallenge.findUnique({
			where: { id: dailyChallengeId },
			include: {
				participations: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								profession: true,
							},
						},
					},
					orderBy: {
						score: 'desc',
					},
					take: 100, // Top 100 participants
				},
				_count: {
					select: { participations: true },
				},
			},
		})) as any;

		if (!dailyChallenge) {
			throw new Error('Daily challenge not found');
		}

		// Format leaderboard data
		const participants = dailyChallenge.participations.map(
			(p: any, index: number) => ({
				id: p.id,
				userId: p.user.id,
				userName: p.user.name || 'Anonymous',
				userProfession: p.user.profession || undefined,
				score: p.score || 0,
				completedAt: p.completedAt || new Date(),
				rank: index + 1,
			})
		);

		// Find user's participation
		const userParticipation = participants.find(
			(p: any) => p.userId === session.user.id
		);

		return {
			success: true,
			data: {
				challenge: {
					id: dailyChallenge.id,
					date: dailyChallenge.date,
					category: dailyChallenge.category,
					difficulty: dailyChallenge.difficulty,
					questionCount: dailyChallenge.questionCount,
					timeLimit: dailyChallenge.timeLimit,
					participantCount: dailyChallenge._count.participations,
				},
				participants,
				totalParticipants: dailyChallenge._count.participations,
				userParticipation,
			},
		};
	} catch (error) {
		console.error('Error getting daily challenge leaderboard:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to get leaderboard',
		};
	}
}

/**
 * Get previous daily challenges (for history)
 */
export async function getPreviousDailyChallenges(limit: number = 7) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const challenges = (await db.dailyChallenge.findMany({
			where: {
				date: {
					lt: today,
				},
			},
			include: {
				_count: {
					select: { participations: true },
				},
				participations: {
					where: {
						userId: session.user.id,
					},
				},
			},
			orderBy: {
				date: 'desc',
			},
			take: limit,
		})) as any[];

		const formattedChallenges = await Promise.all(
			challenges.map(async (challenge) => {
				const userParticipation = challenge.participations[0];
				let userRank: number | undefined;

				if (userParticipation?.completedAt) {
					const higherScores =
						await db.dailyChallengeParticipation.count({
							where: {
								dailyChallengeId: challenge.id,
								score: {
									gt: userParticipation.score || 0,
								},
							},
						});
					userRank = higherScores + 1;
				}

				return {
					id: challenge.id,
					date: challenge.date,
					category: challenge.category,
					difficulty: challenge.difficulty,
					questionCount: challenge.questionCount,
					timeLimit: challenge.timeLimit,
					participantCount: challenge._count.participations,
					hasParticipated: !!userParticipation,
					userScore: userParticipation?.score || undefined,
					userRank,
				};
			})
		);

		return { success: true, data: formattedChallenges };
	} catch (error) {
		console.error('Error getting previous daily challenges:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to get previous challenges',
		};
	}
}

/**
 * Create a game for daily challenge
 * This creates a Game record with questions for the user to play
 */
export async function createDailyChallengeGame(dailyChallengeId: string) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		// Check if daily challenge exists
		const dailyChallenge = await db.dailyChallenge.findUnique({
			where: { id: dailyChallengeId },
		});

		if (!dailyChallenge) {
			throw new Error('Daily challenge not found');
		}

		// Check if user already participated
		const existingParticipation =
			await db.dailyChallengeParticipation.findFirst({
				where: {
					dailyChallengeId,
					userId: session.user.id,
				},
			});

		if (existingParticipation) {
			throw new Error(
				'You have already participated in this daily challenge'
			);
		}

		// Get questions based on challenge criteria
		const questionFilters: any = {};
		if (dailyChallenge.category) {
			questionFilters.category = dailyChallenge.category;
		}
		if (dailyChallenge.difficulty) {
			questionFilters.difficulty = dailyChallenge.difficulty;
		}

		const questions = await db.question.findMany({
			where: questionFilters,
			take: dailyChallenge.questionCount,
			orderBy: {
				createdAt: 'desc',
			},
		});

		if (questions.length < dailyChallenge.questionCount) {
			throw new Error(
				`Not enough questions available. Found ${questions.length}, need ${dailyChallenge.questionCount}`
			);
		}

		// Create game
		const now = new Date();
		const endTime = new Date(
			now.getTime() +
				dailyChallenge.questionCount * dailyChallenge.timeLimit * 1000
		);

		const game = await db.game.create({
			data: {
				gameType: GameType.DAILY,
				category: dailyChallenge.category,
				difficulty: dailyChallenge.difficulty,
				startTime: now,
				endTime: endTime,
				status: GameStatus.ACTIVE,
				answerTime: dailyChallenge.timeLimit,
				resultTime: 5, // 5 seconds to show result
				intervalTime: 2, // 2 seconds between questions
			},
		});

		// Create game questions with display times
		let currentDisplayTime = now;
		for (let i = 0; i < questions.length; i++) {
			await db.gameQuestion.create({
				data: {
					gameId: game.id,
					questionId: questions[i].id,
					displayTime: currentDisplayTime,
					duration: dailyChallenge.timeLimit,
				},
			});

			// Next question displays after answer time + result time + interval time
			currentDisplayTime = new Date(
				currentDisplayTime.getTime() +
					(dailyChallenge.timeLimit + 5 + 2) * 1000
			);
		}

		revalidatePath('/dashboard/daily-challenge');

		return {
			success: true,
			data: { gameId: game.id, challengeId: dailyChallengeId },
		};
	} catch (error) {
		console.error('Error creating daily challenge game:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to create game',
		};
	}
}
