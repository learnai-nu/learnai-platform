import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dockItems, isNavItemActive, menuGroups, siteAuthor } from '../src/lib/navigation/site-nav';

const dock = readFileSync(new URL('../src/components/marketing/MobileDock.astro', import.meta.url), 'utf8');
const dockStyles = readFileSync(new URL('../src/styles/mobile-dock.css', import.meta.url), 'utf8');
const header = readFileSync(new URL('../src/components/marketing/BlueOrbitHeader.astro', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../src/layouts/SiteLayout.astro', import.meta.url), 'utf8');

describe('mobil-dock', () => {
	it('is rendered on every public page', () => {
		expect(layout).toContain("import MobileDock from '../components/marketing/MobileDock.astro'");
		expect(layout).toContain('<MobileDock />');
		expect(layout).toContain("import '../styles/mobile-dock.css'");
	});

	it('offers four destinations plus the menu, with one of them the CTA', () => {
		expect(dockItems).toHaveLength(5);
		expect(dockItems.filter((item) => item.icon === 'start')).toHaveLength(1);
		expect(dockItems.at(-1)?.icon).toBe('menu');
		expect(dockItems.at(-1)?.href).toBeUndefined();
	});

	it('steps aside while scrolling down and returns when scrolling stops', () => {
		expect(dock).toContain("bar.classList.add('mn-bar-hidden')");
		expect(dock).toContain("setTimeout(() => bar.classList.remove('mn-bar-hidden'), 220)");
		expect(dockStyles).toContain('.mn-bar-hidden { transform: translateY(calc(100% + 1rem)); }');
	});
});

describe('mobil-drawer', () => {
	it('puts the person behind the site above the navigation', () => {
		const profileIndex = dock.indexOf('class="mn-profile"');
		const groupsIndex = dock.indexOf('menuGroups.map');
		expect(profileIndex).toBeGreaterThan(-1);
		expect(profileIndex).toBeLessThan(groupsIndex);
		expect(dock).toContain('<b>Om mig</b>');
		expect(siteAuthor.href).toBe('/om');
	});

	it('opens as a modal dialog that closes on backdrop, button and navigation', () => {
		expect(dock).toContain('drawer.showModal()');
		expect(dock).toContain("drawer.addEventListener('click', (event) => { if (event.target === drawer) close(); })");
		expect(dock).toContain("drawer.querySelectorAll('[data-close-drawer]')");
		expect(dock).toContain("aria-expanded");
	});

	it('replaces the header hamburger rather than doubling it, but keeps a no-JS fallback', () => {
		expect(dockStyles).toContain('.orbit-mobile-nav { display: none; }');
		expect(layout).toContain('<noscript><style>@media (max-width: 1100px) { .orbit-mobile-nav { display: block; } .mn-bar { display: none; } }</style></noscript>');
	});
});

describe('delt navigationsmodel', () => {
	it('feeds the header from the same module as the dock', () => {
		expect(header).toContain("from '../../lib/navigation/site-nav'");
		expect(dock).toContain("from '../../lib/navigation/site-nav'");
		expect(menuGroups.length).toBeGreaterThan(0);
	});

	it('marks the current section, including the ?type= variants', () => {
		const learn = menuGroups[0].items[0];
		expect(isNavItemActive(learn, { pathname: '/laer', currentType: null })).toBe(true);
		expect(isNavItemActive(learn, { pathname: '/laer', currentType: 'news' })).toBe(false);
		expect(isNavItemActive(learn, { pathname: '/kurser', currentType: null })).toBe(false);
	});
});
