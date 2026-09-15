const TIMELINE_SELECTOR = '[data-ai-timeline]';

function setupTimeline(timeline: HTMLElement) {
	if (timeline.dataset.timelineReady === 'true') return;
	timeline.dataset.timelineReady = 'true';

	const filters = Array.from(timeline.querySelectorAll<HTMLButtonElement>('[data-timeline-filter]'));
	const milestones = Array.from(timeline.querySelectorAll<HTMLButtonElement>('[data-timeline-milestone]'));
	const date = timeline.querySelector<HTMLElement>('[data-timeline-date]');
	const title = timeline.querySelector<HTMLElement>('[data-timeline-title]');
	const description = timeline.querySelector<HTMLElement>('[data-timeline-description]');
	const impact = timeline.querySelector<HTMLElement>('[data-timeline-impact]');
	const source = timeline.querySelector<HTMLAnchorElement>('[data-timeline-source]');

	const selectMilestone = (milestone: HTMLButtonElement) => {
		milestones.forEach((item) => {
			const active = item === milestone;
			item.classList.toggle('is-active', active);
			item.setAttribute('aria-pressed', String(active));
		});
		if (date) date.textContent = milestone.dataset.date ?? '';
		if (title) title.textContent = milestone.dataset.title ?? '';
		if (description) description.textContent = milestone.dataset.description ?? '';
		if (impact) impact.textContent = milestone.dataset.impact ?? '';
		if (source) source.href = milestone.dataset.source ?? '#';
	};

	filters.forEach((filter) => filter.addEventListener('click', () => {
		const era = filter.dataset.timelineFilter ?? 'all';
		filters.forEach((item) => {
			const active = item === filter;
			item.classList.toggle('is-active', active);
			item.setAttribute('aria-pressed', String(active));
		});

		const visible = milestones.filter((milestone) => {
			const show = era === 'all' || milestone.dataset.era === era;
			milestone.hidden = !show;
			return show;
		});
		if (visible.length) selectMilestone(visible.at(-1) as HTMLButtonElement);
	}));

	milestones.forEach((milestone) => milestone.addEventListener('click', () => selectMilestone(milestone)));
}

export function initChatGptTimelines() {
	document.querySelectorAll<HTMLElement>(TIMELINE_SELECTOR).forEach(setupTimeline);
}
