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
	week: 41,
	year: 2026,
	period: '5.–11. oktober 2026',
	datePublished: '2026-10-12',
	durationSeconds: 501.159184,
	audioUrl: '/audio/news/2026/week-41/Podcast_Uge41_DA.mp3',
	title: 'AI-nyheder uge 41: Priskrigen og nødbremsen',
	headline: 'Priskrigen og nødbremsen',
	topics: [
		{
			label: 'Headlines & launches',
			title: 'Prisen faldt, og vægtene blev åbnet',
			text: 'Anthropic skar prisen på sin lille model med op til 90 %, OpenAI gav alle ChatGPT-brugere GPT-6, og to åbne storemodeller landede inden for to dage.',
			href: '/laer/uge-41-headlines-and-launches',
		},
		{
			label: 'Deep dives & analysis',
			title: 'Nødbremsen, der kom samtidig med prisfaldet',
			text: 'Nadella bad branchen om at behandle modeller som insidertrusler i samme uge, som agentkørsel blev 75 % billigere.',
			href: '/laer/uge-41-deep-dives-and-analysis',
		},
		{
			label: 'Marketing',
			title: 'Agenten køber ind, og målingen løber bagefter',
			text: 'Måling på ChatGPT-annoncer, agent-checkout i luften og kun hver tredje amerikanske webshop klar til en indkøbende agent.',
			href: '/laer/uge-41-marketing',
		},
		{
			label: 'Business',
			title: 'Priskrigen gør business casen om',
			text: 'Op til 90 % lavere pris på høj-volumen-modeller og 320 mio. dollar til tidlige AI-selskaber ændrer, hvad der kan betale sig.',
			href: '/laer/uge-41-business',
		},
	],
};

/** "7 min." style label for a duration in seconds. */
export function formatMinutes(seconds: number): string {
	return `${Math.round(seconds / 60)} min.`;
}
