import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const homepage = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../src/layouts/BlueOrbitLayout.astro', import.meta.url), 'utf8');
const siteLayout = readFileSync(new URL('../src/layouts/SiteLayout.astro', import.meta.url), 'utf8');
const jsonLd = readFileSync(new URL('../src/components/seo/JsonLd.astro', import.meta.url), 'utf8');
const header = readFileSync(
	new URL('../src/components/marketing/BlueOrbitHeader.astro', import.meta.url),
	'utf8',
);
const hero = readFileSync(
	new URL('../src/components/marketing/HeroLearningPreview.astro', import.meta.url),
	'utf8',
);
const learningModel = readFileSync(
	new URL('../src/components/marketing/LearningModel.astro', import.meta.url),
	'utf8',
);
const featuredCourses = readFileSync(
	new URL('../src/components/marketing/FeaturedCourses.astro', import.meta.url),
	'utf8',
);
const tokens = readFileSync(
	new URL('../src/styles/blue-orbit-tokens.css', import.meta.url),
	'utf8',
);
const styles = readFileSync(new URL('../src/styles/blue-orbit.css', import.meta.url), 'utf8');

describe('LearnAI workbook homepage', () => {
	it('uses the isolated component layout and core marketing components', () => {
		expect(homepage).toContain('<BlueOrbitLayout');
		expect(homepage).toContain('<HeroLearningPreview />');
		expect(homepage).toContain('<LearningModel />');
		expect(homepage).toContain('<FeaturedCourses />');
	});

	it('keeps the public navigation connected to real platform routes', () => {
		expect(header).toContain("href: '/laer'");
		expect(header).toContain("href: '/kurser'");
		expect(header).toContain("href: '/laer?type=prompt'");
		expect(header).toContain("href: '/mentor'");
		expect(header).toContain('href="/login"');
		expect(header).toContain('Start gratis');
		expect(header).toContain("Astro.url.searchParams.get('type')");
	});

	it('preserves keyboard access while removing the premature theme control', () => {
		expect(header).toContain("event.key === 'Escape'");
		expect(header).toContain("'Luk menu' : 'Åbn menu'");
		expect(header).not.toContain('orbit-theme-button');
		expect(siteLayout).toContain('class="orbit-skip-link"');
	});

	it('uses Blue Orbit as the shared shell for every public SiteLayout page', () => {
		expect(layout).toContain("import SiteLayout from './SiteLayout.astro'");
		expect(siteLayout).toContain("import BlueOrbitHeader from '../components/marketing/BlueOrbitHeader.astro'");
		expect(siteLayout).toContain("import BlueOrbitFooter from '../components/marketing/BlueOrbitFooter.astro'");
		expect(siteLayout).toContain('body class="blue-orbit"');
		expect(siteLayout).not.toContain('class="site-header"');
		expect(siteLayout).toContain('property="og:title"');
		expect(siteLayout).toContain('<JsonLd data={structuredData} />');
		expect(jsonLd).toContain('type="application/ld+json"');
		expect(styles).toContain('Shared Blue Orbit treatment for the platform pages using SiteLayout.');
		expect(styles).toContain('.blue-orbit .article-body pre code');
		expect(styles).toContain('white-space: pre-wrap');
	});

	it('moves visitors from a clear promise to three real actions', () => {
		expect(hero).toContain('Første kursus tager under én time');
		expect(hero).toContain('Få AI til at fungere');
		expect(hero).toContain('workbook-prompt');
		expect(hero).toContain('workbook-note');
		expect(hero).not.toContain('signal-console');
		expect(hero.match(/<a href=/g)).toHaveLength(3);
	});

	it('uses three need-based paths and one flagship course', () => {
		expect(learningModel.match(/<a class="orbit-need-card/g)).toHaveLength(3);
		expect(learningModel).toContain('LÆR');
		expect(learningModel).toContain('LØS');
		expect(learningModel).toContain('SPØRG');
		expect(featuredCourses).toContain('orbit-course-card-featured');
		expect(featuredCourses).toContain('course-workbook-cover');
		expect(featuredCourses).not.toContain('data-filter');
		expect(featuredCourses).not.toContain('const courses');
	});

	it('defines semantic color tokens and responsive overflow protection', () => {
		expect(tokens).toContain('--orbit-primary: #315ef5');
		expect(tokens).toContain('--orbit-decision: #f3d45b');
		expect(styles).toContain('LearnAI workbook system');
		expect(styles).toContain(':where(.blue-orbit) a { color: inherit;');
		expect(styles).toContain('.orbit-button-filled { background: var(--orbit-primary); color: var(--orbit-on-primary);');
		expect(styles).not.toContain('.blue-orbit a { color: inherit;');
		expect(styles).toContain('overflow-x: clip');
		expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
	});
});
