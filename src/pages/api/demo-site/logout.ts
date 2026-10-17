import type { APIRoute } from 'astro';
import { hasSameOrigin, redirectWithoutCache } from '../../../lib/admin/security';
import { DEMO_COOKIE_NAME } from '../../../lib/demo-site/access';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!hasSameOrigin(request)) return new Response('Forbidden', { status: 403 });
	cookies.delete(DEMO_COOKIE_NAME, { path: '/' });
	return redirectWithoutCache('/demo-site');
};
