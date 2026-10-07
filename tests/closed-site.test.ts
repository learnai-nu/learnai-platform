import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const exists = (path: string) => existsSync(new URL(path, import.meta.url));

describe('closed site', () => {
	it('shows only the logo on the front page', () => {
		const home = read('../src/pages/index.astro');
		expect(home).toContain('LearnAI<span>.nu</span>');
		expect(home).toContain('<meta name="robots" content="noindex" />');
		expect(home).not.toContain('<a ');
		expect(home).not.toContain('Layout');
	});

	it('redirects every other public address to the front page', () => {
		expect(read('../src/pages/[...path].astro')).toContain("Astro.redirect('/', 301)");
		for (const page of ['laer/index.astro', 'om-mig.astro', 'podcast.astro', 'sitemap.xml.ts', 'auth/sign-up.ts']) {
			expect(exists(`../src/pages/${page}`)).toBe(false);
		}
	});

	it('keeps login and the admin CMS without the public navigation', () => {
		const login = read('../src/pages/login.astro');
		expect(login).toContain('chrome={false}');
		expect(login).not.toContain('/auth/sign-up');
		expect(read('../src/layouts/AdminLayout.astro')).toContain('chrome={false}');
		expect(read('../src/pages/auth/sign-in.ts')).toContain("redirectWithoutCache('/admin')");
	});
});
