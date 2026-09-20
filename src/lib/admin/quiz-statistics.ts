import { z } from 'zod';

const metrics = z.object({
	participants: z.number().int().nonnegative(),
	completed: z.number().int().nonnegative(),
	passed: z.number().int().nonnegative(),
	averageScore: z.number().min(0).max(100).nullable(),
});

export const quizStatisticsSchema = metrics.extend({
	quizzes: z.array(metrics.extend({
		// PostgreSQL also accepts imported UUIDs without RFC version/variant bits.
	id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
		title: z.string(),
		courseTitle: z.string(),
	})),
});

export function quizPassRate(completed: number, passed: number) {
	return completed === 0 ? null : passed / completed;
}
