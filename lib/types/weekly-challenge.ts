// Type definitions for Weekly Challenge system

import { Category, Difficulty } from '@prisma/client';

export type WeeklyChallengeStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED';

export interface WeeklyChallenge {
	id: string;
	weekNumber: number;
	year: number;
	startDate: Date;
	endDate: Date;
	category: Category | null;
	difficulty: Difficulty | null;
	questionCount: number;
	timeLimit: number;
	status: WeeklyChallengeStatus;
	participantCount: number;
	hasParticipated: boolean;
	userScore?: number;
	userRank?: number;
}

export interface WeeklyChallengeParticipant {
	id: string;
	userId: string;
	userName: string;
	userProfession?: string;
	score: number;
	completedAt: Date;
	rank: number;
}

export interface WeeklyChallengeLeaderboard {
	challenge: WeeklyChallenge;
	participants: WeeklyChallengeParticipant[];
	totalParticipants: number;
	userParticipation?: WeeklyChallengeParticipant;
}
