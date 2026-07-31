import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const homepage = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../src/layouts/BlueOrbitLayout.astro', import.meta.url), 'utf8');
const siteLayout = readFileSync(new URL('../src/layouts/SiteLayout.astro', import.meta.url), 'utf8');
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

describe('Blue Orbit homepage', () => {
	it('uses the isolated component layout and core marketing components', () => {
		expect(homepage).toContain('<BlueOrbitLayout');
		expect(homepage).toContain('<HeroLearningPreview />');
		expect(homepage).toContain('<LearningModel />');
		expect(homepage).toContain('<FeaturedCourses />');
	});

	it('keeps the public navigation connected to real platform routes', () => {
		expect(header).toContain("href: '/laer'");
		expect(header).toContain("href: '/kurser'");
		expect(header).toContain("href: '/virksomheder'");
		expect(header).toContain('href="/login"');
		expect(header).toContain('href="/kurser"');
		expect(header).not.toContain("label: 'Prompts & værktøjer'");
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
		expect(styles).toContain('Shared Blue Orbit treatment for the platform pages using SiteLayout.');
		expect(styles).toContain('.blue-orbit .article-body pre code');
		expect(styles).toContain('white-space: pre-wrap');
	});

	it('keeps the hero focused on one proof line and two dashboard modules', () => {
		expect(hero).toContain('Første kursus på under én time');
		expect(hero).toContain('orbit-goal-card');
		expect(hero).toContain('orbit-continue-card');
		expect(hero).not.toContain('orbit-signal-strip');
		expect(hero).not.toContain('orbit-skill-grid');
		expect(hero).not.toContain('orbit-ring-small');
	});

	it('uses three compact learning steps and one flagship course', () => {
		expect(learningModel.match(/<article class="orbit-learning-card/g)).toHaveLength(3);
		expect(learningModel).not.toContain('orbit-prompt-demo');
		expect(learningModel).not.toContain('orbit-lesson-stack');
		expect(featuredCourses).toContain('orbit-course-card-featured');
		expect(featuredCourses).not.toContain('data-filter');
		expect(featuredCourses).not.toContain('const courses');
	});

	it('defines semantic color tokens and responsive overflow protection', () => {
		expect(tokens).toContain('--orbit-primary: #0b45ff');
		expect(styles).toContain(':where(.blue-orbit) a { color: inherit;');
		expect(styles).toContain('.orbit-button-filled { background: var(--orbit-primary); color: var(--orbit-on-primary);');
		expect(styles).not.toContain('.blue-orbit a { color: inherit;');
		expect(styles).toContain('overflow-x: clip');
		expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
	});
});
