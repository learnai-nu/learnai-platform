function formatTime(seconds: number) {
	if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
	const rounded = Math.floor(seconds);
	return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, '0')}`;
}

function initPlayer(root: HTMLElement) {
	if (root.dataset.audioReady === 'true') return;
	root.dataset.audioReady = 'true';

	const audio = root.querySelector<HTMLAudioElement>('[data-audio-element]');
	const toggle = root.querySelector<HTMLButtonElement>('[data-audio-toggle]');
	const toggleLabel = root.querySelector<HTMLElement>('[data-audio-toggle-label]');
	const progress = root.querySelector<HTMLInputElement>('[data-audio-progress]');
	const current = root.querySelector<HTMLElement>('[data-audio-current]');
	const duration = root.querySelector<HTMLElement>('[data-audio-duration]');
	const error = root.querySelector<HTMLElement>('[data-audio-error]');
	if (!audio || !toggle || !toggleLabel || !progress || !current || !duration || !error) return;

	const playLabel = root.dataset.playLabel ?? 'Afspil';
	const pauseLabel = root.dataset.pauseLabel ?? 'Pause';
	const syncToggle = () => {
		const playing = !audio.paused && !audio.ended;
		root.classList.toggle('is-playing', playing);
		toggle.setAttribute('aria-label', playing ? pauseLabel : playLabel);
		toggleLabel.textContent = playing ? pauseLabel : playLabel;
	};
	const syncProgress = () => {
		const knownDuration = Number.isFinite(audio.duration) ? audio.duration : Number(progress.max);
		progress.max = String(knownDuration || 0);
		progress.value = String(audio.currentTime || 0);
		progress.style.setProperty('--audio-progress', `${knownDuration ? (audio.currentTime / knownDuration) * 100 : 0}%`);
		current.textContent = formatTime(audio.currentTime);
		if (knownDuration) duration.textContent = formatTime(knownDuration);
	};

	toggle.addEventListener('click', async () => {
		if (audio.paused) {
			document.querySelectorAll<HTMLAudioElement>('[data-audio-element]').forEach((other) => {
				if (other !== audio) other.pause();
			});
			await audio.play().catch(() => { error.hidden = false; });
		} else {
			audio.pause();
		}
		syncToggle();
	});
	progress.addEventListener('input', () => { audio.currentTime = Number(progress.value); syncProgress(); });
	root.querySelectorAll<HTMLButtonElement>('[data-audio-rate]').forEach((button) => {
		button.addEventListener('click', () => {
			audio.playbackRate = Number(button.dataset.audioRate ?? 1);
			root.querySelectorAll<HTMLButtonElement>('[data-audio-rate]').forEach((candidate) => {
				const active = candidate === button;
				candidate.classList.toggle('is-active', active);
				candidate.setAttribute('aria-pressed', String(active));
			});
		});
	});
	audio.addEventListener('loadedmetadata', syncProgress);
	audio.addEventListener('timeupdate', syncProgress);
	audio.addEventListener('play', syncToggle);
	audio.addEventListener('pause', syncToggle);
	audio.addEventListener('ended', syncToggle);
	audio.addEventListener('error', () => { error.hidden = false; toggle.disabled = true; });
}

export function initArticleAudioPlayers() {
	document.querySelectorAll<HTMLElement>('[data-article-audio]').forEach(initPlayer);
}
