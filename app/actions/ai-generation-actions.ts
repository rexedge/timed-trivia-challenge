'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import {
	generateTriviaQuestions,
	validateGeneratedQuestion,
} from '@/lib/ai/question-generator';
import type {
	GenerateQuestionsRequest,
	GenerateQuestionsResponse,
	ApproveQuestionsRequest,
	ApproveQuestionsResponse,
} from '@/lib/types/ai-generation';
import { QuestionSource } from '@prisma/client';

/**
 * Generate trivia questions using AI (Admin only)
 */
export async function generateQuestions(
	request: GenerateQuestionsRequest
): Promise<GenerateQuestionsResponse> {
	try {
		// Authenticate and check admin role
		const session = await auth();
		if (!session?.user) {
			return { success: false, error: 'Unauthorized' };
		}

		// Check if user is admin
		const user = await db.user.findUnique({
			where: { id: session.user.id },
			select: { role: true },
		});

		if (user?.role !== 'ADMIN') {
			return { success: false, error: 'Admin access required' };
		}

		// Validate request
		if (!request.category || !request.difficulty) {
			return {
				success: false,
				error: 'Category and difficulty are required',
			};
		}

		if (request.count < 1 || request.count > 20) {
			return { success: false, error: 'Count must be between 1 and 20' };
		}

		// Check for OpenAI API key
		if (!process.env.OPENAI_API_KEY) {
			return {
				success: false,
				error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.',
			};
		}

		// Generate questions using AI
		const questions = await generateTriviaQuestions({
			category: request.category,
			difficulty: request.difficulty,
			count: request.count,
			topic: request.topic,
			context: request.context,
		});

		// Validate all generated questions
		const validationErrors: string[] = [];
		questions.forEach((q, index) => {
			const validation = validateGeneratedQuestion(q);
			if (!validation.valid) {
				validationErrors.push(
					`Question ${index + 1}: ${validation.errors.join(', ')}`
				);
			}
		});

		if (validationErrors.length > 0) {
			return {
				success: false,
				error: `Generated questions validation failed: ${validationErrors.join(
					'; '
				)}`,
			};
		}

		return {
			success: true,
			data: {
				questions,
				totalGenerated: questions.length,
				model: questions[0]?.aiMetadata?.model || 'gpt-4',
			},
		};
	} catch (error) {
		console.error('Error generating questions:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to generate questions',
		};
	}
}

/**
 * Approve and save AI-generated questions to the database (Admin only)
 */
export async function approveGeneratedQuestions(
	request: ApproveQuestionsRequest
): Promise<ApproveQuestionsResponse> {
	try {
		// Authenticate and check admin role
		const session = await auth();
		if (!session?.user) {
			return { success: false, error: 'Unauthorized' };
		}

		// Check if user is admin
		const user = await db.user.findUnique({
			where: { id: session.user.id },
			select: { id: true, role: true },
		});

		if (user?.role !== 'ADMIN') {
			return { success: false, error: 'Admin access required' };
		}

		// Validate request
		if (!request.questions || request.questions.length === 0) {
			return { success: false, error: 'No questions provided' };
		}

		// Save questions to database
		const savedQuestions = await db.$transaction(
			request.questions.map((q) =>
				db.question.create({
					data: {
						text: q.questionText,
						category: q.category,
						difficulty: q.difficulty,
						options: JSON.stringify(q.options), // Store as JSON string
						correctAnswer:
							q.options.find((opt) => opt.isCorrect)
								?.optionText || '',
						source: QuestionSource.AI_GENERATED,
						aiMetadata: q.aiMetadata, // Store as JSON string
					},
					select: {
						id: true,
					},
				})
			)
		);

		return {
			success: true,
			data: {
				savedCount: savedQuestions.length,
				questionIds: savedQuestions.map((q) => q.id),
			},
		};
	} catch (error) {
		console.error('Error approving questions:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to save questions',
		};
	}
}

/**
 * Get statistics about AI-generated questions (Admin only)
 */
export async function getAIGenerationStats() {
	try {
		// Authenticate and check admin role
		const session = await auth();
		if (!session?.user) {
			return { success: false, error: 'Unauthorized' };
		}

		// Check if user is admin
		const user = await db.user.findUnique({
			where: { id: session.user.id },
			select: { role: true },
		});

		if (user?.role !== 'ADMIN') {
			return { success: false, error: 'Admin access required' };
		}

		// Get counts
		const [totalAIQuestions, totalManualQuestions, recentAIQuestions] =
			await Promise.all([
				db.question.count({
					where: { source: QuestionSource.AI_GENERATED },
				}),
				db.question.count({
					where: { source: QuestionSource.MANUAL },
				}),
				db.question.findMany({
					where: { source: QuestionSource.AI_GENERATED },
					take: 10,
					orderBy: { createdAt: 'desc' },
					select: {
						id: true,
						text: true,
						category: true,
						difficulty: true,
						createdAt: true,
						aiMetadata: true,
					},
				}),
			]);

		return {
			success: true,
			data: {
				totalAIQuestions,
				totalManualQuestions,
				totalQuestions: totalAIQuestions + totalManualQuestions,
				aiPercentage: Math.round(
					(totalAIQuestions /
						(totalAIQuestions + totalManualQuestions || 1)) *
						100
				),
				recentAIQuestions,
			},
		};
	} catch (error) {
		console.error('Error getting AI stats:', error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to get statistics',
		};
	}
}
