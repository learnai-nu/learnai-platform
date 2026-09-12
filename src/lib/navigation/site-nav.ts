/**
 * Single source of truth for the public navigation.
 *
 * The desktop header, the mobile dock and the mobile drawer all read from here,
 * so a link only has to be added once and internal linking stays consistent
 * across every surface (which is what search engines reward).
 */

export interface NavItem {
	label: string;
	description: string;
	href?: string;
	/** Route prefix used to decide whether the item is the current page. */
	section?: string;
	/** Optional `?type=` value that further narrows the active state. */
	type?: string;
}

export interface NavGroup {
	label: string;
	intro: string;
	items: NavItem[];
}

export const menuGroups: NavGroup[] = [
	{
		label: 'Lær AI',
		intro: 'Viden, nyheder og fordybelse samlet efter det, du vil lære.',
		items: [
			{ label: 'Artikler & guides', description: 'Trin-for-trin og forklaringer', href: '/laer', section: '/laer', type: 'knowledge' },
			{ label: 'Nyheder & indsigt', description: 'Det vigtigste fra AI-verdenen', href: '/laer?type=news', section: '/laer', type: 'news' },
			{ label: 'Ugebrief & podcast', description: 'Ugens overblik direkte i indbakken', href: '/ugebrief', section: '/ugebrief' },
			{ label: 'Research', description: 'Undersøgelser og dokumentation' },
			{ label: 'Events', description: 'Konferencer og meetups', href: '/events', section: '/events' },
			{ label: 'Ressourcer', description: 'Podcasts, bøger og kanaler', href: '/resources', section: '/resources' },
		],
	},
	{
		label: 'Brug AI',
		intro: 'Fra den første prompt til konkrete arbejdsgange og det rigtige værktøj.',
		items: [
			{ label: 'AI Mentor', description: 'Få hjælp til dit næste skridt', href: '/mentor', section: '/mentor' },
			{ label: 'Prompts', description: 'Skabeloner, du kan bruge direkte', href: '/laer?type=prompt', section: '/laer', type: 'prompt' },
			{ label: 'Værktøjer', description: 'Find AI-værktøjet til opgaven', href: '/tools', section: '/tools' },
			{ label: 'Eksempler fra praksis', description: 'Se hvordan andre bruger AI', href: '/use-cases', section: '/use-cases' },
		],
	},
	{
		label: 'Kurser',
		intro: 'Korte, praktiske forløb med progression og øvelser.',
		items: [
			{ label: 'Alle kurser', description: 'Se hele kursuskataloget', href: '/kurser', section: '/kurser', type: 'all-courses' },
			{ label: 'Gratis AI-kursus', description: 'Kom godt i gang med AI', href: '/kurser/ai-i-praksis', section: '/kurser/ai-i-praksis' },
			{ label: 'Mine kurser', description: 'Fortsæt, hvor du slap', href: '/dashboard', section: '/dashboard' },
		],
	},
];

/** The primary CTA reused by header, dock and drawer. */
export const primaryCta = {
	label: 'Start gratis',
	href: '/kurser/ai-i-praksis-dit-foerste-kursus',
} as const;

export type DockIcon = 'learn' | 'courses' | 'tools' | 'start' | 'menu';

export interface DockItem {
	label: string;
	icon: DockIcon;
	href?: string;
	section?: string;
	type?: string;
}

/**
 * The thumb-reachable bar at the bottom of the mobile viewport. Four
 * destinations plus the menu — more than that and the targets get too small.
 */
export const dockItems: DockItem[] = [
	{ label: 'Lær AI', icon: 'learn', href: '/laer', section: '/laer' },
	{ label: 'Kurser', icon: 'courses', href: '/kurser', section: '/kurser' },
	{ label: primaryCta.label, icon: 'start', href: primaryCta.href, section: primaryCta.href },
	{ label: 'Værktøjer', icon: 'tools', href: '/tools', section: '/tools' },
	{ label: 'Menu', icon: 'menu' },
];

/**
 * The person behind LearnAI, shown at the top of the mobile drawer.
 *
 * Trust is the first thing a visitor looks for on a learning site, so the
 * profile sits above the navigation itself — and it feeds the `Person` node in
 * the structured data, so the same claim is machine-readable.
 */
export const siteAuthor = {
	name: 'Jesper Schneider',
	role: 'Digital forretningsudvikling & AI-strategi',
	summary: 'Står bag LearnAI og har arbejdet med digitalisering i 16+ år.',
	href: '/om',
	initials: 'JS',
	/** Optional portrait. Drop a file at this path in `public/` to show it. */
	image: '/om/jesper-schneider.jpg',
	sameAs: ['https://www.linkedin.com/in/jesperschneider/'],
	/** Credentials rendered as badges and as `hasCredential` in the Person node. */
	credentials: ['AI-strategi', 'Digital forretningsudvikling', 'E-commerce'],
	/** Topical authority signals for the `knowsAbout` property. */
	knowsAbout: [
		'Kunstig intelligens',
		'Generativ AI',
		'Prompt engineering',
		'AI-strategi',
		'Digital transformation',
		'Kompetenceudvikling',
	],
} as const;

export interface ActiveStateInput {
	pathname: string;
	/** Value of the `type` search parameter on the current request. */
	currentType?: string | null;
}

export function isNavItemActive(item: NavItem | DockItem, { pathname, currentType }: ActiveStateInput): boolean {
	if (!item.section) return false;
	const inSection = pathname === item.section || pathname.startsWith(`${item.section}/`);
	if (!inSection) return false;
	if (item.type === 'knowledge') return !currentType || ['knowledge', 'article', 'guide'].includes(currentType);
	if (item.type === 'prompt' || item.type === 'news') return currentType === item.type;
	if (item.type === 'all-courses') return pathname === '/kurser';
	return true;
}

export function isNavGroupActive(group: NavGroup, state: ActiveStateInput): boolean {
	return group.items.some((item) => isNavItemActive(item, state));
}
