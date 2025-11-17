// Challenge types for the trivia app

export type ChallengeStatus =
	| 'PENDING'
	| 'ACCEPTED'
	| 'IN_PROGRESS'
	| 'COMPLETED'
	| 'DECLINED';

export type ChallengeCategory =
	| 'SCIENCE'
	| 'HISTORY'
	| 'GEOGRAPHY'
	| 'SPORTS'
	| 'ENTERTAINMENT'
	| 'ARTS'
	| 'TECHNOLOGY'
	| 'LITERATURE'
	| 'GENERAL_KNOWLEDGE';

export type ChallengeDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export interface ChallengeOpponent {
	id: string;
	name: string;
	profession?: string;
}

export interface Challenge {
	id: string;
	opponent: ChallengeOpponent;
	questionCount: number;
	timeLimit: number;
	category?: ChallengeCategory;
	difficulty?: ChallengeDifficulty;
	status: ChallengeStatus;
	expiresAt: Date;
	createdAt: Date;
	isSender: boolean; // true if current user sent the challenge
}

export interface ChallengeCardProps {
	challenge: Challenge;
	onAccept?: (challengeId: string) => void;
	onDecline?: (challengeId: string) => void;
	onCancel?: (challengeId: string) => void;
	onStart?: (challengeId: string) => void;
	onContinue?: (challengeId: string) => void;
	onViewResults?: (challengeId: string) => void;
}

export interface ChallengeListProps {
	challenges: Challenge[];
	isLoading?: boolean;
	onAccept?: (challengeId: string) => void;
	onDecline?: (challengeId: string) => void;
	onCancel?: (challengeId: string) => void;
	onStart?: (challengeId: string) => void;
	onContinue?: (challengeId: string) => void;
	onViewResults?: (challengeId: string) => void;
}
