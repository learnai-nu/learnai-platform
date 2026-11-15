/**
 * The current weekly podcast episode — the single place to update each week.
 *
 * Read by /podcast and by the homepage's "Denne uge" section, so the week
 * number, audio file and the week's four reading tracks never drift apart.
 */

export interface EpisodeTopic {
	label: string;
	title: string;
	text: string;
	href: string;
}

export interface WeeklyEpisode {
	week: number;
	year: number;
	period: string;
	datePublished: string;
	durationSeconds: number;
	audioUrl: string;
	/** Full episode title used in structured data and the player. */
	title: string;
	/** The editorial headline shown on the page. */
	headline: string;
	topics: EpisodeTopic[];
}

export const latestEpisode: WeeklyEpisode = {
	week: 44,
	year: 2026,
	period: '26. oktober–1. november 2026',
	datePublished: '2026-11-02',
	durationSeconds: 295.601633,
	audioUrl: '/audio/news/2026/week-44/Podcast_Uge44_DA.mp3',
	title: 'AI-nyheder uge 44: Den stærkeste model får du ikke – endnu',
	headline: 'Den stærkeste model får du ikke – endnu',
	topics: [
		{
			label: 'Headlines & launches',
			title: 'Billigere til de mange, låst til de få',
			text: 'GPT-6.1 Terra halverede prisen, mens Gemini 4 Carbon blev holdt forbeholdt udvalgte forsvarere mod cyberangreb.',
			href: '/laer/uge-44-headlines-and-launches',
		},
		{
			label: 'Deep dives & analysis',
			title: 'Den stærkeste model får du ikke – endnu',
			text: 'Modeller med evner til både forsvar og angreb rulles nu gradvist ud – først til forsvarere og forskere.',
			href: '/laer/uge-44-deep-dives-and-analysis',
		},
		{
			label: 'Marketing',
			title: 'AI læser det, andre skriver om jer',
			text: 'Over 84 % af AI-assistenternes citater kommer fra omtale, brands hverken ejer eller betaler for.',
			href: '/laer/uge-44-marketing',
		},
		{
			label: 'Business',
			title: 'Europa satser på egen AI',
			text: 'Cohere åbnede en runde på op til 7 mia. canadiske dollar med Schwarz-koncernen, og Fractile rejste 720 mio. dollar til chips.',
			href: '/laer/uge-44-business',
		},
	],
};

/** "7 min." style label for a duration in seconds. */
export function formatMinutes(seconds: number): string {
	return `${Math.round(seconds / 60)} min.`;
}
