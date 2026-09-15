import { defineMiddleware } from 'astro:middleware';

/**
 * Permanent orphan redirect: /articles/<slug> → /laer/<same-slug>.
 * Missing Danish content at the destination remains a real 404.
 * Exact /articles and /articles/ stay in astro.config.mjs static redirects.
 */
export const onRequest = defineMiddleware((context, next) => {
	const { pathname } = context.url;
	const match = pathname.match(/^\/articles\/(.+)$/);
	if (!match) {
		return next();
	}

	const slug = match[1].replace(/\/+$/, '');
	if (!slug) {
		// Trailing-slash-only /articles/ is covered by static config redirect.
		return next();
	}

	// Explicit Response keeps the status code at 301 on the deployed SSR path.
	return new Response(null, {
		status: 301,
		headers: { Location: `/laer/${slug}` },
	});
});
