import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const robots = readFileSync(new URL('../src/pages/robots.txt.ts', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../src/layouts/SiteLayout.astro', import.meta.url), 'utf8');

describe('robots.txt', () => {
	it('keeps private surfaces out and no longer advertises a sitemap', () => {
		expect(robots).not.toContain('Sitemap:');
		for (const path of ['/admin', '/api/', '/auth/', '/login']) {
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
