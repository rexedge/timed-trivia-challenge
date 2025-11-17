'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Category, Difficulty, GameStatus, GameType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

/**
 * Generate a new weekly challenge
 * Admin only - creates a new weekly challenge for the current week
 */
export async function generateWeeklyChallenge(data: {
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
			throw new Error('Only admins can generate weekly challenges');
		}

		// Calculate week start (Monday) and end (Sunday)
		const now = new Date();
		const dayOfWeek = now.getDay();
		const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
		const weekStart = new Date(now);
		weekStart.setDate(now.getDate() + diffToMonday);
		weekStart.setHours(0, 0, 0, 0);

		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekStart.getDate() + 6);
		weekEnd.setHours(23, 59, 59, 999);

		// Check if a weekly challenge already exists for this week
		const existingChallenge = await db.weeklyChallenge.findFirst({
			where: {
				weekStart,
			},
		});

		if (existingChallenge) {
			throw new Error('A weekly challenge already exists for this week');
		}

		// Set default category and difficulty if not provided
		const category = data.category || Category.GENERAL_KNOWLEDGE;
		const difficulty = data.difficulty || Difficulty.MEDIUM;

		// Create the weekly challenge
		const weeklyChallenge = await db.weeklyChallenge.create({
			data: {
				weekStart,
				weekEnd,
				category,
				difficulty,
				questionCount: data.questionCount || 20,
				timeLimit: data.timeLimit || 45, // 45 seconds per question
			},
		});

		revalidatePath('/dashboard/weekly-challenge');
		revalidatePath('/admin/challenges');

		return { success: true, data: weeklyChallenge };
	} catch (error) {
		console.error('Error generating weekly challenge:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to generate weekly challenge',
		};
	}
}

/**
 * Get the active weekly challenge
 */
export async function getActiveWeeklyChallenge() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		// Calculate current week start
		const now = new Date();
		const dayOfWeek = now.getDay();
		const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
		const weekStart = new Date(now);
		weekStart.setDate(now.getDate() + diffToMonday);
		weekStart.setHours(0, 0, 0, 0);

		const weeklyChallenge = await db.weeklyChallenge.findFirst({
			where: {
				weekStart,
			},
			include: {
				_count: {
					select: { participations: true },
				},
			},
		});

		if (!weeklyChallenge) {
			return { success: true, data: null };
		}

		// Check if user has participated
		const participation = await db.weeklyChallengeParticipation.findFirst({
			where: {
				weeklyChallengeId: weeklyChallenge.id,
				userId: session.user.id,
			},
		});

		// Get user's rank if they participated
		let userRank: number | undefined;
		if (participation) {
			const higherScores = await db.weeklyChallengeParticipation.count({
				where: {
					weeklyChallengeId: weeklyChallenge.id,
					score: {
						gt: participation.score,
					},
				},
			});
			userRank = higherScores + 1;
		}

		// Get week number and year
		const startOfYear = new Date(weekStart.getFullYear(), 0, 1);
		const pastDaysOfYear =
			(weekStart.getTime() - startOfYear.getTime()) / 86400000;
		const weekNumber = Math.ceil(
			(pastDaysOfYear + startOfYear.getDay() + 1) / 7
		);

		return {
			success: true,
			data: {
				id: weeklyChallenge.id,
				weekNumber,
				year: weekStart.getFullYear(),
				startDate: weeklyChallenge.weekStart,
				endDate: weeklyChallenge.weekEnd,
				category: weeklyChallenge.category,
				difficulty: weeklyChallenge.difficulty,
				questionCount: weeklyChallenge.questionCount,
				timeLimit: weeklyChallenge.timeLimit,
				status: now > weeklyChallenge.weekEnd ? 'COMPLETED' : 'ACTIVE',
				participantCount: weeklyChallenge._count.participations,
				hasParticipated: !!participation,
				userScore: participation?.score,
				userRank,
			},
		};
	} catch (error) {
		console.error('Error getting active weekly challenge:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to get weekly challenge',
		};
	}
}

/**
 * Participate in the weekly challenge
 * Note: This just marks intent - actual score is recorded after game completion
 */
export async function participateInWeeklyChallenge(weeklyChallengeId: string) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		// Check if weekly challenge exists
		const weeklyChallenge = await db.weeklyChallenge.findUnique({
			where: { id: weeklyChallengeId },
		});

		if (!weeklyChallenge) {
			throw new Error('Weekly challenge not found');
		}

		// Check if challenge is still active
		const now = new Date();
		if (now > weeklyChallenge.weekEnd) {
			throw new Error('This weekly challenge has ended');
		}

		// Check if user already participated
		const existingParticipation =
			await db.weeklyChallengeParticipation.findFirst({
				where: {
					weeklyChallengeId,
					userId: session.user.id,
				},
			});

		if (existingParticipation) {
			throw new Error(
				'You have already participated in this weekly challenge'
			);
		}

		// Return challenge details for game creation (UI will handle creating the game)
		return {
			success: true,
			data: {
				challengeId: weeklyChallenge.id,
				category: weeklyChallenge.category,
				difficulty: weeklyChallenge.difficulty,
				questionCount: weeklyChallenge.questionCount,
				timeLimit: weeklyChallenge.timeLimit,
			},
		};
	} catch (error) {
		console.error('Error participating in weekly challenge:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to participate in weekly challenge',
		};
	}
}

/**
 * Record weekly challenge completion with score
 * Called after a WEEKLY game is completed
 */
export async function recordWeeklyChallengeScore(
	weeklyChallengeId: string,
	score: number
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		// Check if user already has a participation record
		const existingParticipation =
			await db.weeklyChallengeParticipation.findFirst({
				where: {
					weeklyChallengeId,
					userId: session.user.id,
				},
			});

		if (existingParticipation) {
			throw new Error('Score already recorded for this challenge');
		}

		// Create participation record with score
		await db.weeklyChallengeParticipation.create({
			data: {
				weeklyChallengeId,
				userId: session.user.id,
				score,
				completedAt: new Date(),
			},
		});

		revalidatePath('/dashboard/weekly-challenge');

		return { success: true };
	} catch (error) {
		console.error('Error recording weekly challenge score:', error);
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
 * Get weekly challenge leaderboard
 */
export async function getWeeklyChallengeLeaderboard(weeklyChallengeId: string) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		const weeklyChallenge = await db.weeklyChallenge.findUnique({
			where: { id: weeklyChallengeId },
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
		});

		if (!weeklyChallenge) {
			throw new Error('Weekly challenge not found');
		}

		// Get week number and year
		const startOfYear = new Date(
			weeklyChallenge.weekStart.getFullYear(),
			0,
			1
		);
		const pastDaysOfYear =
			(weeklyChallenge.weekStart.getTime() - startOfYear.getTime()) /
			86400000;
		const weekNumber = Math.ceil(
			(pastDaysOfYear + startOfYear.getDay() + 1) / 7
		);

		// Format leaderboard data
		const participants = weeklyChallenge.participations.map(
			(p: any, index: number) => ({
				id: p.id,
				userId: p.user.id,
				userName: p.user.name || 'Anonymous',
				userProfession: p.user.profession || undefined,
				score: p.score,
				completedAt: p.completedAt,
				rank: index + 1,
			})
		);

		// Find user's participation
		const userParticipation = participants.find(
			(p: any) => p.userId === session.user.id
		);

		const now = new Date();

		return {
			success: true,
			data: {
				challenge: {
					id: weeklyChallenge.id,
					weekNumber,
					year: weeklyChallenge.weekStart.getFullYear(),
					startDate: weeklyChallenge.weekStart,
					endDate: weeklyChallenge.weekEnd,
					category: weeklyChallenge.category,
					difficulty: weeklyChallenge.difficulty,
					questionCount: weeklyChallenge.questionCount,
					timeLimit: weeklyChallenge.timeLimit,
					status:
						now > weeklyChallenge.weekEnd ? 'COMPLETED' : 'ACTIVE',
					participantCount: weeklyChallenge._count.participations,
					hasParticipated: !!userParticipation,
					userScore: userParticipation?.score,
					userRank: userParticipation?.rank,
				},
				participants,
				totalParticipants: weeklyChallenge._count.participations,
				userParticipation,
			},
		};
	} catch (error) {
		console.error('Error getting weekly challenge leaderboard:', error);
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
 * Get previous weekly challenges (for history)
 */
export async function getPreviousWeeklyChallenges(limit: number = 4) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		// Calculate current week start
		const now = new Date();
		const dayOfWeek = now.getDay();
		const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
		const currentWeekStart = new Date(now);
		currentWeekStart.setDate(now.getDate() + diffToMonday);
		currentWeekStart.setHours(0, 0, 0, 0);

		const challenges = await db.weeklyChallenge.findMany({
			where: {
				weekStart: {
					lt: currentWeekStart,
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
				weekStart: 'desc',
			},
			take: limit,
		});

		const formattedChallenges = await Promise.all(
			challenges.map(async (challenge: any) => {
				const userParticipation = challenge.participations[0];
				let userRank: number | undefined;

				if (userParticipation) {
					const higherScores =
						await db.weeklyChallengeParticipation.count({
							where: {
								weeklyChallengeId: challenge.id,
								score: {
									gt: userParticipation.score,
								},
							},
						});
					userRank = higherScores + 1;
				}

				// Get week number and year
				const startOfYear = new Date(
					challenge.weekStart.getFullYear(),
					0,
					1
				);
				const pastDaysOfYear =
					(challenge.weekStart.getTime() - startOfYear.getTime()) /
					86400000;
				const weekNumber = Math.ceil(
					(pastDaysOfYear + startOfYear.getDay() + 1) / 7
				);

				return {
					id: challenge.id,
					weekNumber,
					year: challenge.weekStart.getFullYear(),
					startDate: challenge.weekStart,
					endDate: challenge.weekEnd,
					category: challenge.category,
					difficulty: challenge.difficulty,
					questionCount: challenge.questionCount,
					timeLimit: challenge.timeLimit,
					status: 'COMPLETED' as const,
					participantCount: challenge._count.participations,
					hasParticipated: !!userParticipation,
					userScore: userParticipation?.score,
					userRank,
				};
			})
		);

		return { success: true, data: formattedChallenges };
	} catch (error) {
		console.error('Error getting previous weekly challenges:', error);
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
 * Create a game for weekly challenge
 * This creates a Game record with questions for the user to play
 */
export async function createWeeklyChallengeGame(weeklyChallengeId: string) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		// Check if weekly challenge exists
		const weeklyChallenge = await db.weeklyChallenge.findUnique({
			where: { id: weeklyChallengeId },
		});

		if (!weeklyChallenge) {
			throw new Error('Weekly challenge not found');
		}

		// Check if challenge is still active
		const now = new Date();
		if (now > weeklyChallenge.weekEnd) {
			throw new Error('This weekly challenge has ended');
		}

		// Check if user already participated
		const existingParticipation =
			await db.weeklyChallengeParticipation.findFirst({
				where: {
					weeklyChallengeId,
					userId: session.user.id,
				},
			});

		if (existingParticipation) {
			throw new Error(
				'You have already participated in this weekly challenge'
			);
		}

		// Get questions based on challenge criteria
		const questionFilters: any = {};
		if (weeklyChallenge.category) {
			questionFilters.category = weeklyChallenge.category;
		}
		if (weeklyChallenge.difficulty) {
			questionFilters.difficulty = weeklyChallenge.difficulty;
		}

		const questions = await db.question.findMany({
			where: questionFilters,
			take: weeklyChallenge.questionCount,
			orderBy: {
				createdAt: 'desc',
			},
		});

		if (questions.length < weeklyChallenge.questionCount) {
			throw new Error(
				`Not enough questions available. Found ${questions.length}, need ${weeklyChallenge.questionCount}`
			);
		}

		// Create game
		const endTime = new Date(
			now.getTime() +
				weeklyChallenge.questionCount * weeklyChallenge.timeLimit * 1000
		);

		const game = await db.game.create({
			data: {
				gameType: GameType.WEEKLY,
				category: weeklyChallenge.category,
				difficulty: weeklyChallenge.difficulty,
				startTime: now,
				endTime: endTime,
				status: GameStatus.ACTIVE,
				answerTime: weeklyChallenge.timeLimit,
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
					duration: weeklyChallenge.timeLimit,
				},
			});

			// Next question displays after answer time + result time + interval time
			currentDisplayTime = new Date(
				currentDisplayTime.getTime() +
					(weeklyChallenge.timeLimit + 5 + 2) * 1000
			);
		}

		revalidatePath('/dashboard/weekly-challenge');

		return {
			success: true,
			data: { gameId: game.id, challengeId: weeklyChallengeId },
		};
	} catch (error) {
		console.error('Error creating weekly challenge game:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to create game',
		};
	}
}
