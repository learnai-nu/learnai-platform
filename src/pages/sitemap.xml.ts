import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../lib/supabase/server';

export const prerender = false;

/**
 * The catalogues live in Supabase and the public routes render on demand, so
 * the sitemap is generated from the database rather than from the file tree.
 */
interface SitemapEntry {
	path: string;
	lastModified?: string | null;
	changeFrequency?: 'daily' | 'weekly' | 'monthly';
	priority?: string;
}

const staticEntries: SitemapEntry[] = [
	{ path: '/', changeFrequency: 'weekly', priority: '1.0' },
	{ path: '/laer', changeFrequency: 'daily', priority: '0.9' },
	{ path: '/kurser', changeFrequency: 'weekly', priority: '0.9' },
	{ path: '/tools', changeFrequency: 'weekly', priority: '0.8' },
	{ path: '/use-cases', changeFrequency: 'weekly', priority: '0.7' },
	{ path: '/resources', changeFrequency: 'weekly', priority: '0.7' },
	{ path: '/events', changeFrequency: 'weekly', priority: '0.6' },
	{ path: '/mentor', changeFrequency: 'monthly', priority: '0.6' },
	{ path: '/virksomheder', changeFrequency: 'monthly', priority: '0.8' },
	{ path: '/arbejdskompas', changeFrequency: 'monthly', priority: '0.6' },
	{ path: '/om', changeFrequency: 'monthly', priority: '0.5' },
	{ path: '/agenter', changeFrequency: 'monthly', priority: '0.5' },
	{ path: '/kontakt', changeFrequency: 'monthly', priority: '0.4' },
	{ path: '/nyheder', changeFrequency: 'weekly', priority: '0.5' },
	{ path: '/privatliv', changeFrequency: 'monthly', priority: '0.2' },
	{ path: '/en/tools', changeFrequency: 'weekly', priority: '0.5' },
	{ path: '/en/use-cases', changeFrequency: 'weekly', priority: '0.4' },
	{ path: '/en/resources', changeFrequency: 'weekly', priority: '0.4' },
	{ path: '/en/events', changeFrequency: 'weekly', priority: '0.4' },
];

function escapeXml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function renderEntry(entry: SitemapEntry, origin: URL) {
	const location = escapeXml(new URL(entry.path, origin).toString());
	const lastModified = entry.lastModified ? new Date(entry.lastModified) : null;
	const isValidDate = lastModified && !Number.isNaN(lastModified.getTime());
	return [
		'\t<url>',
		`\t\t<loc>${location}</loc>`,
		isValidDate ? `\t\t<lastmod>${lastModified.toISOString().slice(0, 10)}</lastmod>` : '',
		entry.changeFrequency ? `\t\t<changefreq>${entry.changeFrequency}</changefreq>` : '',
		entry.priority ? `\t\t<priority>${entry.priority}</priority>` : '',
		'\t</url>',
	].filter(Boolean).join('\n');
}

export const GET: APIRoute = async ({ request, cookies, site, url }) => {
	const origin = site ? new URL(site) : new URL('/', url);
	const supabase = createServerSupabaseClient(request, cookies);

	// Only routes that actually resolve: the tool, use-case, resource and event
	// catalogues are single pages, not one page per row.
	const [content, courses] = await Promise.all([
		supabase.from('content_items').select('slug,updated_at').eq('status', 'published'),
		supabase.from('courses').select('slug,updated_at').eq('status', 'published'),
	]);

	const entries: SitemapEntry[] = [
		...staticEntries,
		...(content.data ?? []).map((row) => ({
			path: `/laer/${row.slug}`,
			lastModified: row.updated_at,
			changeFrequency: 'monthly' as const,
			priority: '0.8',
		})),
		...(courses.data ?? []).map((row) => ({
			path: `/kurser/${row.slug}`,
			lastModified: row.updated_at,
			changeFrequency: 'monthly' as const,
			priority: '0.8',
		})),
	];

	const body = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...entries.map((entry) => renderEntry(entry, origin)),
		'</urlset>',
		'',
	].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=600, s-maxage=3600',
		},
	});
};
