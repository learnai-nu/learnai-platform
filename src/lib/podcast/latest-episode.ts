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
	week: 39,
	year: 2026,
	period: '21.–27. september 2026',
	datePublished: '2026-09-28',
	durationSeconds: 458.87,
	audioUrl: '/audio/news/2026/week-39/Podcast_Uge39_DA.mp3',
	title: 'AI-nyheder uge 39: Amazon, Muse og agenternes adgang',
	headline: 'Amazon, Muse og agenternes adgang',
	topics: [
		{
			label: 'Headlines & launches',
			title: 'Muse, Gemini og Copilot rykker tættere på handling',
			text: 'Meta, Google og Microsoft bygger syn, stemme og vedvarende arbejdsforløb ind i deres assistenter.',
			href: '/laer/uge-39-headlines-and-launches',
		},
		{
			label: 'Deep dives & analysis',
			title: 'Forskning kræver tydelige forbehold og afgrænsning',
			text: 'Enzymfund, sikkerhedstests og compute i rummet viser både mulighederne og grænserne for ugens AI-forskning.',
			href: '/laer/uge-39-deep-dives-and-analysis',
		},
		{
			label: 'Marketing',
			title: 'Amazon sætter grænsen for Metas shoppingagent',
			text: 'Muse-konflikten gør adgang til produktdata, kunderejse og platformskontrol til et konkret marketingproblem.',
			href: '/laer/uge-39-marketing',
		},
		{
			label: 'Business',
			title: 'Billigere modeller ændrer regnestykket',
			text: 'GPT-6 Sol og Luna samt Claude Opus 5.5 presser priserne, men godkendte opgaver er et bedre mål end tokens.',
			href: '/laer/uge-39-business',
		},
		{
			label: 'Education',
			title: 'Elever og lærere efterlyser fælles AI-rammer',
			text: 'Nye anbefalinger og undervisningsgreb flytter fokus fra kontrol til synlige faglige processer.',
			href: '/laer/uge-39-education',
		},
	],
};

/** "7 min." style label for a duration in seconds. */
export function formatMinutes(seconds: number): string {
	return `${Math.round(seconds / 60)} min.`;
}
