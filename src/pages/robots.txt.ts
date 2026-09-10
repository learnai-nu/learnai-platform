import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Keeps the signed-in surfaces and the search page out of the index, and points
 * crawlers at the generated sitemap.
 */
export const GET: APIRoute = ({ site, url }) => {
	const origin = site ? new URL(site) : new URL('/', url);
	const body = [
		'User-agent: *',
		'Allow: /',
		'Disallow: /admin',
		'Disallow: /api/',
		'Disallow: /auth/',
		'Disallow: /dashboard',
		'Disallow: /login',
		'Disallow: /search',
		'',
		`Sitemap: ${new URL('/sitemap.xml', origin).toString()}`,
		'',
	].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
