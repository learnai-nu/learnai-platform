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
	week: 38,
	year: 2026,
	period: '14.–20. september 2026',
	durationSeconds: 432.59,
	audioUrl: '/audio/news/2026/week-38/Podcast_Uge38_DA.mp3',
	title: 'AI-nyheder uge 38: Når tempo, sikkerhed og agentøkonomi mødes',
	headline: 'Når tempo, sikkerhed og agentøkonomi mødes',
	topics: [
		{
			label: 'Headlines & launches',
			title: 'Nye modeller og mere handlekraftige agenter',
			text: 'Ugens lanceringer peger mod systemer, der løser længere opgaver og kræver tydeligere kontrol.',
			href: '/laer/uge-38-headlines-and-launches',
		},
		{
			label: 'Deep dives & analysis',
			title: 'Kan AI-laboratorierne selv styre tempoet?',
			text: 'Debatten om udviklingstempo bliver holdt op mod hændelsesrapporter og konkrete sikkerhedsvalg.',
			href: '/laer/uge-38-deep-dives-and-analysis',
		},
		{
			label: 'Marketing',
			title: 'Når annoncen bliver en samtale',
			text: 'Samtalebårne annoncer ændrer forholdet mellem platform, brand og den kunde, der stiller spørgsmålet.',
			href: '/laer/uge-38-marketing',
		},
		{
			label: 'Business',
			title: 'Agentarbejde kræver nye driftsvalg',
			text: 'Virksomheder skal vælge, hvor agenter må handle, og hvordan kvalitet, data og ansvar følges.',
			href: '/laer/uge-38-business',
		},
	],
};

/** "7 min." style label for a duration in seconds. */
export function formatMinutes(seconds: number): string {
	return `${Math.round(seconds / 60)} min.`;
}
