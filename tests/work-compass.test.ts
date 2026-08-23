import { describe, expect, it } from 'vitest';
import { calculateWorkCompass, workCompassQuestions } from '../src/lib/assessment/work-compass';

const answersByOptionIndex = (index: number) => Object.fromEntries(
	workCompassQuestions.map((question) => [question.id, question.options[index].id]),
);

describe('AI work compass scoring', () => {
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

	it('places the lowest answer path in the explorer stage', () => {
		const lowestAnswers = Object.fromEntries(
			workCompassQuestions.map((question) => [question.id, question.options.at(-1)?.id]),
		) as Record<string, string>;
		const result = calculateWorkCompass(lowestAnswers);

		expect(result.stage).toBe('explorer');
	});

	it('requires one answer for every question', () => {
		expect(() => calculateWorkCompass({})).toThrow('Missing answer');
	});
});
