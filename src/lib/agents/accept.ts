/**
 * Accept-header negotiation for agents.
 *
 * The site answers the same URL with HTML for people and Markdown for agents,
 * following acceptmarkdown.com: a request that prefers `text/markdown` gets a
 * Markdown representation, and every negotiated response carries `Vary: Accept`
 * so a CDN cannot hand the HTML variant to an agent (or the other way round).
 */

export const MARKDOWN_CONTENT_TYPE = 'text/markdown; charset=utf-8';
export const MARKDOWN_VARY = 'Accept, Accept-Encoding';

interface AcceptEntry {
	type: string;
	quality: number;
}

/** Parses an Accept header into media types with their q-values, best first. */
export function parseAcceptHeader(header: string | null | undefined): AcceptEntry[] {
	if (!header) return [];
	return header
		.split(',')
		.map((part) => {
			const [rawType, ...parameters] = part.split(';').map((value) => value.trim());
			if (!rawType) return null;
			const qualityParameter = parameters.find((value) => value.toLowerCase().startsWith('q='));
			const parsed = qualityParameter ? Number.parseFloat(qualityParameter.slice(2)) : 1;
			const quality = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 1;
			return { type: rawType.toLowerCase(), quality };
		})
		.filter((entry): entry is AcceptEntry => entry !== null && entry.quality > 0)
		.sort((a, b) => b.quality - a.quality);
}

function qualityFor(entries: AcceptEntry[], mediaType: string): number {
	const [group] = mediaType.split('/');
	let best = 0;
	for (const entry of entries) {
		if (entry.type === mediaType || entry.type === `${group}/*`) {
			best = Math.max(best, entry.quality);
		}
	}
	return best;
}

const MARKDOWN_TYPES = ['text/markdown', 'text/x-markdown'];

/** True when the client explicitly asks for Markdown at least as strongly as HTML. */
export function prefersMarkdown(header: string | null | undefined): boolean {
	const entries = parseAcceptHeader(header);
	if (entries.length === 0) return false;
	const markdownQuality = Math.max(...MARKDOWN_TYPES.map((type) => qualityFor(entries, type)), 0);
	if (markdownQuality === 0) return false;
	return markdownQuality >= qualityFor(entries, 'text/html');
}

/**
 * True when the client explicitly asks for an HTML document — which is what a
 * browser does on navigation. A wildcard-only Accept header (curl, most agents)
 * does not count: such a client is better served the Markdown variant.
 */
export function expectsHtmlDocument(header: string | null | undefined): boolean {
	const entries = parseAcceptHeader(header);
	return entries.some(
		(entry) => entry.type === 'text/html' || entry.type === 'application/xhtml+xml',
	);
}

/** Adds `Accept` to an existing Vary header without dropping what is already there. */
export function withAcceptVary(existing: string | null | undefined): string {
	const values = (existing ?? '')
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean);
	for (const required of ['Accept', 'Accept-Encoding']) {
		if (!values.some((value) => value.toLowerCase() === required.toLowerCase())) values.push(required);
	}
	return values.join(', ');
}

/** `/laer/x.md` and `/laer/x` address the same resource; agents may use either. */
export function stripMarkdownSuffix(pathname: string): string | null {
	if (!pathname.endsWith('.md') || pathname === '.md') return null;
	const stripped = pathname.slice(0, -3);
	return stripped === '' ? '/' : stripped;
}
