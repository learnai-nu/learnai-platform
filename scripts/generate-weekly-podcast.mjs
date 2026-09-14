import { execFileSync } from 'node:child_process';
import { link, readFile, unlink, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const defaultVoiceId = 'xj6X4BCUsv9oxohm1E8o';
export const defaultModelId = 'eleven_multilingual_v2';
export const defaultOutputFormat = 'mp3_44100_128';

const keychainService = 'learnai-elevenlabs';

export function normalizePodcastText(value) {
	if (typeof value !== 'string') throw new Error('Podcastmanuskriptet skal være tekst.');
	const text = value.replaceAll('\r\n', '\n').trim();
	if (text.length < 200) throw new Error('Podcastmanuskriptet er for kort.');
	if (text.length > 10_000) throw new Error('Podcastmanuskriptet overstiger modellens grænse på 10.000 tegn.');
	return text;
}

export function buildElevenLabsRequest(text, voiceId = defaultVoiceId) {
	if (!/^[A-Za-z0-9_-]{10,64}$/.test(voiceId)) throw new Error('ElevenLabs voice ID er ugyldigt.');
	return {
		url: `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=${defaultOutputFormat}`,
		body: {
			text: normalizePodcastText(text),
			model_id: defaultModelId,
			language_code: 'da',
			voice_settings: {
				stability: 0.5,
				similarity_boost: 0.75,
				style: 0.1,
				use_speaker_boost: true,
				speed: 0.97,
			},
		},
	};
}

function readApiKey() {
	const environmentKey = process.env.ELEVENLABS_API_KEY?.trim();
	if (environmentKey) return environmentKey;
	if (process.platform !== 'darwin') return null;

	try {
		return execFileSync('/usr/bin/security', ['find-generic-password', '-s', keychainService, '-w'], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim();
	} catch {
		return null;
	}
}

export function validateAudioResponse(contentType, bytes) {
	if (!contentType?.toLowerCase().startsWith('audio/')) throw new Error('ElevenLabs returnerede ikke en lydfil.');
	if (!(bytes instanceof Uint8Array) || bytes.byteLength < 10_000) throw new Error('ElevenLabs-lydfilen er tom eller uventet lille.');
	return true;
}

export async function generateWeeklyPodcast({ inputPath, outputPath, voiceId = defaultVoiceId, fetchImpl = fetch }) {
	if (!inputPath || !outputPath) throw new Error('Angiv både manuskript- og outputsti.');
	if (!outputPath.toLowerCase().endsWith('.mp3')) throw new Error('ElevenLabs-output skal gemmes som .mp3.');

	const apiKey = readApiKey();
	if (!apiKey) {
		throw new Error(`ELEVENLABS_API_KEY mangler. Sæt miljøvariablen eller gem nøglen i macOS Keychain med service-navnet ${keychainService}.`);
	}

	const request = buildElevenLabsRequest(await readFile(inputPath, 'utf8'), voiceId);
	const response = await fetchImpl(request.url, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'xi-api-key': apiKey,
		},
		body: JSON.stringify(request.body),
	});

	if (!response.ok) throw new Error(`ElevenLabs afviste genereringen med HTTP ${response.status}.`);
	const bytes = new Uint8Array(await response.arrayBuffer());
	validateAudioResponse(response.headers.get('content-type'), bytes);

	const temporaryPath = `${outputPath}.partial`;
	try {
		await writeFile(temporaryPath, bytes, { flag: 'wx' });
		await link(temporaryPath, outputPath);
		await unlink(temporaryPath);
	} catch (error) {
		await unlink(temporaryPath).catch(() => {});
		throw error;
	}

	return {
		status: 'generated',
		voiceId,
		modelId: defaultModelId,
		outputFormat: defaultOutputFormat,
		bytes: bytes.byteLength,
		outputPath,
	};
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
	const [inputPath, outputPath, voiceId] = process.argv.slice(2);
	generateWeeklyPodcast({ inputPath, outputPath, voiceId })
		.then((result) => console.log(JSON.stringify(result)))
		.catch((error) => {
			console.error(error instanceof Error ? error.message : 'Podcastgenereringen fejlede.');
			process.exitCode = 1;
		});
}
