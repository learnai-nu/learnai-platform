import { z } from 'zod';

/**
 * Long-form article helpers: the reading aids (table of contents, reading time)
 * and the editorial extras (FAQ, sources, keywords) that turn a page into
 * something both a reader and a search engine can navigate.
 */

export interface ArticleHeading {
	id: string;
	text: string;
	level: 2 | 3;
}

const headingPattern = /<(h2|h3) id="([^"]+)">([\s\S]*?)<\/\1>/g;

export function extractHeadings(html: string): ArticleHeading[] {
	const headings: ArticleHeading[] = [];
	for (const match of html.matchAll(headingPattern)) {
		const text = match[3].replace(/<[^>]*>/g, '').trim();
		if (!text) continue;
		headings.push({ id: match[2], text, level: match[1] === 'h3' ? 3 : 2 });
	}
	return headings;
}

export function countWords(html: string) {
	const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
	return text ? text.split(' ').length : 0;
}

/** Danish prose reads at roughly 200 words a minute. */
export function estimateReadingMinutes(wordCount: number) {
	return Math.max(1, Math.round(wordCount / 200));
}

const faqEntrySchema = z.object({
	question: z.string().trim().min(3).max(300),
	answer: z.string().trim().min(3).max(2_000),
});

const sourceSchema = z.object({
	name: z.string().trim().min(2).max(300),
	url: z.url().max(500).optional(),
	publisher: z.string().trim().max(200).optional(),
	author: z.string().trim().max(200).optional(),
	year: z.string().trim().max(20).optional(),
});

const articleExtrasSchema = z.object({
	faq: z.array(faqEntrySchema).max(20).optional(),
	sources: z.array(sourceSchema).max(30).optional(),
	keywords: z.array(z.string().trim().min(2).max(80)).max(15).optional(),
	image: z.string().trim().max(500).optional(),
	imageAlt: z.string().trim().max(300).optional(),
	/** Entities from the knowledge graph, surfaced as schema.org `about`. */
	about: z.array(z.string().trim().min(2).max(120)).max(10).optional(),
});

export type ArticleExtras = z.infer<typeof articleExtrasSchema>;

/**
 * `source_metadata` is editor-supplied JSON, so anything malformed is dropped
 * rather than allowed to break the page.
 */
export function parseArticleExtras(metadata: unknown): ArticleExtras {
	if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return {};
	const parsed = articleExtrasSchema.safeParse(metadata);
	return parsed.success ? parsed.data : {};
}
