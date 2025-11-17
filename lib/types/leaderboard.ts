import { Category, Difficulty, Sex } from '@prisma/client';

export type LeaderboardType =
	| 'all-time'
	| 'weekly'
	| 'monthly'
	| 'daily'
	| 'category'
	| 'difficulty';

export type LeaderboardTimeframe = 'all' | 'week' | 'month' | 'today';

export interface LeaderboardEntry {
	rank: number;
	userId: string;
	userName: string;
	userImage?: string;
	profession?: string;
	sex?: Sex;
	totalScore: number;
	gamesPlayed: number;
	averageScore: number;
	highestScore: number;
}

export interface LeaderboardFilters {
	timeframe?: LeaderboardTimeframe;
	category?: Category;
	difficulty?: Difficulty;
	sex?: Sex;
	profession?: string;
	limit?: number;
}

export interface LeaderboardData {
	type: LeaderboardType;
	entries: LeaderboardEntry[];
	totalPlayers: number;
	filters: LeaderboardFilters;
	userEntry?: LeaderboardEntry;
}

export interface DemographicBreakdown {
	bySex: {
		sex: Sex | 'UNKNOWN';
		count: number;
		averageScore: number;
		topPlayer: {
			name: string;
			score: number;
		} | null;
	}[];
	byProfession: {
		profession: string;
		count: number;
		averageScore: number;
		topPlayer: {
			name: string;
			score: number;
		} | null;
	}[];
	byCategory: {
		category: Category;
		count: number;
		averageScore: number;
		topPlayer: {
			name: string;
			score: number;
		} | null;
	}[];
	byDifficulty: {
		difficulty: Difficulty;
		count: number;
		averageScore: number;
		topPlayer: {
			name: string;
			score: number;
		} | null;
	}[];
}
