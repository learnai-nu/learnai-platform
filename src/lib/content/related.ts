/**
 * Internal linking: pick the handful of articles most worth sending a reader to
 * next. Dense, relevant internal links are what let a search engine see the
 * library as one connected subject area rather than a pile of pages.
 */

export interface RelatedCandidate {
	title: string;
	slug: string;
	type: string;
	excerpt: string | null;
	published_at?: string | null;
	updated_at?: string | null;
}

export interface RelatedSource {
	slug: string;
	title: string;
	type: string;
	keywords?: string[];
}

/** Words too common in Danish titles to say anything about the subject. */
const stopWords = new Set([
	'og', 'i', 'til', 'af', 'den', 'det', 'de', 'en', 'et', 'for', 'med', 'på',
	'som', 'er', 'du', 'din', 'dit', 'der', 'om', 'kan', 'så', 'ai', 'sådan',
]);

function tokenize(...values: (string | null | undefined)[]) {
	return new Set(
		values
			.filter((value): value is string => typeof value === 'string')
			.join(' ')
			.toLowerCase()
			.split(/[^a-z0-9æøå]+/)
			.filter((word) => word.length > 2 && !stopWords.has(word)),
	);
}

function timestamp(candidate: RelatedCandidate) {
	const value = candidate.published_at ?? candidate.updated_at;
	const parsed = value ? Date.parse(value) : Number.NaN;
	return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Ranks candidates on shared subject words, with a nudge for the same content
 * type, and falls back to recency so the block is never empty.
 */
export function selectRelatedContent(
	source: RelatedSource,
	candidates: RelatedCandidate[],
	limit = 4,
): RelatedCandidate[] {
	const sourceWords = tokenize(source.title, ...(source.keywords ?? []));
	return candidates
		.filter((candidate) => candidate.slug !== source.slug)
		.map((candidate) => {
			const words = tokenize(candidate.title, candidate.excerpt);
			let overlap = 0;
			for (const word of words) if (sourceWords.has(word)) overlap += 1;
			return {
				candidate,
				score: overlap * 10 + (candidate.type === source.type ? 3 : 0),
			};
		})
		.sort((a, b) => b.score - a.score || timestamp(b.candidate) - timestamp(a.candidate))
		.slice(0, limit)
		.map((entry) => entry.candidate);
}
