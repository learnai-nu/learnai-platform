import { describe, expect, it } from 'vitest';
import {
	buildElevenLabsRequest,
	defaultModelId,
	defaultOutputFormat,
	defaultVoiceId,
	normalizePodcastText,
	validateAudioResponse,
} from '../scripts/generate-weekly-podcast.mjs';

describe('ElevenLabs podcast generator', () => {
	it('uses the approved Danish voice and long-form model', () => {
		const text = 'Dansk podcasttekst. '.repeat(20);
		const request = buildElevenLabsRequest(text);

		expect(defaultVoiceId).toBe('xj6X4BCUsv9oxohm1E8o');
		expect(defaultModelId).toBe('eleven_multilingual_v2');
		expect(defaultOutputFormat).toBe('mp3_44100_128');
		expect(request.url).toContain(`/text-to-speech/${defaultVoiceId}`);
		expect(request.body.language_code).toBe('da');
		expect(request.body.voice_settings).toEqual({
			stability: 0.5,
			similarity_boost: 0.75,
			style: 0.1,
			use_speaker_boost: true,
			speed: 0.97,
		});
	});

	it('normalizes line endings and rejects unsuitable manuscript lengths', () => {
		expect(normalizePodcastText(`  ${'A'.repeat(200)}\r\n  `)).toBe(`${'A'.repeat(200)}`);
		expect(() => normalizePodcastText('For kort')).toThrow('for kort');
		expect(() => normalizePodcastText('A'.repeat(10_001))).toThrow('10.000');
	});

	it('accepts only meaningful audio responses', () => {
		expect(validateAudioResponse('audio/mpeg', new Uint8Array(10_000))).toBe(true);
		expect(() => validateAudioResponse('application/json', new Uint8Array(10_000))).toThrow('ikke en lydfil');
		expect(() => validateAudioResponse('audio/mpeg', new Uint8Array(99))).toThrow('uventet lille');
	});
});
