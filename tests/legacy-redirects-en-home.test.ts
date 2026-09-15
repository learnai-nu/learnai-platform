import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const astroConfig = readFileSync(new URL('../astro.config.mjs', import.meta.url), 'utf8');
const middleware = readFileSync(new URL('../src/middleware.ts', import.meta.url), 'utf8');
const siteLayout = readFileSync(new URL('../src/layouts/SiteLayout.astro', import.meta.url), 'utf8');
const danishHome = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const englishHome = readFileSync(new URL('../src/pages/en/index.astro', import.meta.url), 'utf8');
const blueOrbitLayout = readFileSync(new URL('../src/layouts/BlueOrbitLayout.astro', import.meta.url), 'utf8');

describe('legacy redirects and English home SEO', () => {
	it('keeps the existing tools alias and ships the legacy 301 table', () => {
		expect(astroConfig).toContain("'/vaerktoejer': '/tools'");
		expect(astroConfig).toContain("'/articles': '/laer'");
		expect(astroConfig).toContain("'/about': '/om'");
		expect(astroConfig).toContain("'/courses': '/kurser'");
		expect(astroConfig).toContain("'/privacy': '/privatliv'");
		expect(astroConfig).toContain("'/prompts': '/laer?type=prompt'");
		// Dynamic catch-all must NOT live in Astro config (literal path bug on Vercel)
		expect(astroConfig).not.toContain("'/articles/[...slug]'");
		expect(astroConfig).not.toContain("'/laer/[...slug]'");
	});

	it('redirects /articles/:slug(+) via middleware with 301 slug substitution', () => {
		expect(middleware).toContain("pathname.match(/^\\/articles\\/(.+)$/)");
		expect(middleware).toContain('context.redirect(`/laer/${slug}`, 301)');
	});

	it('emits reciprocal home hreflang including x-default', () => {
		expect(siteLayout).toContain("hreflang: 'x-default'");
		expect(blueOrbitLayout).toContain('alternates');
		expect(danishHome).toContain("path: '/'");
		expect(danishHome).toContain("path: '/en'");
		expect(englishHome).toContain('locale="en"');
		expect(englishHome).toContain('Practical AI learning in English | LearnAI.nu');
		expect(englishHome).toContain("path: '/'");
		expect(englishHome).toContain("path: '/en'");
	});
});