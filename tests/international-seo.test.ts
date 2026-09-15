/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contentPath, sourceKeyForLocale } from '../src/lib/content/translations';
import { buildSitePageGraph, createArticleSchema, createFaqSchema } from '../src/lib/seo/schema';
import { englishMenuGroups, navigationForLocale } from '../src/lib/navigation/site-nav';

const danishArticle = readFileSync(new URL('../src/pages/laer/[slug].astro', import.meta.url), 'utf8');
const englishArticle = readFileSync(new URL('../src/pages/en/learn/[slug].astro', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../src/pages/sitemap.xml.ts', import.meta.url), 'utf8');

describe('international SEO', () => {
	it('marks English page, article and FAQ schema as English', () => {
		const canonicalUrl = new URL('https://learnai.nu/en/learn/week-37-business');
		const article = createArticleSchema({
			canonicalUrl,
			type: 'NewsArticle',
			headline: 'The AI race',
			description: 'A sourced weekly analysis.',
			locale: 'en',
		});
		const faq = createFaqSchema(canonicalUrl, [{ question: 'Why?', answer: 'Because.' }], 'en');
		const graph = buildSitePageGraph({
			siteUrl: new URL('https://learnai.nu/'),
			canonicalUrl,
			title: 'The AI race — LearnAI.nu',
			description: 'A sourced weekly analysis.',
			mainEntity: article,
			additionalNodes: [faq],
			locale: 'en',
		});

		expect(article.inLanguage).toBe('en');
		expect(faq.inLanguage).toBe('en');
		expect(graph['@graph'].find((node) => node['@type'] === 'WebPage')?.inLanguage).toBe('en');
		expect(graph['@graph'].find((node) => node['@type'] === 'WebSite')?.inLanguage).toEqual(['da-DK', 'en']);
	});

	it('builds only verified weekly translation keys and canonical locale paths', () => {
		expect(sourceKeyForLocale('learnai-weekly:2026:37:da:business', 'en')).toBe('learnai-weekly:2026:37:en:business');
		expect(sourceKeyForLocale('learnai-backup:article:123', 'en')).toBeNull();
		expect(contentPath('da', 'uge-37-business')).toBe('/laer/uge-37-business');
		expect(contentPath('en', 'week-37-business')).toBe('/en/learn/week-37-business');
	});

	it('queries reciprocal published article pairs instead of guessing slugs', () => {
		for (const page of [danishArticle, englishArticle]) {
			expect(page).toContain(".eq('source_key', counterpartSourceKey)");
			expect(page).toContain(".eq('status', 'published')");
			expect(page).toContain('const alternates = counterpartSlug');
		}
		expect(englishArticle).not.toContain("replace(/^week-/, 'uge-')");
	});

	it('lists English entry points and routes English rows to /en/learn', () => {
		expect(sitemap).toContain("{ path: '/en'");
		expect(sitemap).toContain("{ path: '/en/learn'");
		expect(sitemap).toContain("select('slug,updated_at,locale')");
		expect(sitemap).toContain("contentPath(row.locale === 'en' ? 'en' : 'da', row.slug)");
	});

	it('uses English labels and available English routes in shared navigation', () => {
		const navigation = navigationForLocale('en');
		expect(navigation.menuGroups).toBe(englishMenuGroups);
		expect(navigation.primaryCta.href).toBe('/en/learn');
		expect(navigation.dockItems.some((item) => item.href === '/en/tools')).toBe(true);
		expect(englishMenuGroups.flatMap((group) => group.items).some((item) => item.href === '/en/use-cases')).toBe(true);
	});
});
