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
	durationSeconds: 458.87,
	audioUrl: '/audio/news/2026/week-39/Podcast_Uge39_DA.mp3',
	title: 'AI-nyheder uge 39: Når AI-agenten bliver kunde, flytter kampen til adgangen',
	headline: 'Når AI-agenten bliver kunde, flytter kampen til adgangen',
	topics: [
		{
			label: 'Headlines & launches',
			title: 'AI-assistenten flytter ud af chatvinduet',
			text: 'Meta, Google og Microsoft lancerede tre forskellige bud på, hvordan AI skal følge brugeren mellem enheder, stemme og længerevarende opgaver.',
			href: '/laer/uge-39-headlines-and-launches',
		},
		{
			label: 'Deep dives & analysis',
			title: 'Tre AI-historier, hvor forbeholdet er lige så vigtigt som gennembruddet',
			text: 'Claude-agenter fandt en kandidat til et nyt enzymsystem, Google undersøger datacentre i rummet, og sikkerhedshændelser viser, hvad værktøjsadgang kan koste.',
			href: '/laer/uge-39-deep-dives-and-analysis',
		},
		{
			label: 'Marketing',
			title: 'Når AI-agenten bliver kunde, flytter kampen til adgangen',
			text: 'Amazon blokerede Metas shoppingagent Muse, mens YouTube og Amazon selv byggede mere AI ind i deres egne platforme.',
			href: '/laer/uge-39-marketing',
		},
		{
			label: 'Business',
			title: 'Billigere modeller ændrer AI-regnestykket — men ikke ledelsesopgaven',
			text: 'Anthropic og OpenAI sænkede prisen på nye modeller, en dansk artikel koblede AI-indførelse til færre nyansættelser, og Affirm beskrev bedre kreditvurdering for ansøgere uden FICO-score.',
			href: '/laer/uge-39-business',
		},
	],
};

/** "7 min." style label for a duration in seconds. */
export function formatMinutes(seconds: number): string {
	return `${Math.round(seconds / 60)} min.`;
}
