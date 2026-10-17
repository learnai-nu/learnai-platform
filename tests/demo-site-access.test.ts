import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('private demo site', () => {
	it('keeps the public root closed and unindexed', () => {
		const home = read('../src/pages/index.astro');
		expect(home).toContain('LearnAI<span>.nu</span>');
		expect(home).toContain('noindex, nofollow, noarchive');
		expect(home).not.toContain('BlueOrbitLayout');
	});

	it('protects the demo with server-only settings and an HttpOnly cookie', () => {
		const login = read('../src/pages/api/demo-site/login.ts');
		const access = read('../src/lib/demo-site/access.ts');
		expect(access).toContain('import.meta.env.DEMO_SITE_PASSWORD');
		expect(access).toContain('import.meta.env.DEMO_SITE_COOKIE_SECRET');
		expect(access).toContain("createHmac('sha256'");
		expect(login).toContain('httpOnly: true');
		expect(login).toContain("sameSite: 'lax'");
		expect(login).not.toContain('DEMO_SITE_PASSWORD=');
	});

	it('maps authenticated demo paths internally and blocks indexing', () => {
		const middleware = read('../src/middleware.ts');
		const catchAll = read('../src/pages/demo-site/[...path].astro');
		expect(middleware).toContain("pathname.startsWith('/demo-site/')");
		expect(catchAll).toContain('Astro.rewrite(new Request');
		expect(catchAll).toContain("headers.set(DEMO_REWRITE_HEADER, '1')");
		expect(middleware).toContain('X-Robots-Tag');
		expect(read('../src/pages/robots.txt.ts')).toContain('Disallow: /');
	});

	it('keeps protected public pages server-rendered so middleware always runs', () => {
		for (const path of ['[slug].astro', 'arbejdskompas.astro', 'en/index.astro', 'om-mig.astro', 'podcast.astro']) {
			expect(read(`../src/pages/${path}`)).toContain('export const prerender = false');
		}
	});
});
