import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { summariseLatestWeek, trackCountWord, type WeeklyNewsRow } from '../src/lib/content/weekly-news';

function row(year: number, week: number, category: string, extra: Partial<WeeklyNewsRow> = {}): WeeklyNewsRow {
	return {
		title: `Uge ${week} ${category}`,
		slug: `uge-${week}-${category}`,
		excerpt: `Kort om ${category}`,
		source_key: `learnai-weekly:${year}:${week}:da:${category}`,
		source_metadata: { period: `Periode uge ${week}`, category: category === 'marketing' ? 'Marketing' : undefined },
		...extra,
	};
}

describe('"Denne uge" from the database', () => {
	it('picks the newest week and orders its tracks like the weekly package', () => {
		const digest = summariseLatestWeek([
			row(2026, 40, 'business'),
			row(2026, 43, 'business'),
			row(2026, 43, 'marketing'),
			row(2026, 43, 'headlines-and-launches'),
		]);
		expect(digest).toMatchObject({ year: 2026, week: 43, period: 'Periode uge 43' });
		expect(digest?.topics.map((topic) => topic.href)).toEqual([
			'/laer/uge-43-headlines-and-launches',
			'/laer/uge-43-marketing',
			'/laer/uge-43-business',
		]);
		expect(digest?.topics[1].label).toBe('Marketing');
		expect(digest?.topics[0].label).toBe('Headlines & launches');
	});

	it('treats a new year as newer than a higher week number', () => {
		expect(summariseLatestWeek([row(2026, 52, 'business'), row(2027, 1, 'business')])?.year).toBe(2027);
	});

	it('ignores items that are not Danish weekly news and returns null without any', () => {
		expect(summariseLatestWeek([
			row(2026, 44, 'business', { source_key: 'learnai-weekly:2026:44:en:business' }),
			row(2026, 44, 'business', { source_key: null }),
		])).toBeNull();
	});

	it('shows at most four tracks', () => {
		const rows = ['headlines-and-launches', 'deep-dives-and-analysis', 'marketing', 'business', 'education'].map((c) => row(2026, 44, c));
		expect(summariseLatestWeek(rows)?.topics).toHaveLength(4);
		expect(trackCountWord(4)).toBe('fire');
	});

	it('falls back to the episode file when the database has nothing newer', () => {
		const component = readFileSync(new URL('../src/components/marketing/ThisWeek.astro', import.meta.url), 'utf8');
		expect(component).toContain("summariseLatestWeek(");
		expect(component).toContain('digest.week >= episode.week');
		expect(component).toContain(': episode.topics');
	});
});
