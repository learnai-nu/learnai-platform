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
	week: 42,
	year: 2026,
	period: '12.–18. oktober 2026',
	datePublished: '2026-10-19',
	durationSeconds: 382.432653,
	audioUrl: '/audio/news/2026/week-42/Podcast_Uge42_DA.mp3',
	title: 'AI-nyheder uge 42: "Åben" betyder tre forskellige ting',
	headline: '"Åben" betyder tre forskellige ting',
	topics: [
		{
			label: 'Headlines & launches',
			title: 'Google lukker op, Meta og Reflection åbner op',
			text: 'Gemini 4 Argon kom til alle betalende udviklere, mens Meta og Reflection frigav vægtene til to af de største åbne modeller til dato.',
			href: '/laer/uge-42-headlines-and-launches',
		},
		{
			label: 'Deep dives & analysis',
			title: '"Åben" betyder tre forskellige ting',
			text: 'Open-weight dækker over meget forskellige licenser – og det er licensen, ikke parameterantallet, der afgør, hvad I må.',
			href: '/laer/uge-42-deep-dives-and-analysis',
		},
		{
			label: 'Marketing',
			title: 'Kampagnen kan nu sendes fra chatten – men hvem godkender?',
			text: 'Movable Ink åbnede for Claude og ChatGPT, og Salesforce købte Loops. Værktøjerne er klar, godkendelsesreglerne er ikke.',
			href: '/laer/uge-42-marketing',
		},
		{
			label: 'Business',
			title: 'Pengene går til maskinrummet',
			text: 'Modal Labs rejste 750 mio. dollar til infrastruktur, der kører AI, mens Google lancerede en frontier-model til introduktionspris.',
			href: '/laer/uge-42-business',
		},
	],
};

/** "7 min." style label for a duration in seconds. */
export function formatMinutes(seconds: number): string {
	return `${Math.round(seconds / 60)} min.`;
}
