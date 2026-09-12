import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	countWords,
	countBlockWords,
	decorateArticleHeadings,
	estimateReadingMinutes,
	extractBlockHeadings,
	extractHeadings,
	parseArticleExtras,
} from '../src/lib/content/article';
import { renderMarkdown } from '../src/lib/content/markdown';
import { selectRelatedContent } from '../src/lib/content/related';
import { createArticleSchema, createFaqSchema } from '../src/lib/seo/schema';

const articlePage = readFileSync(new URL('../src/pages/laer/[slug].astro', import.meta.url), 'utf8');
const articleToc = readFileSync(new URL('../src/components/article/ArticleToc.astro', import.meta.url), 'utf8');
const progressScript = readFileSync(new URL('../src/scripts/article-reading-progress.ts', import.meta.url), 'utf8');
const articleStyles = readFileSync(new URL('../src/styles/article-longform.css', import.meta.url), 'utf8');

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

	it('gives legacy block articles the same headings and reading time', () => {
		const body = {
			blocks: [
				{ type: 'heading', text: 'Kom i gang' },
				{ type: 'paragraph', text: 'Tre synlige ord' },
				{ type: 'heading', level: 3, text: 'Kom i gang' },
			],
		};
		expect(extractBlockHeadings(body)).toEqual([
			{ id: 'kom-i-gang', text: 'Kom i gang', level: 2 },
			{ id: 'kom-i-gang-2', text: 'Kom i gang', level: 3 },
		]);
		expect(countBlockWords(body)).toBe(9);
	});
});

describe('redaktionelle tilføjelser', () => {
	it('accepts FAQ, sources and keywords from the editor metadata', () => {
		const extras = parseArticleExtras({
			faq: [{ question: 'Hvad er AI?', answer: 'Et værktøj.' }],
			sources: [{ name: 'AI Index', url: 'https://aiindex.stanford.edu', year: '2026', sourceType: 'independent', note: 'Uafhængig rapport.' }],
			keywords: ['ai', 'prompt'],
			summary: ['Første pointe', 'Anden pointe'],
			sectionLabels: [{ headingId: 'kom-i-gang', kind: 'practice', label: 'Praktisk konsekvens' }],
		});
		expect(extras.faq).toHaveLength(1);
		expect(extras.sources?.[0].url).toBe('https://aiindex.stanford.edu');
		expect(extras.sources?.[0].sourceType).toBe('independent');
		expect(extras.keywords).toEqual(['ai', 'prompt']);
		expect(extras.summary).toHaveLength(2);
	});

	it('adds provenance labels only to headings named by validated metadata', () => {
		const html = '<h2 id="kom-i-gang">Kom i gang</h2><h2 id="andet">Andet</h2>';
		const decorated = decorateArticleHeadings(html, [
			{ headingId: 'kom-i-gang', kind: 'practice', label: 'Praktisk konsekvens' },
		]);
		expect(decorated).toContain('class="article-trust-label is-practice"');
		expect(decorated).toContain('<h2 id="andet">Andet</h2>');
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
		for (const marker of ['<ArticleBreadcrumbs', '<ArticleToc', '<ArticleSummary', '<ArticleSources', '<AuthorBio />', '<RelatedContent', '<ArticleBriefCta']) {
			expect(articlePage).toContain(marker);
		}
		expect(articlePage).toContain('class="article-hero"');
		expect(articlePage).toContain('ogType={isArticleType');
	});

	it('nudges the reader forward with active and completed section markers', () => {
		expect(articlePage).toContain('data-article-reader');
		expect(articleToc).toContain('data-toc-item={heading.id}');
		expect(articleToc).toContain('data-reading-time-left');
		expect(articleToc).toContain('article-toc-mobile');
		expect(progressScript).toContain('sectionEnd <= marker');
		expect(progressScript).toContain("completed.add(heading.id)");
		expect(progressScript).toContain("heading.classList.toggle('is-read'");
		expect(articleStyles).toContain('content: "✓"');
		expect(articleStyles).toContain('background: var(--color-amber)');
	});
});
