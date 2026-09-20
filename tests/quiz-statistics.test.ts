import { describe, expect, it } from 'vitest';
import { quizPassRate, quizStatisticsSchema } from '../src/lib/admin/quiz-statistics';

describe('quiz statistics', () => {
	it('distinguishes missing attempts from a zero pass rate', () => {
		expect(quizPassRate(0, 0)).toBeNull();
		expect(quizPassRate(3, 0)).toBe(0);
		expect(quizPassRate(4, 3)).toBe(0.75);
	});

	it('preserves zero scores and accepts empty results', () => {
		expect(quizStatisticsSchema.parse({ participants: 0, completed: 0, passed: 0, averageScore: null, quizzes: [] }).averageScore).toBeNull();
		expect(quizStatisticsSchema.parse({ participants: 1, completed: 1, passed: 0, averageScore: 0, quizzes: [] }).averageScore).toBe(0);
	});

	it('rejects invalid results instead of presenting zeroes', () => {
		expect(quizStatisticsSchema.safeParse(null).success).toBe(false);
		expect(quizStatisticsSchema.safeParse({ participants: -1, completed: 0, passed: 0, averageScore: 101, quizzes: [] }).success).toBe(false);
	});
});
