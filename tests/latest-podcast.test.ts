import { describe, expect, it } from 'vitest';
import { latestEpisode } from '../src/lib/podcast/latest-episode';

describe('latest podcast episode', () => {
	it('points to the published week 39 episode and its five article tracks', () => {
		expect(latestEpisode.week).toBe(39);
		expect(latestEpisode.year).toBe(2026);
		expect(latestEpisode.audioUrl).toBe('/audio/news/2026/week-39/Podcast_Uge39_DA.mp3');
		expect(latestEpisode.topics).toHaveLength(5);
		expect(latestEpisode.topics.every((topic) => topic.href.startsWith('/laer/uge-39-'))).toBe(true);
	});
});
