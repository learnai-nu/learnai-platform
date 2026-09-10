import type { APIContext } from 'astro';
import { defineMiddleware } from 'astro:middleware';
import {
	MARKDOWN_CONTENT_TYPE,
	MARKDOWN_VARY,
	expectsHtmlDocument,
	prefersMarkdown,
	stripMarkdownSuffix,
	withAcceptVary,
} from './lib/agents/accept';
import {
	renderArticleMarkdown,
	renderContentIndexMarkdown,
	renderCourseIndexMarkdown,
	renderCourseMarkdown,
	renderNotFoundMarkdown,
	resolveStaticMarkdown,
	type MarkdownDocument,
} from './lib/agents/markdown-resources';
import { createServerSupabaseClient } from './lib/supabase/server';

/**
 * Content negotiation for agents.
 *
 * The same URL answers with HTML for people and Markdown for agents that send
 * `Accept: text/markdown` (acceptmarkdown.com), or that append `.md` to the
 * path. Every negotiable response carries `Vary: Accept, Accept-Encoding`, so a
 * cache cannot serve the HTML variant to an agent that asked for Markdown.
 */

/** Private and machine surfaces never negotiate. */
const EXCLUDED_PREFIXES = ['/api/', '/auth/', '/admin', '/dashboard', '/login', '/_'];

function isNegotiablePath(pathname: string): boolean {
	if (EXCLUDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))) return false;
	return !/\.(xml|txt|json|ico|svg|png|jpg|jpeg|webp|avif|css|js|map|woff2?)$/i.test(pathname);
}

function markdownResponse(document: MarkdownDocument, status = 200): Response {
	return new Response(document.body, {
		status,
		headers: {
			'Content-Type': MARKDOWN_CONTENT_TYPE,
			'Cache-Control': `public, max-age=${document.maxAge}`,
			Vary: MARKDOWN_VARY,
		},
	});
}

async function resolveMarkdown(
	pathname: string,
	origin: URL,
	context: APIContext,
): Promise<MarkdownDocument | null> {
	const staticDocument = resolveStaticMarkdown(pathname, origin);
	if (staticDocument) return staticDocument;

	const articleMatch = /^\/laer\/([^/]+)$/.exec(pathname);
	const courseMatch = /^\/kurser\/([^/]+)$/.exec(pathname);
	if (pathname !== '/laer' && pathname !== '/kurser' && !articleMatch && !courseMatch) return null;

	let supabase: ReturnType<typeof createServerSupabaseClient>;
	try {
		supabase = createServerSupabaseClient(context.request, context.cookies);
	} catch {
		// Without Supabase configured there is nothing to render; fall back to HTML.
		return null;
	}

	if (pathname === '/laer') {
		const { data } = await supabase
			.from('content_items')
			.select('title,slug,type,excerpt,published_at,updated_at')
			.eq('status', 'published')
			.order('published_at', { ascending: false })
			.limit(200);
		if (!data) return null;
		return { body: renderContentIndexMarkdown(data, origin), maxAge: 900 };
	}

	if (pathname === '/kurser') {
		const { data } = await supabase
			.from('courses')
			.select('title,slug,description,level,estimated_minutes,price_dkk')
			.eq('status', 'published')
			.order('title');
		if (!data) return null;
		return { body: renderCourseIndexMarkdown(data, origin), maxAge: 900 };
	}

	if (articleMatch) {
		const { data } = await supabase
			.from('content_items')
			.select('title,slug,type,excerpt,body,published_at,updated_at')
			.eq('slug', articleMatch[1])
			.eq('status', 'published')
			.maybeSingle();
		if (!data) return null;
		return { body: renderArticleMarkdown(data, origin), maxAge: 900 };
	}

	if (courseMatch) {
		const { data: course } = await supabase
			.from('courses')
			.select('id,title,slug,description,level,estimated_minutes,price_dkk')
			.eq('slug', courseMatch[1])
			.eq('status', 'published')
			.maybeSingle();
		if (!course) return null;
		const { data: modules } = await supabase
			.from('course_modules')
			.select('title,description,sort_order,lessons(title,estimated_minutes,sort_order)')
			.eq('course_id', course.id)
			.order('sort_order');
		const sortedModules = (modules ?? []).map((module) => ({
			title: module.title,
			description: module.description,
			lessons: [...module.lessons].sort((a, b) => a.sort_order - b.sort_order),
		}));
		return { body: renderCourseMarkdown(course, sortedModules, origin), maxAge: 900 };
	}

	return null;
}

export const onRequest = defineMiddleware(async (context, next) => {
	const { request } = context;
	const origin = new URL('/', context.site ?? context.url);
	const isRead = request.method === 'GET' || request.method === 'HEAD';
	const suffixPath = stripMarkdownSuffix(context.url.pathname);
	const pathname = suffixPath ?? context.url.pathname;
	// Prerendered routes are static files at runtime and carry no request, so
	// there is nothing to negotiate — and reading the header during the build
	// would only produce a warning.
	const accept = context.isPrerendered ? null : request.headers.get('accept');
	const wantsMarkdown = Boolean(suffixPath) || prefersMarkdown(accept);

	if (isRead && isNegotiablePath(pathname) && wantsMarkdown) {
		const document = await resolveMarkdown(pathname, origin, context);
		if (document) return markdownResponse(document);
		if (suffixPath) {
			// `.md` on an unknown path is a miss, not a redirect to the HTML page.
			return markdownResponse(
				{ body: renderNotFoundMarkdown(context.url.pathname, origin), maxAge: 0 },
				404,
			);
		}
	}

	const response = await next();

	if (!isRead || !isNegotiablePath(pathname)) return response;

	const contentType = response.headers.get('content-type') ?? '';
	if (!contentType.includes('text/html')) return response;

	// A 404 reaching a non-browser client is far more useful as Markdown: it can
	// read the recovery links instead of parsing an error page.
	if (response.status === 404 && (wantsMarkdown || !expectsHtmlDocument(accept))) {
		return markdownResponse(
			{ body: renderNotFoundMarkdown(context.url.pathname, origin), maxAge: 0 },
			404,
		);
	}

	const headers = new Headers(response.headers);
	headers.set('Vary', withAcceptVary(headers.get('Vary')));
	headers.append(
		'Link',
		`<${new URL('/llms.txt', origin).toString()}>; rel="alternate"; type="text/plain"; title="llms.txt"`,
	);
	if (response.status === 200) {
		const markdownUrl = new URL(`${pathname === '/' ? '/index' : pathname}.md`, origin).toString();
		headers.append('Link', `<${markdownUrl}>; rel="alternate"; type="text/markdown"`);
	}
	return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
});
