'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Category, Difficulty, Sex } from '@prisma/client';
import type {
	LeaderboardEntry,
	LeaderboardFilters,
	DemographicBreakdown,
} from '@/lib/types/leaderboard';

/**
 * Get all-time leaderboard
 */
export async function getAllTimeLeaderboard(filters: LeaderboardFilters = {}) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		const limit = filters.limit || 100;

		// Build date filter based on timeframe
		let dateFilter: any = {};
		if (filters.timeframe === 'today') {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			dateFilter = { gte: today };
		} else if (filters.timeframe === 'week') {
			const weekAgo = new Date();
			weekAgo.setDate(weekAgo.getDate() - 7);
			weekAgo.setHours(0, 0, 0, 0);
			dateFilter = { gte: weekAgo };
		} else if (filters.timeframe === 'month') {
			const monthAgo = new Date();
			monthAgo.setMonth(monthAgo.getMonth() - 1);
			monthAgo.setHours(0, 0, 0, 0);
			dateFilter = { gte: monthAgo };
		}

		// Build game filter
		const gameFilter: any = {};
		if (filters.category) {
			gameFilter.category = filters.category;
		}
		if (filters.difficulty) {
			gameFilter.difficulty = filters.difficulty;
		}

		// Build user filter
		const userFilter: any = {};
		if (filters.sex) {
			userFilter.sex = filters.sex;
		}
		if (filters.profession) {
			userFilter.profession = filters.profession;
		}

		// Get all responses with aggregations
		const responses = await db.response.groupBy({
			by: ['userId'],
			where: {
				...(Object.keys(dateFilter).length > 0 && {
					answeredAt: dateFilter,
				}),
				...(Object.keys(gameFilter).length > 0 && { game: gameFilter }),
				...(Object.keys(userFilter).length > 0 && { user: userFilter }),
			},
			_sum: {
				score: true,
			},
			_count: {
				id: true,
			},
			_max: {
				score: true,
			},
			orderBy: {
				_sum: {
					score: 'desc',
				},
			},
			take: limit,
		});

		// Get user details
		const userIds = responses.map((r) => r.userId);
		const users = await db.user.findMany({
			where: { id: { in: userIds } },
			select: {
				id: true,
				name: true,
				image: true,
				profession: true,
				sex: true,
			},
		});

		const userMap = new Map(users.map((u) => [u.id, u]));

		// Format leaderboard entries
		const entries: LeaderboardEntry[] = responses.map((response, index) => {
			const user = userMap.get(response.userId);
			return {
				rank: index + 1,
				userId: response.userId,
				userName: user?.name || 'Anonymous',
				userImage: user?.image || undefined,
				profession: user?.profession || undefined,
				sex: user?.sex || undefined,
				totalScore: response._sum.score || 0,
				gamesPlayed: response._count.id,
				averageScore: response._sum.score
					? response._sum.score / response._count.id
					: 0,
				highestScore: response._max.score || 0,
			};
		}); // Get total player count
		const totalPlayers = await db.user.count({
			where: {
				responses: {
					some: {
						...(Object.keys(dateFilter).length > 0 && {
							answeredAt: dateFilter,
						}),
						...(Object.keys(gameFilter).length > 0 && {
							game: gameFilter,
						}),
					},
				},
				...userFilter,
			},
		});

		// Find current user's entry
		const userEntry = entries.find((e) => e.userId === session.user.id);

		// If user not in top entries, get their rank
		let currentUserEntry = userEntry;
		if (!userEntry) {
			const userResponses = await db.response.groupBy({
				by: ['userId'],
				where: {
					userId: session.user.id,
					...(Object.keys(dateFilter).length > 0 && {
						answeredAt: dateFilter,
					}),
					...(Object.keys(gameFilter).length > 0 && {
						game: gameFilter,
					}),
				},
				_sum: {
					score: true,
				},
				_count: {
					id: true,
				},
				_max: {
					score: true,
				},
			});

			if (userResponses.length > 0) {
				const userScore = userResponses[0]._sum.score || 0;
				const higherScores = await db.response.groupBy({
					by: ['userId'],
					where: {
						...(Object.keys(dateFilter).length > 0 && {
							answeredAt: dateFilter,
						}),
						...(Object.keys(gameFilter).length > 0 && {
							game: gameFilter,
						}),
						...(Object.keys(userFilter).length > 0 && {
							user: userFilter,
						}),
					},
					_sum: {
						score: true,
					},
					having: {
						score: {
							_sum: {
								gt: userScore,
							},
						},
					},
				});

				const user = await db.user.findUnique({
					where: { id: session.user.id },
					select: {
						name: true,
						image: true,
						profession: true,
						sex: true,
					},
				});

				currentUserEntry = {
					rank: higherScores.length + 1,
					userId: session.user.id,
					userName: user?.name || 'Anonymous',
					userImage: user?.image || undefined,
					profession: user?.profession || undefined,
					sex: user?.sex || undefined,
					totalScore: userScore,
					gamesPlayed: userResponses[0]._count.id,
					averageScore: userScore / userResponses[0]._count.id,
					highestScore: userResponses[0]._max.score || 0,
				};
			}
		}

		return {
			success: true,
			data: {
				type: 'all-time' as const,
				entries,
				totalPlayers,
				filters,
				userEntry: currentUserEntry,
			},
		};
	} catch (error) {
		console.error('Error getting all-time leaderboard:', error);
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
 * Get demographic breakdown statistics
 */
export async function getDemographicBreakdown(
	filters: LeaderboardFilters = {}
): Promise<{ success: boolean; data?: DemographicBreakdown; error?: string }> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			throw new Error('Unauthorized');
		}

		// Build date filter
		let dateFilter: any = {};
		if (filters.timeframe === 'today') {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			dateFilter = { gte: today };
		} else if (filters.timeframe === 'week') {
			const weekAgo = new Date();
			weekAgo.setDate(weekAgo.getDate() - 7);
			dateFilter = { gte: weekAgo };
		} else if (filters.timeframe === 'month') {
			const monthAgo = new Date();
			monthAgo.setMonth(monthAgo.getMonth() - 1);
			dateFilter = { gte: monthAgo };
		}

		// Get breakdown by sex
		const sexBreakdown = await db.user.groupBy({
			by: ['sex'],
			where: {
				responses: {
					some: {
						...(Object.keys(dateFilter).length > 0 && {
							answeredAt: dateFilter,
						}),
					},
				},
			},
			_count: {
				id: true,
			},
		});

		const bySex = await Promise.all(
			sexBreakdown.map(async (item) => {
				const responses = await db.response.aggregate({
					where: {
						user: {
							sex: item.sex || undefined,
						},
						...(Object.keys(dateFilter).length > 0 && {
							answeredAt: dateFilter,
						}),
					},
					_avg: {
						score: true,
					},
				});

				const topPlayer = await db.response.findFirst({
					where: {
						user: {
							sex: item.sex || undefined,
						},
						...(Object.keys(dateFilter).length > 0 && {
							answeredAt: dateFilter,
						}),
					},
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
					orderBy: {
						score: 'desc',
					},
				});

				return {
					sex: (item.sex || 'UNKNOWN') as Sex | 'UNKNOWN',
					count: item._count.id,
					averageScore: responses._avg.score || 0,
					topPlayer: topPlayer
						? {
								name: topPlayer.user.name || 'Anonymous',
								score: topPlayer.score,
						  }
						: null,
				};
			})
		);

		// Get breakdown by profession
		const professionBreakdown = await db.user.groupBy({
			by: ['profession'],
			where: {
				profession: {
					not: null,
				},
				responses: {
					some: {
						...(Object.keys(dateFilter).length > 0 && {
							answeredAt: dateFilter,
						}),
					},
				},
			},
			_count: {
				id: true,
			},
			orderBy: {
				_count: {
					id: 'desc',
				},
			},
			take: 10,
		});

		const byProfession = await Promise.all(
			professionBreakdown.map(async (item) => {
				const responses = await db.response.aggregate({
					where: {
						user: {
							profession: item.profession,
						},
						...(Object.keys(dateFilter).length > 0 && {
							answeredAt: dateFilter,
						}),
					},
					_avg: {
						score: true,
					},
				});

				const topPlayer = await db.response.findFirst({
					where: {
						user: {
							profession: item.profession,
						},
						...(Object.keys(dateFilter).length > 0 && {
							answeredAt: dateFilter,
						}),
					},
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
					orderBy: {
						score: 'desc',
					},
				});

				return {
					profession: item.profession || 'Unknown',
					count: item._count.id,
					averageScore: responses._avg.score || 0,
					topPlayer: topPlayer
						? {
								name: topPlayer.user.name || 'Anonymous',
								score: topPlayer.score,
						  }
						: null,
				};
			})
		);

		// Get breakdown by category
		const categories = Object.values(Category);
		const byCategory = await Promise.all(
			categories.map(async (category) => {
				const count = await db.response.count({
					where: {
						game: {
							category,
						},
						...(Object.keys(dateFilter).length > 0 && {
							answeredAt: dateFilter,
						}),
					},
				});

				const responses = await db.response.aggregate({
					where: {
						game: {
							category,
						},
						...(Object.keys(dateFilter).length > 0 && {
							answeredAt: dateFilter,
						}),
					},
					_avg: {
						score: true,
					},
				});

				const topPlayer = await db.response.findFirst({
					where: {
						game: {
							category,
						},
						...(Object.keys(dateFilter).length > 0 && {
							answeredAt: dateFilter,
						}),
					},
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
					orderBy: {
						score: 'desc',
					},
				});

				return {
					category,
					count,
					averageScore: responses._avg.score || 0,
					topPlayer: topPlayer
						? {
								name: topPlayer.user.name || 'Anonymous',
								score: topPlayer.score,
						  }
						: null,
				};
			})
		);

		// Get breakdown by difficulty
		const difficulties = Object.values(Difficulty);
		const byDifficulty = await Promise.all(
			difficulties.map(async (difficulty) => {
				const count = await db.response.count({
					where: {
						game: {
							difficulty,
						},
						...(Object.keys(dateFilter).length > 0 && {
							answeredAt: dateFilter,
						}),
					},
				});

				const responses = await db.response.aggregate({
					where: {
						game: {
							difficulty,
						},
						...(Object.keys(dateFilter).length > 0 && {
							answeredAt: dateFilter,
						}),
					},
					_avg: {
						score: true,
					},
				});

				const topPlayer = await db.response.findFirst({
					where: {
						game: {
							difficulty,
						},
						...(Object.keys(dateFilter).length > 0 && {
							answeredAt: dateFilter,
						}),
					},
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
					orderBy: {
						score: 'desc',
					},
				});

				return {
					difficulty,
					count,
					averageScore: responses._avg.score || 0,
					topPlayer: topPlayer
						? {
								name: topPlayer.user.name || 'Anonymous',
								score: topPlayer.score,
						  }
						: null,
				};
			})
		);

		return {
			success: true,
			data: {
				bySex,
				byProfession,
				byCategory,
				byDifficulty,
			},
		};
	} catch (error) {
		console.error('Error getting demographic breakdown:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to get breakdown',
		};
	}
}
