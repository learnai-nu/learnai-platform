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
	week: 40,
	year: 2026,
	period: '28. september–4. oktober 2026',
	datePublished: '2026-10-05',
	durationSeconds: 476.582902,
	audioUrl: '/audio/news/2026/week-40/Podcast_Uge40_DA.m4a',
	title: 'AI-nyheder uge 40: Dots og kontrollen med handlende agenter',
	headline: 'Dots og kontrollen med handlende agenter',
	topics: [
		{
			label: 'Headlines & launches',
			title: 'Dots gør den vedvarende agent til arbejdsflade',
			text: 'OpenAI, Google og Anthropic flytter fokus fra chat til længerevarende arbejde, værktøjer og driftsøkonomi.',
			href: '/laer/uge-40-headlines-and-launches',
		},
		{
			label: 'Deep dives & analysis',
			title: 'Sikkerheden skal ligge rundt om agenten',
			text: 'Australien-forløbet, Nvidias sikkerhedsplatform og en frivillig amerikansk pagt viser behovet for eksterne kontrolmekanismer.',
			href: '/laer/uge-40-deep-dives-and-analysis',
		},
		{
			label: 'Marketing',
			title: 'Godkendelsesporten bliver vigtigere end flere kladder',
			text: 'Videoagenter, AI-synlighed og marketingautomation kræver tydelig identitet, måling og menneskelig godkendelse.',
			href: '/laer/uge-40-marketing',
		},
		{
			label: 'Business',
			title: 'Agentøkonomien flytter risiko til kapital og handling',
			text: 'Anthropics børsproces, Robinhood-agenter og store infrastrukturinvesteringer gør incitamenter og dokumenteret afkast centrale.',
			href: '/laer/uge-40-business',
		},
	],
};

/** "7 min." style label for a duration in seconds. */
export function formatMinutes(seconds: number): string {
	return `${Math.round(seconds / 60)} min.`;
}
