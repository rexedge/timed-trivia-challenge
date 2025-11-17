'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { UserRole, Category, Difficulty, QuestionSource } from '@prisma/client';

const questionSchema = z.object({
	text: z.string().min(1, 'Question text is required'),
	options: z.array(z.string()).min(2, 'At least two options are required'),
	correctAnswer: z.string().min(1, 'Correct answer is required'),
	category: z.nativeEnum(Category),
	difficulty: z.nativeEnum(Difficulty),
	source: z.nativeEnum(QuestionSource).optional(),
});

type ActionResponse = {
	success: boolean;
	message?: string;
	data?: any;
	errors?: Record<string, string>;
};

export async function createQuestion(
	data: z.infer<typeof questionSchema>
): Promise<ActionResponse> {
	try {
		const session = await auth();

		if (!session?.user) {
			return { success: false, message: 'Not authenticated' };
		}

		if (session.user.role !== UserRole.ADMIN) {
			return { success: false, message: 'Not authorized' };
		}

		// Validate data
		const validation = questionSchema.safeParse(data);
		if (!validation.success) {
			return {
				success: false,
				message: 'Invalid question data',
				// @ts-expect-error: zod types
				errors: validation.error.formErrors.fieldErrors,
			};
		}

		// Validate correct answer is in options
		if (!data.options.includes(data.correctAnswer)) {
			return {
				success: false,
				message: 'Correct answer must be one of the options',
				errors: { correctAnswer: 'Must be one of the options' },
			};
		}

		const question = await db.question.create({
			data: {
				text: data.text,
				options: JSON.stringify(data.options),
				correctAnswer: data.correctAnswer,
				category: data.category,
				difficulty: data.difficulty,
				source: data.source || QuestionSource.MANUAL,
			},
		});

		revalidatePath('/admin/questions');

		return {
			success: true,
			data: question,
		};
	} catch (error) {
		console.error('Error creating question:', error);
		return {
			success: false,
			message: 'Failed to create question',
		};
	}
}

export async function updateQuestion(
	id: string,
	data: z.infer<typeof questionSchema>
): Promise<ActionResponse> {
	try {
		const session = await auth();

		if (!session?.user) {
			return { success: false, message: 'Not authenticated' };
		}

		if (session.user.role !== UserRole.ADMIN) {
			return { success: false, message: 'Not authorized' };
		}

		// Validate data
		const validation = questionSchema.safeParse(data);
		if (!validation.success) {
			return {
				success: false,
				message: 'Invalid question data',
				// @ts-expect-error: zod types
				errors: validation.error.formErrors.fieldErrors,
			};
		}

		// Validate correct answer is in options
		if (!data.options.includes(data.correctAnswer)) {
			return {
				success: false,
				message: 'Correct answer must be one of the options',
				errors: { correctAnswer: 'Must be one of the options' },
			};
		}

		const question = await db.question.update({
			where: { id },
			data: {
				text: data.text,
				options: JSON.stringify(data.options),
				correctAnswer: data.correctAnswer,
				category: data.category,
				difficulty: data.difficulty,
				source: data.source,
			},
		});

		revalidatePath('/admin/questions');

		return {
			success: true,
			data: question,
		};
	} catch (error) {
		console.error('Error updating question:', error);
		return {
			success: false,
			message: 'Failed to update question',
		};
	}
}

export async function deleteQuestion(id: string): Promise<ActionResponse> {
	try {
		const session = await auth();

		if (!session?.user) {
			return { success: false, message: 'Not authenticated' };
		}

		if (session.user.role !== UserRole.ADMIN) {
			return { success: false, message: 'Not authorized' };
		}

		// Check if question is used in any games
		const usedInGames = await db.gameQuestion.findFirst({
			where: { questionId: id },
		});

		if (usedInGames) {
			return {
				success: false,
				message: 'Cannot delete question that is used in games',
			};
		}

		await db.question.delete({
			where: { id },
		});

		revalidatePath('/admin/questions');
		return { success: true };
	} catch (error) {
		console.error('Error deleting question:', error);
		return {
			success: false,
			message: 'Failed to delete question',
		};
	}
}

export async function getQuestion(id: string): Promise<ActionResponse> {
	try {
		const session = await auth();

		if (!session?.user) {
			return { success: false, message: 'Not authenticated' };
		}

		if (session.user.role !== UserRole.ADMIN) {
			return { success: false, message: 'Not authorized' };
		}

		const question = await db.question.findUnique({
			where: { id },
		});

		if (!question) {
			return {
				success: false,
				message: 'Question not found',
			};
		}

		return {
			success: true,
			data: question,
		};
	} catch (error) {
		console.error('Error fetching question:', error);
		return {
			success: false,
			message: 'Failed to fetch question',
		};
	}
}

export async function getQuestions(page = 1, limit = 10) {
	try {
		const [questions, total] = await Promise.all([
			db.question.findMany({
				take: limit,
				skip: (page - 1) * limit,
				orderBy: {
					createdAt: 'desc',
				},
			}),
			db.question.count(),
		]);

		return {
			success: true,
			data: {
				questions,
				pagination: {
					total,
					pages: Math.ceil(total / limit),
					page,
					limit,
				},
			},
		};
	} catch (error) {
		console.error('Error fetching questions:', error);
		return {
			success: false,
			message: 'Failed to fetch questions',
		};
	}
}

export async function uploadQuestions(
	questions: {
		text: string;
		options: string[];
		correctAnswer: string;
	}[]
): Promise<ActionResponse> {
	try {
		const session = await auth();

		if (!session?.user) {
			return { success: false, message: 'Not authenticated' };
		}

		if (session.user.role !== UserRole.ADMIN) {
			return { success: false, message: 'Not authorized' };
		}

		// Validate all questions
		for (const question of questions) {
			if (!question.text?.trim()) {
				return {
					success: false,
					message: 'All questions must have text',
				};
			}

			if (
				!Array.isArray(question.options) ||
				question.options.length < 2
			) {
				return {
					success: false,
					message: 'All questions must have at least two options',
				};
			}

			if (
				!question.correctAnswer ||
				!question.options.includes(question.correctAnswer)
			) {
				return {
					success: false,
					message: 'Correct answer must be one of the options',
				};
			}
		}

		// Create all questions
		await db.question.createMany({
			data: questions.map((q) => ({
				text: q.text,
				options: JSON.stringify(q.options),
				correctAnswer: q.correctAnswer,
			})),
		});

		revalidatePath('/admin/questions');
		return { success: true };
	} catch (error) {
		console.error('Error uploading questions:', error);
		return {
			success: false,
			message: 'Failed to upload questions',
		};
	}
}
