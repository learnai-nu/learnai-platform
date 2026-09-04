import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const header = readFileSync(new URL('../src/components/marketing/BlueOrbitHeader.astro', import.meta.url), 'utf8');
const account = readFileSync(new URL('../src/components/marketing/HeaderAccount.astro', import.meta.url), 'utf8');
const languageSwitcher = readFileSync(new URL('../src/components/marketing/LanguageSwitcher.astro', import.meta.url), 'utf8');
const accountScript = readFileSync(new URL('../src/scripts/header-account.ts', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../src/layouts/SiteLayout.astro', import.meta.url), 'utf8');
const searchPage = readFileSync(new URL('../src/pages/search.astro', import.meta.url), 'utf8');
const toolsCatalog = readFileSync(new URL('../src/components/catalog/ToolsCatalog.astro', import.meta.url), 'utf8');

describe('sprogvælger', () => {
	it('only appears where the page actually has a translation', () => {
		expect(languageSwitcher).toContain('{alternates.length > 1 && (');
		expect(header).toContain('<LanguageSwitcher {locale} {alternates} />');
		expect(layout).toContain('<BlueOrbitHeader {locale} {alternates} />');
	});

	it('is fed by the same alternates that drive hreflang', () => {
		expect(layout).toContain('rel="alternate"');
		expect(toolsCatalog).toMatch(/alternates=\{\[\{ locale: 'da', path: '\/tools' \}, \{ locale: 'en', path: '\/en\/tools' \}\]\}/);
	});

	it('marks the current language for screen readers', () => {
		expect(languageSwitcher).toContain("aria-current={alternate.locale === locale ? 'true' : undefined}");
	});
});

describe('søgning', () => {
	it('sends both header forms to the dedicated search page', () => {
		expect(header.match(/action="\/search" method="get" role="search"/g)).toHaveLength(2);
		expect(header).not.toContain('action="/laer" method="get" role="search"');
	});

	it('searches every published catalogue, not just the knowledge section', () => {
		for (const table of ['content_items', 'tools', 'use_cases', 'resources', 'events']) {
			expect(searchPage).toContain(`.from('${table}')`);
		}
		expect(searchPage.match(/\.eq\('published', true\)/g)).toHaveLength(4);
		expect(searchPage).toContain(".eq('status', 'published')");
	});

	it('escapes ILIKE wildcards so a query cannot widen its own pattern', () => {
		expect(searchPage).toContain(".replaceAll('%', '\\\\%')");
		expect(searchPage).toContain(".replaceAll('_', '\\\\_')");
		expect(searchPage).toContain('.slice(0, 120)');
	});

	it('works without JavaScript and keeps itself out of the index', () => {
		expect(searchPage).toContain('method="get"');
		expect(searchPage).toContain('noindex');
		expect(searchPage).toContain('export const prerender = false;');
	});
});

describe('logind-indikator', () => {
	it('falls back to a working link when JavaScript never runs', () => {
		expect(account).toContain('href="/login" data-account-anonymous');
		expect(account).toContain('data-account-menu hidden');
	});

	it('resolves the session in the browser, so prerendered pages work too', () => {
		expect(accountScript).toContain('createBrowserSupabaseClient');
		expect(accountScript).toContain('auth.getUser()');
		expect(accountScript).toContain("select('display_name')");
		expect(accountScript).toContain('catch(');
	});

	it('offers the account actions a signed-in visitor needs', () => {
		expect(account).toContain('href="/dashboard"');
		expect(account).toContain('href="/dashboard/profil"');
		expect(account).toContain('action="/auth/sign-out"');
	});

	it('shows the account state in the mobile menu as well', () => {
		expect(header).toContain('<a href="/login" data-account-anonymous>Log ind</a>');
		expect(header).toContain('data-account-menu hidden');
	});
});
