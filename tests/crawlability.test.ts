import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const sitemap = readFileSync(new URL('../src/pages/sitemap.xml.ts', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../src/pages/robots.txt.ts', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../src/layouts/SiteLayout.astro', import.meta.url), 'utf8');

describe('sitemap', () => {
	it('is generated from the database, since the catalogues live there', () => {
		expect(sitemap).toContain(".from('content_items')");
		expect(sitemap).toContain(".from('courses')");
		expect(sitemap).toContain(".eq('status', 'published')");
		expect(sitemap).toContain('application/xml');
	});

	it('only lists routes that actually resolve', () => {
		for (const missingRoute of ['/tools/${', '/use-cases/${', '/resources/${', '/events/${']) {
			expect(sitemap).not.toContain(missingRoute);
		}
	});

	it('escapes URLs so a slug cannot break the document', () => {
		expect(sitemap).toContain('function escapeXml');
		expect(sitemap).toContain('escapeXml(new URL(entry.path, origin).toString())');
	});
});

describe('robots.txt', () => {
	it('points crawlers at the sitemap and away from private surfaces', () => {
		expect(robots).toContain('/sitemap.xml');
		for (const path of ['/admin', '/api/', '/auth/', '/dashboard', '/login', '/search']) {
			expect(robots).toContain(`Disallow: ${path}`);
		}
	});
});

describe('crawl- og delesignaler', () => {
	it('allows large image previews on indexable pages', () => {
		expect(layout).toContain('max-image-preview:large');
		expect(layout).toContain('max-snippet:-1');
	});

	it('upgrades the share card when the page has an image', () => {
		expect(layout).toContain("content={shareImage ? 'summary_large_image' : 'summary'}");
		expect(layout).toContain('property="og:image"');
		expect(layout).toContain('article:published_time');
	});

	it('prefetches internal links only', () => {
		expect(layout).toContain('speculationrules');
		expect(layout).toContain('a[href^="/"]');
	});
});
