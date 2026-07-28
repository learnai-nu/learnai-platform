export function hasSameOrigin(request: Request) {
	const origin = request.headers.get('origin');
	if (!origin) return false;

	try {
		return new URL(origin).origin === new URL(request.url).origin;
	} catch {
		return false;
	}
}

export function redirectWithoutCache(location: string) {
	return new Response(null, {
		status: 303,
		headers: {
			Location: location,
			'Cache-Control': 'private, no-store, max-age=0',
		},
	});
}

export function adminStatusUrl(path: string, status: string) {
	const url = new URL(path, 'https://learnai.invalid');
	url.searchParams.set('status', status);
	return `${url.pathname}${url.search}`;
}
