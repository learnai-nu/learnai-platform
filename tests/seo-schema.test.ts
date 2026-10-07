import { describe, expect, it } from 'vitest';
import {
	buildSitePageGraph,
	createArticleSchema,
	createCanonicalUrl,
	createCourseSchema,
	createItemListSchema,
	createLearningResourceSchema,
	serializeJsonLd,
} from '../src/lib/seo/schema';

describe('SEO schema contracts', () => {
	it('builds one connected graph with stable IDs and no duplicate nodes', () => {
		const canonicalUrl = new URL('https://learnai.nu/laer/kom-i-gang');
		const mainEntity = createArticleSchema({
			canonicalUrl,
			type: 'Article',
			headline: 'Kom i gang med AI',
			description: 'En praktisk guide.',
			datePublished: '2026-08-01T09:00:00Z',
			dateModified: '2026-08-02T09:00:00Z',
		});
		const graph = buildSitePageGraph({
			siteUrl: new URL('https://learnai.nu/'),
			canonicalUrl,
			title: 'Kom i gang med AI — LearnAI.nu',
			description: 'En praktisk guide.',
			breadcrumbs: [
				{ name: 'Forside', url: '/' },
				{ name: 'Lær AI', url: '/laer' },
				{ name: 'Kom i gang med AI', url: canonicalUrl.toString() },
			],
			mainEntity,
			additionalNodes: [mainEntity],
		});

		expect(graph['@context']).toBe('https://schema.org');
		expect(graph['@graph'].map((node) => node['@type'])).toEqual([
			'Organization',
			'Person',
			'WebSite',
			'WebPage',
			'BreadcrumbList',
			'Article',
		]);
		expect(new Set(graph['@graph'].map((node) => node['@id'])).size).toBe(graph['@graph'].length);
		expect(graph['@graph'].find((node) => node['@type'] === 'WebPage')?.mainEntity).toEqual({
			'@type': 'Article',
			'@id': 'https://learnai.nu/laer/kom-i-gang#article',
		});
		expect(graph['@graph'].find((node) => node['@type'] === 'BreadcrumbList')?.itemListElement).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ item: 'https://learnai.nu/laer/kom-i-gang' }),
			]),
		);
	});

	it('creates schema that matches collections, courses and lessons', () => {
		const collection = createItemListSchema(new URL('https://learnai.nu/kurser'), [
			{ name: 'AI i praksis', url: '/kurser/ai-i-praksis' },
		]);
		const course = createCourseSchema({
			canonicalUrl: new URL('https://learnai.nu/kurser/ai-i-praksis'),
			name: 'AI i praksis',
			description: 'Et praktisk kursus.',
			durationMinutes: 62,
			priceDkk: 0,
			level: 'Begynder',
		});
		const lesson = createLearningResourceSchema({
			canonicalUrl: new URL('https://learnai.nu/kurser/ai-i-praksis/lektioner/start'),
			name: 'Start her',
			description: 'Første lektion.',
			courseUrl: new URL('https://learnai.nu/kurser/ai-i-praksis'),
			courseName: 'AI i praksis',
			durationMinutes: 8,
		});

		expect(collection).toMatchObject({ '@type': 'ItemList', numberOfItems: 1 });
		expect(course).toMatchObject({
			'@type': 'Course',
			timeRequired: 'PT62M',
			offers: { '@type': 'Offer', price: 0, priceCurrency: 'DKK' },
		});
		expect(lesson).toMatchObject({
			'@type': 'LearningResource',
			learningResourceType: 'lesson',
			timeRequired: 'PT8M',
			isPartOf: { '@type': 'Course', name: 'AI i praksis' },
		});
	});

	it('serializes JSON-LD without allowing script termination', () => {
		const serialized = serializeJsonLd({ description: '</script><script>alert(1)</script> & test' });
		expect(serialized).not.toContain('<');
		expect(serialized).not.toContain('>');
		expect(serialized).not.toContain('&');
		expect(JSON.parse(serialized).description).toBe('</script><script>alert(1)</script> & test');
	});

	it('keeps canonical URLs stable across query strings and trailing slashes', () => {
		expect(
			createCanonicalUrl(
				new URL('https://preview.example/kurser/?status=done'),
				new URL('https://learnai.nu/'),
			).toString(),
		).toBe('https://learnai.nu/kurser');
		expect(createCanonicalUrl(new URL('https://learnai.nu/')).toString()).toBe('https://learnai.nu/');
	});
});
