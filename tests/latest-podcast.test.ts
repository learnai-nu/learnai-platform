import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { latestEpisode } from '../src/lib/podcast/latest-episode';

function newestPublishedAudio() {
	const root = join(process.cwd(), 'public', 'audio', 'news');
	const episodes = readdirSync(root, { recursive: true })
		.map(String)
		.map((file) => file.match(/^(\d{4})\/week-(\d+)\/Podcast_Uge(\d+)_DA\.(mp3|m4a)$/))
		.filter((match): match is RegExpMatchArray => Boolean(match))
		.map((match) => ({
			year: Number(match[1]),
			week: Number(match[2]),
			url: `/audio/news/${match[1]}/week-${match[2]}/Podcast_Uge${match[3]}_DA.${match[4]}`,
		}))
		.sort((a, b) => b.year - a.year || b.week - a.week);

	if (!episodes[0]) throw new Error('Ingen publiceret ugepodcast blev fundet.');
	return episodes[0];
}

describe('latest podcast episode', () => {
	it('stays aligned with the newest published audio file and article tracks', () => {
		const newestAudio = newestPublishedAudio();
		expect(latestEpisode.year).toBe(newestAudio.year);
		expect(latestEpisode.week).toBe(newestAudio.week);
		expect(latestEpisode.audioUrl).toBe(newestAudio.url);
		expect(latestEpisode.topics.length).toBeGreaterThan(0);
		expect(latestEpisode.topics.every((topic) => topic.href.startsWith(`/laer/uge-${newestAudio.week}-`))).toBe(true);
		expect(new Set(latestEpisode.topics.map((topic) => topic.href)).size).toBe(latestEpisode.topics.length);
	});
});
