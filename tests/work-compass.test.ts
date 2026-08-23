import { describe, expect, it } from 'vitest';
import { calculateWorkCompass, workCompassQuestions } from '../src/lib/assessment/work-compass';

const answersByOptionIndex = (index: number) => Object.fromEntries(
	workCompassQuestions.map((question) => [question.id, question.options[index].id]),
);

describe('AI work compass scoring', () => {
	it('uses 12 balanced questions with four for each dimension', () => {
		expect(workCompassQuestions).toHaveLength(12);
		expect(workCompassQuestions.filter((question) => question.dimension === 'understanding')).toHaveLength(4);
		expect(workCompassQuestions.filter((question) => question.dimension === 'practice')).toHaveLength(4);
		expect(workCompassQuestions.filter((question) => question.dimension === 'adoption')).toHaveLength(4);
		expect(new Set(workCompassQuestions.map((question) => question.id)).size).toBe(12);
	});

	it('returns bounded dimension and overall scores', () => {
		const result = calculateWorkCompass(answersByOptionIndex(0));

		expect(Object.values(result.dimensions).every((value) => value >= 0 && value <= 100)).toBe(true);
		expect(result.overall).toBeGreaterThanOrEqual(0);
		expect(result.overall).toBeLessThanOrEqual(100);
	});

	it('places the strongest answer path in the orchestrator stage', () => {
		const result = calculateWorkCompass(answersByOptionIndex(0));

		expect(result.stage).toBe('orchestrator');
		expect(result.overall).toBeGreaterThanOrEqual(67);
	});

	it('places the lowest answer path in the starter stage', () => {
		const lowestAnswers = Object.fromEntries(
			workCompassQuestions.map((question) => [question.id, question.options.at(-1)?.id]),
		) as Record<string, string>;
		const result = calculateWorkCompass(lowestAnswers);

		expect(result.stage).toBe('starter');
		expect(result.overall).toBe(0);
	});

	it('scores each direction independently', () => {
		const answers = Object.fromEntries(workCompassQuestions.map((question) => [
			question.id,
			question.options[question.dimension === 'understanding' ? 0 : 3].id,
		]));
		const result = calculateWorkCompass(answers);

		expect(result.dimensions).toEqual({ understanding: 100, practice: 0, adoption: 0 });
		expect(result.strongestDimension).toBe('understanding');
		expect(result.growthDimension).toBe('adoption');
	});

	it('keeps strength and growth distinct when all scores are tied', () => {
		const result = calculateWorkCompass(answersByOptionIndex(0));

		expect(result.strongestDimension).toBe('understanding');
		expect(result.growthDimension).toBe('adoption');
	});

	it('requires one answer for every question', () => {
		expect(() => calculateWorkCompass({})).toThrow('Missing answer');
	});
});
