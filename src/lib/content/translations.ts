export type ContentLocale = 'da' | 'en';

const weeklySourceKey = /^(learnai-weekly:\d{4}:\d+:)(da|en)(:.+)$/;

/**
 * Weekly DA/EN rows share every source-key segment except the locale. Returning
 * null for other key families prevents us from inventing a translation URL.
 */
export function sourceKeyForLocale(sourceKey: string | null, locale: ContentLocale): string | null {
	if (!sourceKey) return null;
	const match = sourceKey.match(weeklySourceKey);
	return match ? `${match[1]}${locale}${match[3]}` : null;
}

export function contentPath(locale: ContentLocale, slug: string): string {
	return locale === 'en' ? `/en/learn/${slug}` : `/laer/${slug}`;
}
