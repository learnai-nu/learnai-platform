import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	countWords,
	estimateReadingMinutes,
	extractHeadings,
	parseArticleExtras,
} from '../src/lib/content/article';
import { renderMarkdown } from '../src/lib/content/markdown';
import { selectRelatedContent } from '../src/lib/content/related';
import { createArticleSchema, createFaqSchema } from '../src/lib/seo/schema';

const articlePage = readFileSync(new URL('../src/pages/laer/[slug].astro', import.meta.url), 'utf8');

describe('overskrifter og indholdsfortegnelse', () => {
	it('only adds heading anchors when the caller asks for them', () => {
		const markdown = '## Kom i gang\n\n### Første skridt\n';
		expect(renderMarkdown(markdown)).toContain('<h2>Kom i gang</h2>');
		const anchored = renderMarkdown(markdown, { headingIds: true });
		expect(anchored).toContain('<h2 id="kom-i-gang">Kom i gang</h2>');
		expect(anchored).toContain('<h3 id="foerste-skridt">Første skridt</h3>');
	});

	it('keeps duplicate headings uniquely addressable', () => {
		const html = renderMarkdown('## Opsamling\n\n## Opsamling\n', { headingIds: true });
		expect(html).toContain('id="opsamling"');
		expect(html).toContain('id="opsamling-2"');
	});

	it('reads the table of contents back out of the rendered HTML', () => {
		const html = renderMarkdown('## En\n\ntekst\n\n### To\n', { headingIds: true });
		expect(extractHeadings(html)).toEqual([
			{ id: 'en', text: 'En', level: 2 },
			{ id: 'to', text: 'To', level: 3 },
		]);
	});

	it('estimates reading time from the visible words only', () => {
		const html = '<p>' + 'ord '.repeat(400) + '</p>';
		expect(countWords(html)).toBe(400);
		expect(estimateReadingMinutes(countWords(html))).toBe(2);
		expect(estimateReadingMinutes(10)).toBe(1);
	});
});

describe('redaktionelle tilføjelser', () => {
	it('accepts FAQ, sources and keywords from the editor metadata', () => {
		const extras = parseArticleExtras({
			faq: [{ question: 'Hvad er AI?', answer: 'Et værktøj.' }],
			sources: [{ name: 'AI Index', url: 'https://aiindex.stanford.edu', year: '2026' }],
			keywords: ['ai', 'prompt'],
		});
		expect(extras.faq).toHaveLength(1);
		expect(extras.sources?.[0].url).toBe('https://aiindex.stanford.edu');
		expect(extras.keywords).toEqual(['ai', 'prompt']);
	});

	it('drops malformed metadata rather than breaking the page', () => {
		expect(parseArticleExtras({ faq: [{ question: 'x' }] })).toEqual({});
		expect(parseArticleExtras(null)).toEqual({});
		expect(parseArticleExtras('nope')).toEqual({});
	});
});

describe('intern linkning', () => {
	const candidates = [
		{ title: 'Prompt-teknikker til møder', slug: 'prompts-moeder', type: 'guide', excerpt: 'Prompt til referat.' },
		{ title: 'Sådan kom vi i gang med AI', slug: 'kom-i-gang', type: 'article', excerpt: 'Første skridt.' },
		{ title: 'Prompt-bibliotek', slug: 'prompt-bibliotek', type: 'guide', excerpt: 'Prompt-samling.' },
	];

	it('prefers candidates that share subject words', () => {
		const related = selectRelatedContent(
			{ slug: 'kilde', title: 'Bedre prompts på arbejdet', type: 'guide' },
			candidates,
			2,
		);
		expect(related.map((item) => item.slug)).toEqual(['prompts-moeder', 'prompt-bibliotek']);
	});

	it('never links an article to itself', () => {
		const related = selectRelatedContent(
			{ slug: 'prompt-bibliotek', title: 'Prompt-bibliotek', type: 'guide' },
			candidates,
		);
		expect(related.map((item) => item.slug)).not.toContain('prompt-bibliotek');
	});
});

describe('artikel-schema', () => {
	const canonicalUrl = new URL('https://learnai.nu/laer/kom-i-gang');

	it('credits a named person as author and the organisation as publisher', () => {
		const schema = createArticleSchema({
			canonicalUrl,
			type: 'Article',
			headline: 'Kom i gang',
			description: 'Guide.',
		});
		expect(schema.author).toMatchObject({ '@type': 'Person', '@id': 'https://learnai.nu/#person' });
		expect(schema.publisher).toMatchObject({ '@id': 'https://learnai.nu/#organization' });
	});

	it('carries the long-form signals: sources, keywords, section and length', () => {
		const schema = createArticleSchema({
			canonicalUrl,
			type: 'Article',
			headline: 'Kom i gang',
			description: 'Guide.',
			articleSection: 'Guide',
			keywords: ['ai'],
			wordCount: 1200,
			readingMinutes: 6,
			citations: [{ name: 'AI Index', url: 'https://aiindex.stanford.edu' }],
			about: ['Generativ AI'],
		});
		expect(schema.articleSection).toBe('Guide');
		expect(schema.wordCount).toBe(1200);
		expect(schema.timeRequired).toBe('PT6M');
		expect(schema.citation).toEqual([
			{ '@type': 'CreativeWork', name: 'AI Index', url: 'https://aiindex.stanford.edu' },
		]);
		expect(schema.about).toEqual([{ '@type': 'Thing', name: 'Generativ AI' }]);
	});

	it('publishes FAQ markup only alongside visible questions', () => {
		const faq = createFaqSchema(canonicalUrl, [{ question: 'Hvad?', answer: 'Sådan.' }]);
		expect(faq['@type']).toBe('FAQPage');
		expect(articlePage).toContain('<ArticleFaq entries={faqEntries} />');
		expect(articlePage).toContain('additionalSchema={additionalSchema}');
	});
});

describe('artikelsiden', () => {
	it('shows the trust and navigation furniture around the body', () => {
		for (const marker of ['<ArticleBreadcrumbs', '<ArticleToc', '<ArticleSources', '<AuthorBio />', '<RelatedContent']) {
			expect(articlePage).toContain(marker);
		}
		expect(articlePage).toContain('ogType={isArticleType');
	});
});
