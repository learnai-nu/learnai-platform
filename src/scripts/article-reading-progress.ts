const SELECTOR = '[data-article-reader]';

function setupArticleReader(reader: HTMLElement) {
	if (reader.dataset.readingReady === 'true') return;
	reader.dataset.readingReady = 'true';

	const articleBody = reader.querySelector<HTMLElement>('.article-body');
	const sectionHeadings = Array.from(reader.querySelectorAll<HTMLElement>('.article-body h2[id]'));
	const allHeadings = Array.from(reader.querySelectorAll<HTMLElement>('.article-body h2[id], .article-body h3[id]'));
	const timeLabels = Array.from(reader.querySelectorAll<HTMLElement>('[data-reading-time-left]'));
	const totalMinutes = Number(reader.dataset.readingMinutes) || 1;
	const completed = new Set<string>();
	let frame = 0;

	if (!articleBody || allHeadings.length === 0) return;

	const linksFor = (id: string) => Array.from(reader.querySelectorAll<HTMLElement>(`[data-toc-item="${CSS.escape(id)}"]`));

	const update = () => {
		frame = 0;
		const marker = window.scrollY + window.innerHeight * 0.42;
		const articleBottom = articleBody.getBoundingClientRect().bottom + window.scrollY;
		let activeHeading = allHeadings[0];

		for (const heading of allHeadings) {
			const headingTop = heading.getBoundingClientRect().top + window.scrollY;
			if (headingTop <= marker) activeHeading = heading;
		}

		sectionHeadings.forEach((heading, index) => {
			const nextHeading = sectionHeadings[index + 1];
			const sectionEnd = nextHeading
				? nextHeading.getBoundingClientRect().top + window.scrollY
				: articleBottom;
			const hasReadSection = sectionEnd <= marker || (!nextHeading && articleBottom <= window.scrollY + window.innerHeight * 0.82);
			if (hasReadSection) completed.add(heading.id);

			heading.classList.toggle('is-read', completed.has(heading.id));
			heading.classList.toggle('is-current', heading.id === activeHeading.id && !completed.has(heading.id));
			linksFor(heading.id).forEach((item) => item.classList.toggle('is-read', completed.has(heading.id)));
		});

		for (const heading of allHeadings) {
			const active = heading.id === activeHeading.id;
			linksFor(heading.id).forEach((item) => {
				item.classList.toggle('is-current', active);
				const link = item.querySelector('a');
				if (active) link?.setAttribute('aria-current', 'location');
				else link?.removeAttribute('aria-current');
			});
		}

		const articleTop = articleBody.getBoundingClientRect().top + window.scrollY;
		const readableDistance = Math.max(1, articleBottom - articleTop - window.innerHeight * 0.55);
		const progress = Math.min(1, Math.max(0, (marker - articleTop) / readableDistance));
		const minutesLeft = Math.max(0, Math.ceil(totalMinutes * (1 - progress)));
		timeLabels.forEach((label) => { label.textContent = `${minutesLeft} min. tilbage`; });
	};

	const requestUpdate = () => {
		if (frame) return;
		frame = window.requestAnimationFrame(update);
	};

	reader.querySelectorAll<HTMLAnchorElement>('.article-toc a[href^="#"]').forEach((link) => {
		link.addEventListener('click', () => link.closest('details')?.removeAttribute('open'));
	});

	window.addEventListener('scroll', requestUpdate, { passive: true });
	window.addEventListener('resize', requestUpdate, { passive: true });
	update();
}

export function initArticleReadingProgress() {
	document.querySelectorAll<HTMLElement>(SELECTOR).forEach(setupArticleReader);
}
