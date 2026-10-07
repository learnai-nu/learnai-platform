import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * LearnAI is closed. Crawlers may still fetch old addresses, so they see the
 * 301 to the front page and drop them from the index.
 */
export const GET: APIRoute = () => {
	const body = [
		'User-agent: *',
		'Allow: /',
		'Disallow: /admin',
		'Disallow: /api/',
		'Disallow: /auth/',
		'Disallow: /login',
		'',
	].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
