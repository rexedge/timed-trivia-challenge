import OpenAI from 'openai';
import { Category, Difficulty } from '@prisma/client';
import type { GeneratedQuestion } from '@/lib/types/ai-generation';

// Initialize OpenAI client
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Category descriptions to help AI understand context
const CATEGORY_CONTEXTS: Record<Category, string> = {
	SCIENCE:
		'Scientific topics including biology, chemistry, physics, astronomy, and general science',
	HISTORY:
		'Historical events, figures, dates, and significant moments in world and regional history',
	GEOGRAPHY:
		'Countries, capitals, landmarks, physical geography, and world locations',
	SPORTS: 'Sports history, athletes, teams, championships, and sporting events',
	ENTERTAINMENT:
		'Movies, TV shows, music, celebrities, and entertainment industry',
	GENERAL_KNOWLEDGE:
		'Miscellaneous topics, current events, and general world knowledge',
	TECHNOLOGY:
		'Technology, computing, internet, gadgets, software, and tech industry',
	ARTS_LITERATURE:
		'Arts, literature, books, authors, paintings, sculpture, and cultural works',
	CURRENT_EVENTS:
		'Recent news, contemporary issues, and current world affairs',
};

// Difficulty level descriptions
const DIFFICULTY_CONTEXTS: Record<Difficulty, string> = {
	EASY: 'Basic knowledge that most people would know. Straightforward questions with obvious answers.',
	MEDIUM: 'Moderate difficulty requiring general knowledge or some specific familiarity with the topic.',
	HARD: 'Advanced questions requiring detailed knowledge or expertise in the subject area.',
	EXPERT: 'Very challenging questions requiring deep expertise, specialized knowledge, or obscure facts.',
};

/**
 * Generates trivia questions using OpenAI GPT
 */
export async function generateTriviaQuestions(params: {
	category: Category;
	difficulty: Difficulty;
	count: number;
	topic?: string;
	context?: string;
}): Promise<GeneratedQuestion[]> {
	const { category, difficulty, count, topic, context } = params;

	// Build the prompt
	const systemPrompt = `You are an expert trivia question generator. Generate high-quality, accurate, and engaging trivia questions.

Requirements:
- Generate exactly ${count} unique trivia questions
- Category: ${category} (${CATEGORY_CONTEXTS[category]})
- Difficulty: ${difficulty} (${DIFFICULTY_CONTEXTS[difficulty]})
${topic ? `- Specific topic: ${topic}` : ''}
${context ? `- Additional context: ${context}` : ''}

Format each question as JSON with this exact structure:
{
  "questionText": "The question text (clear and concise)",
  "options": [
    {"optionText": "Option 1", "isCorrect": false},
    {"optionText": "Option 2", "isCorrect": true},
    {"optionText": "Option 3", "isCorrect": false},
    {"optionText": "Option 4", "isCorrect": false}
  ],
  "explanation": "Brief explanation of why the correct answer is correct"
}

Rules:
1. Each question MUST have exactly 4 options
2. Exactly ONE option must be marked as correct
3. Options should be plausible but only one correct
4. Questions should be clear, grammatically correct, and unambiguous
5. Avoid overly obscure or trick questions
6. Ensure factual accuracy
7. Make questions engaging and educational

Return a JSON object with a "questions" array containing all the generated questions.
Example response format:
{
  "questions": [
    {
      "questionText": "...",
      "options": [...],
      "explanation": "..."
    }
  ]
}`;

	try {
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini', // Using GPT-4 for better quality
			messages: [
				{
					role: 'system',
					content: systemPrompt,
				},
				{
					role: 'user',
					content: `Generate ${count} trivia questions for ${category} at ${difficulty} difficulty level.`,
				},
			],
			temperature: 0.8, // Slightly creative but controlled
			response_format: { type: 'json_object' },
		});

		const responseText = completion.choices[0]?.message?.content;
		if (!responseText) {
			throw new Error('No response from OpenAI');
		}

		// Parse the response
		let parsedResponse;
		try {
			parsedResponse = JSON.parse(responseText);
		} catch (e) {
			console.error('Failed to parse OpenAI response:', responseText);
			throw new Error('Failed to parse OpenAI response as JSON');
		}

		// Extract questions array (handle different response formats)
		const questionsArray = parsedResponse.questions || parsedResponse;
		if (!Array.isArray(questionsArray)) {
			console.error('Invalid response format:', parsedResponse);
			throw new Error(
				`Response is not an array of questions. Got: ${typeof questionsArray}`
			);
		}

		// Validate and transform questions
		const generatedQuestions: GeneratedQuestion[] = questionsArray.map(
			(q, index) => {
				// Validate structure
				if (!q.questionText || !Array.isArray(q.options)) {
					throw new Error(
						`Invalid question structure at index ${index}`
					);
				}

				if (q.options.length !== 4) {
					throw new Error(
						`Question at index ${index} must have exactly 4 options`
					);
				}

				const correctCount = q.options.filter(
					(opt: any) => opt.isCorrect
				).length;
				if (correctCount !== 1) {
					throw new Error(
						`Question at index ${index} must have exactly 1 correct answer`
					);
				}

				return {
					id: `temp-${Date.now()}-${index}`,
					questionText: q.questionText,
					category,
					difficulty,
					options: q.options.map((opt: any) => ({
						optionText: opt.optionText,
						isCorrect: opt.isCorrect,
					})),
					explanation: q.explanation,
					topic,
					aiMetadata: {
						model: completion.model,
						generatedAt: new Date().toISOString(),
						prompt: systemPrompt,
						confidence: 0.9, // GPT-4 is generally high confidence
					},
				};
			}
		);

		return generatedQuestions;
	} catch (error) {
		if (error instanceof OpenAI.APIError) {
			throw new Error(`OpenAI API Error: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Validates a generated question meets all requirements
 */
export function validateGeneratedQuestion(question: GeneratedQuestion): {
	valid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!question.questionText || question.questionText.trim().length < 10) {
		errors.push('Question text is too short or empty');
	}

	if (!question.options || question.options.length !== 4) {
		errors.push('Must have exactly 4 options');
	} else {
		const correctCount = question.options.filter(
			(opt) => opt.isCorrect
		).length;
		if (correctCount !== 1) {
			errors.push('Must have exactly 1 correct answer');
		}

		question.options.forEach((opt, index) => {
			if (!opt.optionText || opt.optionText.trim().length < 1) {
				errors.push(`Option ${index + 1} is empty`);
			}
		});
	}

	if (!question.category || !question.difficulty) {
		errors.push('Category and difficulty are required');
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}
