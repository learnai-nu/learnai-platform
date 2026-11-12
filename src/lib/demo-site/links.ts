/**
 * The public root is the closed logo page, so inside the private demo every
 * link "home" has to point at /demo-site instead. The middleware marks demo
 * requests with `locals.demoSite`.
 */
export function homePath(locals: App.Locals, locale: 'da' | 'en' = 'da') {
	if (locals.demoSite) return locale === 'en' ? '/demo-site/en' : '/demo-site';
	return locale === 'en' ? '/en' : '/';
}

/** Breadcrumbs and buttons pass '/' for "Forside"; map it to the right home. */
export function resolveHomeLink(url: string, locals: App.Locals) {
	return url === '/' ? homePath(locals) : url;
}
