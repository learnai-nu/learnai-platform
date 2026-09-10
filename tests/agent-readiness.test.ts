import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	expectsHtmlDocument,
	parseAcceptHeader,
	prefersMarkdown,
	stripMarkdownSuffix,
	withAcceptVary,
} from '../src/lib/agents/accept';
import {
	renderArticleMarkdown,
	renderContentIndexMarkdown,
	renderCourseIndexMarkdown,
	renderCourseMarkdown,
	renderNotFoundMarkdown,
	resolveStaticMarkdown,
} from '../src/lib/agents/markdown-resources';
import { agentLimitations, agentResources, agentUseCases } from '../src/lib/agents/guide';
import { renderSitePageMarkdown, sitePages } from '../src/lib/content/site-pages';
import { buildSitePageGraph } from '../src/lib/seo/schema';

const origin = new URL('https://learnai.nu/');
const middleware = readFileSync(new URL('../src/middleware.ts', import.meta.url), 'utf8');
const llmsRoute = readFileSync(new URL('../src/pages/llms.txt.ts', import.meta.url), 'utf8');
const notFoundPage = readFileSync(new URL('../src/pages/404.astro', import.meta.url), 'utf8');
const siteLayout = readFileSync(new URL('../src/layouts/SiteLayout.astro', import.meta.url), 'utf8');
const agentPage = readFileSync(new URL('../src/pages/agenter.astro', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../src/pages/robots.txt.ts', import.meta.url), 'utf8');

describe('Accept-forhandling', () => {
	it('sorterer Accept-headeren efter q-værdi', () => {
		expect(parseAcceptHeader('text/html;q=0.8, text/markdown')).toEqual([
			{ type: 'text/markdown', quality: 1 },
			{ type: 'text/html', quality: 0.8 },
		]);
	});

	it('vælger Markdown når agenten beder om det', () => {
		expect(prefersMarkdown('text/markdown')).toBe(true);
		expect(prefersMarkdown('text/markdown, text/html;q=0.5')).toBe(true);
		expect(prefersMarkdown('text/x-markdown')).toBe(true);
	});

	it('lader browsere få HTML', () => {
		expect(prefersMarkdown('text/html,application/xhtml+xml,*/*;q=0.8')).toBe(false);
		expect(prefersMarkdown('*/*')).toBe(false);
		expect(prefersMarkdown(null)).toBe(false);
		expect(expectsHtmlDocument('text/html,application/xhtml+xml,*/*;q=0.8')).toBe(true);
		expect(expectsHtmlDocument('*/*')).toBe(false);
		expect(expectsHtmlDocument(null)).toBe(false);
		expect(expectsHtmlDocument('text/markdown')).toBe(false);
	});

	it('tilføjer Accept til Vary uden at smide eksisterende værdier væk', () => {
		expect(withAcceptVary(null)).toBe('Accept, Accept-Encoding');
		expect(withAcceptVary('Cookie')).toBe('Cookie, Accept, Accept-Encoding');
		expect(withAcceptVary('accept, Accept-Encoding')).toBe('accept, Accept-Encoding');
	});

	it('oversætter .md-stier til den kanoniske sti', () => {
		expect(stripMarkdownSuffix('/laer/kom-i-gang.md')).toBe('/laer/kom-i-gang');
		expect(stripMarkdownSuffix('/index.md')).toBe('/index');
		expect(stripMarkdownSuffix('/laer/kom-i-gang')).toBeNull();
	});
});

describe('middleware', () => {
	it('svarer med text/markdown og Vary: Accept', () => {
		expect(middleware).toContain('MARKDOWN_CONTENT_TYPE');
		expect(middleware).toContain('Vary: MARKDOWN_VARY');
		expect(middleware).toContain("headers.set('Vary', withAcceptVary(headers.get('Vary')))");
	});

	it('rører ikke Accept-headeren på prærenderede ruter', () => {
		expect(middleware).toContain('context.isPrerendered ? null : request.headers.get(\'accept\')');
	});

	it('holder private og maskinelle flader ude af forhandlingen', () => {
		for (const prefix of ['/api/', '/auth/', '/admin', '/dashboard', '/login']) {
			expect(middleware).toContain(`'${prefix}'`);
		}
	});

	it('svarer med Markdown på 404 til klienter uden HTML', () => {
		expect(middleware).toContain('response.status === 404');
		expect(middleware).toContain('renderNotFoundMarkdown');
		expect(middleware).toContain('!expectsHtmlDocument(accept)');
	});
});

describe('404', () => {
	it('sætter en rigtig 404-status og peger videre', () => {
		expect(notFoundPage).toContain('Astro.response.status = 404');
		expect(notFoundPage).toContain('/sitemap.xml');
		expect(notFoundPage).toContain('/llms.txt');
		expect(notFoundPage).toContain('noindex');
	});

	it('giver agenten en Markdown-krop med genveje', () => {
		const markdown = renderNotFoundMarkdown('/findes-ikke', origin);
		expect(markdown.startsWith('# 404')).toBe(true);
		expect(markdown).toContain('/findes-ikke');
		for (const path of ['/sitemap.xml', '/llms.txt', '/laer', '/kurser', '/agenter']) {
			expect(markdown).toContain(`https://learnai.nu${path}`);
		}
	});
});

describe('Markdown-udgaver', () => {
	it('dækker forsiden, agentsiden og tillidssiderne', () => {
		for (const path of ['/', '/index', '/agenter', '/om', '/kontakt', '/privatliv']) {
			const document = resolveStaticMarkdown(path, origin);
			expect(document, path).not.toBeNull();
			expect(document?.body.startsWith('# ')).toBe(true);
		}
		expect(resolveStaticMarkdown('/findes-ikke', origin)).toBeNull();
	});

	it('gengiver artiklens egen Markdown med kilde og kanonisk adresse', () => {
		const markdown = renderArticleMarkdown({
			title: 'Kom i gang med AI',
			slug: 'kom-i-gang',
			type: 'guide',
			excerpt: 'En praktisk guide.',
			published_at: '2026-08-01T09:00:00Z',
			updated_at: '2026-08-02T09:00:00Z',
			body: { markdown: '## Første skridt\n\nSkriv en prompt.' },
		}, origin);
		expect(markdown).toContain('# Kom i gang med AI');
		expect(markdown).toContain('> En praktisk guide.');
		expect(markdown).toContain('Udgivet: 2026-08-01');
		expect(markdown).toContain('## Første skridt');
		expect(markdown).toContain('https://learnai.nu/laer/kom-i-gang');
	});

	it('lister indhold og kurser med absolutte links', () => {
		expect(renderContentIndexMarkdown([
			{ title: 'Prompt 101', slug: 'prompt-101', type: 'guide', excerpt: 'Kom godt fra start.' },
		], origin)).toContain('[Prompt 101](https://learnai.nu/laer/prompt-101)');
		expect(renderCourseIndexMarkdown([
			{ title: 'AI i praksis', slug: 'ai-i-praksis', description: 'Gratis kursus.', price_dkk: 0 },
		], origin)).toContain('gratis');
		expect(renderCourseMarkdown(
			{ title: 'AI i praksis', slug: 'ai-i-praksis', description: 'Gratis kursus.', estimated_minutes: 62 },
			[{ title: 'Modul 1', description: null, lessons: [{ title: 'Start her', estimated_minutes: 8 }] }],
			origin,
		)).toContain('- Start her (8 min.)');
	});

	it('holder tillidssidernes Markdown og HTML på samme kilde', () => {
		for (const page of sitePages) {
			const markdown = renderSitePageMarkdown(page, origin);
			expect(markdown).toContain(`# ${page.title}`);
			for (const section of page.sections) expect(markdown).toContain(`## ${section.heading}`);
		}
	});
});

describe('tillidssider', () => {
	it('har mere end 500 tegn reelt indhold hver', () => {
		for (const page of sitePages) {
			const characters = [page.intro, ...page.sections.flatMap((section) => section.paragraphs)]
				.join(' ').length;
			expect(characters, page.path).toBeGreaterThan(500);
		}
	});

	it('findes som selvstændige ruter med den rigtige schema-type', () => {
		for (const page of sitePages) {
			const source = readFileSync(new URL(`../src/pages/${page.slug}.astro`, import.meta.url), 'utf8');
			expect(source).toContain('pageType={page.pageType}');
			expect(source).toContain('SitePageContent');
		}
		expect(sitePages.map((page) => page.pageType)).toEqual(['AboutPage', 'ContactPage', 'WebPage']);
	});
});

describe('llms.txt og agentsiden', () => {
	it('følger llms.txt-formatet med H1, resumé og linksektioner', () => {
		expect(llmsRoute).toContain("'# LearnAI.nu'");
		expect(llmsRoute).toContain('`> ${agentSummary}`');
		expect(llmsRoute).toContain('## Hvornår du skal bruge LearnAI.nu');
		expect(llmsRoute).toContain("'## Optional'");
		expect(llmsRoute).toContain("'Content-Type': 'text/plain; charset=utf-8'");
	});

	it('beskriver både brugssituationer og grænser', () => {
		expect(agentUseCases.length).toBeGreaterThanOrEqual(5);
		expect(agentLimitations.length).toBeGreaterThanOrEqual(3);
		for (const useCase of agentUseCases) expect(useCase.detail.length).toBeGreaterThan(40);
	});

	it('navngiver endepunkterne på forudsigelige adresser', () => {
		const paths = agentResources.map((resource) => resource.path);
		expect(paths).toContain('/llms.txt');
		expect(paths).toContain('/sitemap.xml');
		expect(paths).toContain('/robots.txt');
		expect(agentPage).toContain('LearnAI.nu for agenter og udviklere');
		expect(robots).toContain('/llms.txt');
	});
});

describe('metadata og organisationsdata', () => {
	it('giver hver side et og:image og en og:type', () => {
		expect(siteLayout).toContain("const DEFAULT_SHARE_IMAGE = '/og-default.png'");
		expect(siteLayout).toContain('<meta property="og:image" content={shareImage} />');
		expect(siteLayout).toContain('<meta property="og:type" content={ogType} />');
		expect(siteLayout).toContain('<link rel="canonical"');
		expect(siteLayout).toContain('type="text/markdown"');
	});

	it('gør Organization verificerbar med contactPoint og address', () => {
		const graph = buildSitePageGraph({
			siteUrl: origin,
			canonicalUrl: new URL('https://learnai.nu/om'),
			title: 'Om LearnAI.nu',
			description: 'Om siden.',
		});
		const organization = graph['@graph'].find((node) => node['@type'] === 'Organization');
		expect(organization?.address).toMatchObject({ '@type': 'PostalAddress', addressCountry: 'DK' });
		const contactPoints = organization?.contactPoint as unknown as { contactType: string; email: string }[];
		expect(contactPoints.map((point) => point.contactType)).toEqual(['customer support', 'sales']);
		for (const point of contactPoints) expect(point.email).toContain('@learnai.nu');
		expect(organization?.email).toBe('kontakt@learnai.nu');
	});
});
