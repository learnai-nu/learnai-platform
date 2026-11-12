/**
 * "Denne uge" from the database: the newest published week of the weekly
 * news package, so the section no longer depends on a hand-edited file.
 *
 * Weekly items carry a source key like `learnai-weekly:2026:43:da:business`
 * (see scripts/prepare-weekly-news-import.mjs); the key decides the week and
 * the category, the metadata only adds the period and a readable label.
 */

export interface WeeklyNewsRow {
	title: string;
	slug: string;
	excerpt: string | null;
	source_key: string | null;
	source_metadata: unknown;
}

export interface WeeklyDigestTopic {
	label: string;
	title: string;
	text: string;
	href: string;
}

export interface WeeklyDigest {
	year: number;
	week: number;
	period: string | null;
	topics: WeeklyDigestTopic[];
}

const WEEKLY_SOURCE_KEY = /^learnai-weekly:(\d{4}):(\d{1,2}):da:([a-z0-9-]+)$/;

/** The order the weekly package uses; unknown categories go last. */
const CATEGORY_ORDER = ['headlines-and-launches', 'deep-dives-and-analysis', 'marketing', 'business', 'education'];

/** The homepage grid is designed for four tracks. */
const MAX_TOPICS = 4;

function metadataText(metadata: unknown, key: string) {
	if (!metadata || typeof metadata !== 'object') return null;
	const value = (metadata as Record<string, unknown>)[key];
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function categoryLabel(key: string) {
	return key.split('-').map((word) => (word === 'and' ? '&' : word)).join(' ').replace(/^./, (first) => first.toUpperCase());
}

export function summariseLatestWeek(rows: WeeklyNewsRow[]): WeeklyDigest | null {
	const parsed = rows.flatMap((row) => {
		const match = row.source_key?.match(WEEKLY_SOURCE_KEY);
		if (!match) return [];
		return [{ row, year: Number(match[1]), week: Number(match[2]), category: match[3] }];
	});
	if (!parsed.length) return null;

	const latest = parsed.reduce((best, item) =>
		item.year > best.year || (item.year === best.year && item.week > best.week) ? item : best,
	);
	const sameWeek = parsed
		.filter((item) => item.year === latest.year && item.week === latest.week)
		.sort((a, b) => {
			const rank = (category: string) => {
				const index = CATEGORY_ORDER.indexOf(category);
				return index === -1 ? CATEGORY_ORDER.length : index;
			};
			return rank(a.category) - rank(b.category);
		});

	return {
		year: latest.year,
		week: latest.week,
		period: sameWeek.map(({ row }) => metadataText(row.source_metadata, 'period')).find(Boolean) ?? null,
		topics: sameWeek.slice(0, MAX_TOPICS).map(({ row, category }) => ({
			label: metadataText(row.source_metadata, 'category') ?? categoryLabel(category),
			title: row.title,
			text: row.excerpt ?? '',
			href: `/laer/${row.slug}`,
		})),
	};
}

/** "fire" for 4, so the intro reads naturally for one to five tracks. */
export function trackCountWord(count: number) {
	return ['nul', 'ét', 'to', 'tre', 'fire', 'fem'][count] ?? String(count);
}
