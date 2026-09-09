import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
	new URL('../supabase/migrations/20260909051145_build_ai_for_leaders_course.sql', import.meta.url),
	'utf8',
);
const coursePage = readFileSync(new URL('../src/pages/kurser/[slug].astro', import.meta.url), 'utf8');
const pricingMigration = readFileSync(
	new URL('../supabase/migrations/20260909184649_add_course_intro_pricing.sql', import.meta.url),
	'utf8',
);

describe('AI for ledere course source', () => {
	it('creates a hidden editorial course instead of publishing it', () => {
		expect(migration).toContain("'ai-for-ledere'");
		expect(migration).toContain("'review'::public.content_status");
		expect(migration).toContain('published_at');
		expect(migration).toMatch(/false,\s*null\s*\)/);
	});

	it('contains nine valid lesson bodies and one coherent 170-minute journey', () => {
		const bodies = [...migration.matchAll(/\$json\$\s*([\s\S]*?)\s*\$json\$::jsonb/g)].map((match) =>
			JSON.parse(match[1]!),
		);
		expect(bodies).toHaveLength(9);
		for (const body of bodies) {
			expect(body.format).toBe('blocks');
			expect(body.blocks.length).toBeGreaterThanOrEqual(6);
		}
		expect(migration).toContain("'AI for ledere – fra personlig praksis til teamledelse'");
		expect(migration).toMatch(/'intermediate'::public\.course_level,\s*170,/);
	});

	it('includes a 12-question scenario quiz with four answer options per question', () => {
		const questionIds = new Set(
			[...migration.matchAll(/learnai:ai-for-ledere:question:(\d+)/g)].map((match) => match[1]),
		);
		const optionIds = new Set(
			[...migration.matchAll(/learnai:ai-for-ledere:q\d+:o\d+/g)].map((match) => match[0]),
		);
		expect(questionIds.size).toBe(12);
		expect(optionIds.size).toBe(48);
		expect(migration).toContain('Answer keys stay isolated in quiz_option_keys');
	});

	it('gives the generic course page a leadership-specific promise', () => {
		expect(coursePage).toContain("const isLeadershipCourse = course.slug === 'ai-for-ledere'");
		expect(coursePage).toContain('En afprøvet AI-arbejdsgang til din egen lederhverdag.');
		expect(coursePage).toContain("const courseKicker = isLeadershipCourse ? 'Praktisk lederkursus'");
	});

	it('sets a 995 DKK normal price and a 50 percent intro offer for 50 seats', () => {
		expect(pricingMigration).toContain('price_dkk = 995');
		expect(pricingMigration).toContain('intro_price_dkk = 497.50');
		expect(pricingMigration).toContain('intro_seat_limit = 50');
		expect(coursePage).toContain('Intropris · 50 % rabat');
		expect(coursePage).toContain('Gælder de første {course.intro_seat_limit} pladser');
	});
});
