import type { APIRoute } from 'astro';
import { hasSameOrigin, redirectWithoutCache } from '../../../lib/admin/security';
import { createDemoCookieValue, DEMO_COOKIE_NAME, verifyDemoPassword } from '../../../lib/demo-site/access';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!hasSameOrigin(request)) return new Response('Forbidden', { status: 403 });
	const formData = await request.formData();
	const password = formData.get('password');
	if (typeof password !== 'string') return redirectWithoutCache('/demo-site?status=invalid');

	try {
		if (!verifyDemoPassword(password)) return redirectWithoutCache('/demo-site?status=invalid');
		cookies.set(DEMO_COOKIE_NAME, createDemoCookieValue(), {
			httpOnly: true,
			secure: import.meta.env.PROD,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7,
		});
		return redirectWithoutCache('/demo-site');
	} catch {
		return redirectWithoutCache('/demo-site?status=config-error');
	}
};
