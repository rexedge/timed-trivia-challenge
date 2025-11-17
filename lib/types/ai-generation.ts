import { Category, Difficulty } from '@prisma/client';

// Request for generating AI questions
export interface GenerateQuestionsRequest {
	category: Category;
	difficulty: Difficulty;
	count: number; // Number of questions to generate
	topic?: string; // Optional specific topic within the category
	context?: string; // Optional additional context/constraints
}

// Single generated question before saving to DB
export interface GeneratedQuestion {
	id: string; // Temporary ID for tracking in UI
	questionText: string;
	category: Category;
	difficulty: Difficulty;
	options: {
		optionText: string;
		isCorrect: boolean;
	}[];
	explanation?: string; // AI-generated explanation for the answer
	topic?: string;
	aiMetadata: {
		model: string; // e.g., "gpt-4"
		generatedAt: string; // ISO date string
		prompt?: string; // The prompt used to generate
		confidence?: number; // AI confidence score if available
	};
}

// Response from AI generation
export interface GenerateQuestionsResponse {
	success: boolean;
	data?: {
		questions: GeneratedQuestion[];
		totalGenerated: number;
		model: string;
	};
	error?: string;
}

// Request for approving and saving questions
export interface ApproveQuestionsRequest {
	questions: {
		questionText: string;
		category: Category;
		difficulty: Difficulty;
		options: {
			optionText: string;
			isCorrect: boolean;
		}[];
		explanation?: string;
		aiMetadata: string; // JSON stringified metadata
	}[];
}

// Response from approving questions
export interface ApproveQuestionsResponse {
	success: boolean;
	data?: {
		savedCount: number;
		questionIds: string[];
	};
	error?: string;
}

// Status of an AI generation session
export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

// UI state for AI generation
export interface AIGenerationState {
	status: GenerationStatus;
	generatedQuestions: GeneratedQuestion[];
	selectedQuestions: string[]; // IDs of questions selected for approval
	error?: string;
}
