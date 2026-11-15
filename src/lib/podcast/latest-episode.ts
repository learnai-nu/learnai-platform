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
	week: 43,
	year: 2026,
	period: '19.–25. oktober 2026',
	datePublished: '2026-10-26',
	durationSeconds: 336.195918,
	audioUrl: '/audio/news/2026/week-43/Podcast_Uge43_DA.mp3',
	title: 'AI-nyheder uge 43: Når AI skal beslutte, ikke skrive',
	headline: 'Når AI skal beslutte, ikke skrive',
	topics: [
		{
			label: 'Headlines & launches',
			title: 'En model på 3 billioner parametre og en stemme fra EU',
			text: 'Moonshot frigav Kimi K3.1 Pro, Mistral lancerede Voxtral 3 med EU-hosting, og Canva fik sin egen billedmodel.',
			href: '/laer/uge-43-headlines-and-launches',
		},
		{
			label: 'Deep dives & analysis',
			title: 'Når AI skal beslutte, ikke skrive',
			text: 'Decision models svarer med en sandsynlighed i stedet for tekst – og gør det muligt at styre, hvornår et menneske tager over.',
			href: '/laer/uge-43-deep-dives-and-analysis',
		},
		{
			label: 'Marketing',
			title: 'Butiksvinduet flytter ind i AI-assistenten',
			text: 'Zillow i Claude, brandbøger som datakilde og en agent, der måler, hvad AI siger om jer.',
			href: '/laer/uge-43-marketing',
		},
		{
			label: 'Business',
			title: 'To slags milliarder',
			text: 'Tenstorrent, Flapping Airplanes og Legora rejste milliarder af vidt forskellige grunde, og Salesforce køber Braze.',
			href: '/laer/uge-43-business',
		},
	],
};

/** "7 min." style label for a duration in seconds. */
export function formatMinutes(seconds: number): string {
	return `${Math.round(seconds / 60)} min.`;
}
