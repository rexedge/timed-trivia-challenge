// Type definitions for Daily Challenge system

import { Category, Difficulty } from '@prisma/client';

export type DailyChallengeStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED';

export interface DailyChallenge {
	id: string;
	date: Date;
	category: Category | null;
	difficulty: Difficulty | null;
	questionCount: number;
	timeLimit: number;
	status: DailyChallengeStatus;
	participantCount: number;
	hasParticipated: boolean;
	userScore?: number;
	userRank?: number;
}

export interface DailyChallengeParticipant {
	id: string;
	userId: string;
	userName: string;
	userProfession?: string;
	score: number;
	completedAt: Date;
	rank: number;
}

export interface DailyChallengeLeaderboard {
	challenge: DailyChallenge;
	participants: DailyChallengeParticipant[];
	totalParticipants: number;
	userParticipation?: DailyChallengeParticipant;
}
