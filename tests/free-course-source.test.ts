import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
	new URL('../supabase/migrations/20260731231349_align_free_course_with_rettelsespakke_v2.sql', import.meta.url),
	'utf8',
);
const landingPage = readFileSync(new URL('../src/pages/kurser/ai-i-arbejdet.astro', import.meta.url), 'utf8');

describe('Rettelsespakke v2 course alignment', () => {
	it('preserves every existing lesson identity while replacing the editorial content', () => {
		for (const lessonId of [
			'c650d0a0-62b1-4af2-be1a-ed5c16042bdc',
			'6aa2c93a-e7b5-4019-a360-0ee4449ec572',
			'ddcb7b10-e68e-403d-bcff-cc155b964807',
			'05aee99b-a99f-4ac9-92a9-5a81b69a5770',
			'703d7841-2c4b-4547-8c5f-504088686de8',
			'854dd459-c182-4797-ac6e-a67d1a59aa66',
		]) {
			expect(migration).toContain(lessonId);
		}
	});

	it('uses the source course framework and safe lead promise', () => {
		expect(migration).toContain('Quick win: Få styr på en lang mailtråd');
		expect(migration).toContain('De fire byggesten i en brugbar prompt');
		expect(migration).toContain('De tre kontrolvaner – og dit næste skridt');
		expect(migration).toContain('Klar til at spare 2–5 timer om ugen?');
		expect(migration).not.toContain('26 lektioner');
	});

	it('positions the waitlist as the four-week flagship course', () => {
		expect(landingPage).toContain('AI som dit daglige værktøj');
		expect(landingPage).toContain('2–5 timer om ugen');
		expect(landingPage).toContain('tre bonuslektioner og to live-workshops');
		expect(landingPage).not.toContain('Niveau 2');
	});
});
