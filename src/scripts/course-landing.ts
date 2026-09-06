/**
 * Landingssidens to interaktive dele: skiftet mellem mailtråd og overblik i
 * heroen, og den korte øvelse i en dialog. Alt indhold står i HTML fra
 * serveren; scriptet skjuler og viser, og siden kan læses uden det.
 */
const previewButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-preview]')];
const previewPanels = [...document.querySelectorAll<HTMLElement>('[data-preview-panel]')];

for (const button of previewButtons) {
	button.addEventListener('click', () => {
		for (const choice of previewButtons) choice.setAttribute('aria-pressed', String(choice === button));
		for (const panel of previewPanels) panel.hidden = panel.dataset.previewPanel !== button.dataset.preview;
	});
}

const dialog = document.querySelector<HTMLDialogElement>('.landing-exercise');
const heading = document.querySelector<HTMLElement>('#exercise-title');
const steps = [...document.querySelectorAll<HTMLElement>('[data-exercise-step]')];
const progress = [...document.querySelectorAll<HTMLElement>('[data-progress]')];
const feedback = document.querySelector<HTMLElement>('[data-answer-feedback]');
const finish = document.querySelector<HTMLElement>('[data-finish-exercise]');
const finishLabel = document.querySelector<HTMLElement>('[data-finish-label]');
let exerciseOpener: HTMLElement | null = null;

function showStep(step: string) {
	for (const item of steps) item.hidden = item.dataset.exerciseStep !== step;
	for (const item of progress) {
		if (item.dataset.progress === step) item.setAttribute('aria-current', 'step');
		else item.removeAttribute('aria-current');
	}
	heading?.focus({ preventScroll: true });
	dialog?.scrollTo({ top: 0 });
}

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-open-exercise]')) {
	button.addEventListener('click', () => {
		exerciseOpener = button;
		showStep('0');
		dialog?.showModal();
		document.body.classList.add('landing-dialog-open');
		heading?.focus({ preventScroll: true });
	});
}

document.querySelector('[data-close-exercise]')?.addEventListener('click', () => dialog?.close());

dialog?.addEventListener('close', () => {
	document.body.classList.remove('landing-dialog-open');
	exerciseOpener?.focus({ preventScroll: true });
});

// Et klik uden for dialogens kasse lukker den; et klik på indholdet gør ikke.
dialog?.addEventListener('click', (event) => {
	if (event.target !== dialog) return;
	const bounds = dialog.getBoundingClientRect();
	const outside =
		event.clientX < bounds.left ||
		event.clientX > bounds.right ||
		event.clientY < bounds.top ||
		event.clientY > bounds.bottom;
	if (outside) dialog.close();
});

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-next-step]')) {
	button.addEventListener('click', () => showStep(button.dataset.nextStep ?? '0'));
}

document.querySelector('[data-copy-prompt]')?.addEventListener('click', async () => {
	const prompt = document.querySelector<HTMLTextAreaElement>('#exercise-prompt');
	const status = document.querySelector<HTMLElement>('[data-copy-status]');
	if (!prompt || !status) return;

	try {
		await navigator.clipboard.writeText(prompt.value);
		status.textContent = 'Prompten er kopieret.';
	} catch {
		prompt.focus();
		prompt.select();
		status.textContent = 'Teksten er markeret. Brug Ctrl+C eller kopiér fra tekstmenuen.';
	}
});

document.querySelector('[data-check-answer]')?.addEventListener('click', () => {
	const selected = document.querySelector<HTMLInputElement>('input[name="control"]:checked');
	if (!feedback || !finish) return;

	if (!selected) {
		feedback.textContent = 'Vælg en opgave, og tjek dit svar.';
		feedback.dataset.correct = 'false';
		return;
	}

	const correct = selected.value === 'notes';
	feedback.dataset.correct = String(correct);
	feedback.textContent = correct
		? 'Præcis. Ingen har sagt ja til at tage noter. AI kan hjælpe med overblikket — du tjekker, at det stemmer med teksten.'
		: 'Ikke helt: Maja sender dagsordenen, og Jonas booker lokalet. Tilbage står spørgsmålet om noter, som ingen har svaret på. Det er præcis den slags, lektionen træner dig i at få øje på.';
	// Begge svar fører videre. Den, der gætter forkert, har mest at hente i lektionen.
	if (finishLabel) {
		finishLabel.textContent = correct
			? 'Tag hele lektionen på kurset'
			: 'Det er præcis det, lektionen træner';
	}
	finish.hidden = false;
});
