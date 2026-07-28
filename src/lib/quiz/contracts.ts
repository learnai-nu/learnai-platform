import { z } from 'zod';

export const quizAnswerSchema = z.object({
	questionId: z.uuid(),
	selectedOptionIds: z.array(z.uuid()).max(20),
	freeTextAnswer: z.string().max(5000).nullable().optional(),
});

export const quizSubmissionSchema = z
	.object({
		quizId: z.uuid(),
		answers: z.array(quizAnswerSchema).max(100),
	})
	.superRefine(({ answers }, context) => {
		const questionIds = new Set<string>();
		for (const answer of answers) {
			if (questionIds.has(answer.questionId)) {
				context.addIssue({
					code: 'custom',
					message: 'Et spørgsmål må kun besvares én gang.',
					path: ['answers'],
				});
			}
			questionIds.add(answer.questionId);
		}
	});

const gradedQuestionSchema = z.object({
	question_id: z.uuid(),
	is_correct: z.boolean().nullable(),
	points_awarded: z.coerce.number().min(0),
	points_possible: z.coerce.number().min(0),
	explanation: z.string().nullable(),
});

export const quizResultSchema = z.object({
	attempt_id: z.uuid(),
	quiz_id: z.uuid(),
	score: z.coerce.number().min(0).max(100),
	passed: z.boolean(),
	passing_score: z.coerce.number().min(0).max(100),
	attempts_used: z.number().int().positive(),
	max_attempts: z.number().int().positive().nullable(),
	attempts_remaining: z.number().int().min(0).nullable(),
	questions: z.array(gradedQuestionSchema),
});

export type QuizSubmission = z.infer<typeof quizSubmissionSchema>;
export type QuizResult = z.infer<typeof quizResultSchema>;

export interface QuizOptionView {
	id: string;
	optionText: string;
}

export interface QuizQuestionView {
	id: string;
	type: 'single_choice' | 'multiple_choice' | 'true_false' | 'free_text';
	question: string;
	points: number;
	options: QuizOptionView[];
}

export interface QuizView {
	id: string;
	title: string;
	description: string | null;
	passingScore: number;
	maxAttempts: number | null;
	questions: QuizQuestionView[];
}

export function mapQuizRpcError(error: { code?: string; message?: string }) {
	const message = error.message ?? '';
	if (message.includes('MAX_ATTEMPTS_REACHED')) {
		return { status: 409, code: 'max_attempts', message: 'Du har brugt alle tilladte forsøg.' };
	}
	if (message.includes('QUIZ_NOT_ACCESSIBLE') || error.code === '42501') {
		return { status: 403, code: 'not_accessible', message: 'Du har ikke adgang til denne quiz.' };
	}
	if (
		error.code === '22023' ||
		message.includes('INVALID_') ||
		message.includes('DUPLICATE_') ||
		message.includes('NOT_IN_') ||
		message.includes('TOO_MANY_')
	) {
		return { status: 400, code: 'invalid_answers', message: 'Quizbesvarelsen er ugyldig.' };
	}
	return { status: 500, code: 'grading_failed', message: 'Quizzen kunne ikke bedømmes. Prøv igen.' };
}
