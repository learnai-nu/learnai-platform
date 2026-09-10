import {
	agentLimitations,
	agentLinkSections,
	agentProtocol,
	agentResources,
	agentSummary,
	agentUseCases,
} from './guide';
import { renderSitePageMarkdown, sitePages } from '../content/site-pages';

/**
 * Markdown representations of the public pages.
 *
 * These are what an agent gets when it sends `Accept: text/markdown` (or asks
 * for `<path>.md`): the same information as the HTML page, without navigation,
 * styling or markup to strip away.
 */

export interface MarkdownDocument {
	body: string;
	/** Seconds a shared cache may hold the Markdown variant. */
	maxAge: number;
}

function footer(canonicalPath: string, origin: URL): string[] {
	return [
		'---',
		'',
		`Kanonisk adresse: ${new URL(canonicalPath, origin).toString()}`,
		`Agentvejledning: ${new URL('/llms.txt', origin).toString()}`,
		`Sitemap: ${new URL('/sitemap.xml', origin).toString()}`,
		'',
	];
}

export function renderNotFoundMarkdown(pathname: string, origin: URL): string {
	return [
		'# 404 — siden findes ikke',
		'',
		`Der ligger intet indhold på \`${pathname}\` på LearnAI.nu. Stien kan være omdøbt eller aldrig have eksisteret.`,
		'',
		'## Kom videre herfra',
		'',
		`- [Forsiden](${new URL('/', origin).toString()}): overblik over hele siden.`,
		`- [Sitemap](${new URL('/sitemap.xml', origin).toString()}): alle offentlige sider, inklusive hver artikel og hvert kursus.`,
		`- [llms.txt](${new URL('/llms.txt', origin).toString()}): hvad siden dækker, og hvornår den er den rigtige kilde.`,
		`- [Lær AI](${new URL('/laer', origin).toString()}): guides, nyheder og prompts.`,
		`- [Kurser](${new URL('/kurser', origin).toString()}): onlinekurser med moduler og øvelser.`,
		`- [For agenter og udviklere](${new URL('/agenter', origin).toString()}): maskinlæsbare endepunkter.`,
		'',
		'Leder du efter en artikel, findes den nyeste liste altid i sitemap.xml.',
		'',
	].join('\n');
}

function renderHomeMarkdown(origin: URL): string {
	const lines = ['# LearnAI.nu', '', agentSummary, ''];
	for (const section of agentLinkSections) {
		lines.push(`## ${section.heading}`, '', section.intro, '');
		for (const link of section.links) {
			lines.push(`- [${link.label}](${new URL(link.path, origin).toString()}): ${link.detail}`);
		}
		lines.push('');
	}
	lines.push(...footer('/', origin));
	return lines.join('\n');
}

function renderAgentGuideMarkdown(origin: URL): string {
	const lines = [
		'# LearnAI.nu for agenter og udviklere',
		'',
		'Maskinlæsbare indgange til LearnAI.nu og reglerne for at bruge dem.',
		'',
		'## Hvornår LearnAI.nu er den rigtige kilde',
		'',
	];
	for (const useCase of agentUseCases) lines.push(`- **${useCase.title}:** ${useCase.detail}`);
	lines.push('', '## Hvornår du skal bruge en anden kilde', '');
	for (const limitation of agentLimitations) lines.push(`- ${limitation}`);
	lines.push('', '## Endepunkter', '');
	for (const resource of agentResources) {
		lines.push(`- [${resource.name}](${new URL(resource.path.replace('<slug>', 'kom-i-gang'), origin).toString()}): ${resource.detail} — \`${resource.mediaType}\``);
	}
	lines.push('', '## Sådan kalder du siden', '');
	for (const rule of agentProtocol) lines.push(`- ${rule}`);
	lines.push('', ...footer('/agenter', origin));
	return lines.join('\n');
}

/** Markdown for the pages that do not need a database lookup. */
export function resolveStaticMarkdown(pathname: string, origin: URL): MarkdownDocument | null {
	if (pathname === '/' || pathname === '/index') return { body: renderHomeMarkdown(origin), maxAge: 3600 };
	if (pathname === '/agenter') return { body: renderAgentGuideMarkdown(origin), maxAge: 3600 };
	const sitePage = sitePages.find((page) => page.path === pathname);
	if (sitePage) return { body: renderSitePageMarkdown(sitePage, origin), maxAge: 3600 };
	return null;
}

export interface ContentItemRow {
	title: string;
	slug: string;
	type: string;
	excerpt: string | null;
	published_at?: string | null;
	updated_at?: string | null;
	body?: unknown;
}

function bodyMarkdown(body: unknown): string {
	return body && typeof body === 'object' && 'markdown' in body
		&& typeof (body as { markdown?: unknown }).markdown === 'string'
		? (body as { markdown: string }).markdown
		: '';
}

export function renderArticleMarkdown(item: ContentItemRow, origin: URL): string {
	const path = `/laer/${item.slug}`;
	const lines = [`# ${item.title}`, ''];
	if (item.excerpt) lines.push(`> ${item.excerpt}`, '');
	const meta = [
		item.published_at ? `Udgivet: ${item.published_at.slice(0, 10)}` : null,
		item.updated_at ? `Opdateret: ${item.updated_at.slice(0, 10)}` : null,
		`Type: ${item.type}`,
		'Udgiver: LearnAI.nu',
	].filter(Boolean);
	lines.push(meta.join(' · '), '');
	const markdown = bodyMarkdown(item.body);
	if (markdown) lines.push(markdown, '');
	lines.push(...footer(path, origin));
	return lines.join('\n');
}

export function renderContentIndexMarkdown(items: ContentItemRow[], origin: URL): string {
	const lines = [
		'# Lær AI — guides, nyheder og prompts',
		'',
		'Alt publiceret læringsindhold på LearnAI.nu. Hver side svarer også i Markdown via `Accept: text/markdown` eller ved at tilføje `.md` til stien.',
		'',
	];
	for (const item of items) {
		const url = new URL(`/laer/${item.slug}`, origin).toString();
		lines.push(`- [${item.title}](${url})${item.excerpt ? `: ${item.excerpt}` : ''}`);
	}
	if (items.length === 0) lines.push('- Ingen publicerede sider lige nu.');
	lines.push('', ...footer('/laer', origin));
	return lines.join('\n');
}

export interface CourseRow {
	title: string;
	slug: string;
	description: string | null;
	level?: string | null;
	estimated_minutes?: number | null;
	price_dkk?: number | null;
}

export function renderCourseIndexMarkdown(courses: CourseRow[], origin: URL): string {
	const lines = [
		'# Kurser på LearnAI.nu',
		'',
		'Praktiske onlinekurser på dansk med moduler, lektioner og øvelser.',
		'',
	];
	for (const course of courses) {
		const url = new URL(`/kurser/${course.slug}`, origin).toString();
		const facts = [
			course.level ? `niveau: ${course.level}` : null,
			typeof course.estimated_minutes === 'number' ? `${course.estimated_minutes} min.` : null,
			typeof course.price_dkk === 'number' ? (course.price_dkk === 0 ? 'gratis' : `${course.price_dkk} DKK`) : null,
		].filter(Boolean).join(', ');
		lines.push(`- [${course.title}](${url})${course.description ? `: ${course.description}` : ''}${facts ? ` (${facts})` : ''}`);
	}
	if (courses.length === 0) lines.push('- Ingen publicerede kurser lige nu.');
	lines.push('', ...footer('/kurser', origin));
	return lines.join('\n');
}

export function renderCourseMarkdown(
	course: CourseRow,
	modules: { title: string; description?: string | null; lessons: { title: string; estimated_minutes?: number | null }[] }[],
	origin: URL,
): string {
	const path = `/kurser/${course.slug}`;
	const lines = [`# ${course.title}`, ''];
	if (course.description) lines.push(`> ${course.description}`, '');
	const facts = [
		course.level ? `Niveau: ${course.level}` : null,
		typeof course.estimated_minutes === 'number' ? `Varighed: ${course.estimated_minutes} minutter` : null,
		typeof course.price_dkk === 'number' ? `Pris: ${course.price_dkk === 0 ? 'gratis' : `${course.price_dkk} DKK`}` : null,
	].filter(Boolean);
	if (facts.length) lines.push(facts.join(' · '), '');
	if (modules.length) {
		lines.push('## Indhold', '');
		for (const module of modules) {
			lines.push(`### ${module.title}`, '');
			if (module.description) lines.push(module.description, '');
			for (const lesson of module.lessons) {
				const minutes = typeof lesson.estimated_minutes === 'number' ? ` (${lesson.estimated_minutes} min.)` : '';
				lines.push(`- ${lesson.title}${minutes}`);
			}
			lines.push('');
		}
	}
	lines.push(...footer(path, origin));
	return lines.join('\n');
}
