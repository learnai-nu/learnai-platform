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
	week: 45,
	year: 2026,
	period: '2.–8. november 2026',
	datePublished: '2026-11-09',
	durationSeconds: 223.503673,
	audioUrl: '/audio/news/2026/week-45/Podcast_Uge45_DA.mp3',
	title: 'AI-nyheder uge 45: Når shoppingagenten køber forkert',
	headline: 'Når shoppingagenten køber forkert',
	topics: [
		{
			label: 'Headlines & launches',
			title: 'Billeder, video og en model til sikkerhedsfolk',
			text: 'OpenAI lancerede Images 2.6 og GPT-6 Cyber med begrænset adgang, og Google gjorde Gemini Omni 1.2 Flash bredt tilgængelig til video.',
			href: '/laer/uge-45-headlines-and-launches',
		},
		{
			label: 'Deep dives & analysis',
			title: 'Når shoppingagenten køber forkert',
			text: 'I Visas test fejlede 22 modeller i 42,8 % af forsøgene – og i over halvdelen af fejlene købte agenten alligevel.',
			href: '/laer/uge-45-deep-dives-and-analysis',
		},
		{
			label: 'Marketing',
			title: 'Kampagnen bygges i Claude – men sættes på pause',
			text: 'Supermetrics lader Claude oprette annoncekampagner, men intet går live, før et menneske har godkendt.',
			href: '/laer/uge-45-marketing',
		},
		{
			label: 'Business',
			title: 'Agenterne sprænger budgettet',
			text: 'Virksomheder brugte 2,5 gange mere på AI end budgetteret, mens kun 13 % af it-direktørerne ser betydelig værdi.',
			href: '/laer/uge-45-business',
		},
	],
};

/** "7 min." style label for a duration in seconds. */
export function formatMinutes(seconds: number): string {
	return `${Math.round(seconds / 60)} min.`;
}
