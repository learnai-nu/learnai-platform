import { describe, expect, it } from 'vitest';
import {
	mapQuizRpcError,
	quizResultSchema,
	quizSubmissionSchema,
} from '../src/lib/quiz/contracts';

const quizId = '7da53b88-d25f-4432-addb-32f3c83274ae';
const questionId = 'bde3975d-db2e-4b2a-847f-83326711b13c';
const optionId = '7dcb1fb1-9b1c-44b6-882b-163e1b93614a';

describe('quiz submission contract', () => {
	it('accepterer en gyldig besvarelse', () => {
		const result = quizSubmissionSchema.safeParse({
			quizId,
			answers: [{ questionId, selectedOptionIds: [optionId], freeTextAnswer: null }],
		});
		expect(result.success).toBe(true);
	});

	it('afviser dublerede spørgsmål', () => {
		const answer = { questionId, selectedOptionIds: [optionId], freeTextAnswer: null };
		const result = quizSubmissionSchema.safeParse({ quizId, answers: [answer, answer] });
		expect(result.success).toBe(false);
	});

	it('afviser ugyldige id-værdier og for lang fritekst', () => {
		const result = quizSubmissionSchema.safeParse({
			quizId: 'ikke-en-uuid',
			answers: [{ questionId, selectedOptionIds: [], freeTextAnswer: 'x'.repeat(5001) }],
		});
		expect(result.success).toBe(false);
	});
});

describe('quiz result contract', () => {
	it('returnerer kun det dokumenterede resultat og fjerner eventuelle facitfelter', () => {
		const parsed = quizResultSchema.parse({
			attempt_id: '75468a2e-1d65-4aee-9b17-bbb1373e6eed',
			quiz_id: quizId,
			score: 100,
			passed: true,
			passing_score: 67,
			attempts_used: 1,
			max_attempts: null,
			attempts_remaining: null,
			questions: [{
				question_id: questionId,
				is_correct: true,
				points_awarded: 1,
				points_possible: 1,
				explanation: 'Forklaring',
				correct_option_ids: [optionId],
			}],
		});

		expect(parsed.questions[0]).not.toHaveProperty('correct_option_ids');
	});

	it('oversætter max_attempts-fejl til en konfliktrespons', () => {
		expect(mapQuizRpcError({ code: 'P0001', message: 'MAX_ATTEMPTS_REACHED' })).toEqual({
			status: 409,
			code: 'max_attempts',
			message: 'Du har brugt alle tilladte forsøg.',
		});
	});
});
