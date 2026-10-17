import { defineMiddleware } from 'astro:middleware';
import { DEMO_COOKIE_NAME, DEMO_REWRITE_HEADER, isValidDemoCookie } from './lib/demo-site/access';

const STATIC_ASSET = /\.(?:avif|css|gif|ico|jpe?g|js|json|m4a|mp3|png|svg|webmanifest|webp|woff2?)$/i;
const INTERNAL_PREFIXES = ['/admin', '/api/admin', '/auth', '/login'];

function redirect(location: string, status = 302) {
	return new Response(null, {
		status,
		headers: {
			Location: location,
			'Cache-Control': 'private, no-store, max-age=0',
			'X-Robots-Tag': 'noindex, nofollow, noarchive',
		},
	});
}

function addPrivateHeaders(response: Response) {
	const headers = new Headers(response.headers);
	headers.set('Cache-Control', 'private, no-store, max-age=0');
	headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
	return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname, search } = context.url;

	if (
		pathname === '/' ||
		pathname === '/robots.txt' ||
		pathname === '/favicon.ico' ||
		pathname === '/favicon.svg' ||
		pathname.startsWith('/_astro/') ||
		STATIC_ASSET.test(pathname)
	) {
		return next();
	}

	if (context.request.headers.get(DEMO_REWRITE_HEADER) === '1') {
		return addPrivateHeaders(await next());
	}

	if (INTERNAL_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
		return next();
	}

	if (pathname === '/api/demo-site/login' || pathname === '/api/demo-site/logout') {
		return next();
	}

	if (pathname === '/demo-site' || pathname === '/demo-site/') {
		return addPrivateHeaders(await next());
	}

	const authorized = isValidDemoCookie(context.cookies.get(DEMO_COOKIE_NAME)?.value);

	if (pathname.startsWith('/demo-site/')) {
		if (!authorized) return redirect('/demo-site?status=required');
		return addPrivateHeaders(await next());
	}

	if (pathname.startsWith('/api/')) {
		return authorized ? addPrivateHeaders(await next()) : new Response('Not found', { status: 404 });
	}

	if (authorized) return redirect(`/demo-site${pathname}${search}`, 307);
	return redirect('/');
});
