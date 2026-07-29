import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const homepage = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../src/layouts/BlueOrbitLayout.astro', import.meta.url), 'utf8');
const header = readFileSync(
	new URL('../src/components/marketing/BlueOrbitHeader.astro', import.meta.url),
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
		expect(header).toContain('href="/login"');
		expect(header).toContain('href="/kurser"');
	});

	it('preserves keyboard and accessible menu/theme states', () => {
		expect(header).toContain('aria-pressed="false"');
		expect(header).toContain("event.key === 'Escape'");
		expect(header).toContain("'Luk menu' : 'Åbn menu'");
		expect(layout).toContain('class="orbit-skip-link"');
	});

	it('defines semantic light/dark tokens and responsive overflow protection', () => {
		expect(tokens).toContain('--orbit-primary: #0b45ff');
		expect(tokens).toContain(':root.orbit-deep-mode');
		expect(tokens).toContain('--orbit-primary: #9bb6ff');
		expect(styles).toContain('overflow-x: clip');
		expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
	});
});
