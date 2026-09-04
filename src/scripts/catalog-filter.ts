/**
 * Progressive enhancement for the catalogue pages (/tools, /use-cases, /resources).
 * Everything is rendered server-side; this only hides cards that fall outside the
 * active search term and facet selections.
 */
function setupCatalog(root: HTMLElement) {
	const items = [...root.querySelectorAll<HTMLElement>('[data-catalog-item]')];
	const search = root.querySelector<HTMLInputElement>('[data-catalog-search]');
	const counter = root.querySelector<HTMLElement>('[data-catalog-count]');
	const empty = root.querySelector<HTMLElement>('[data-catalog-empty]');
	const facetButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-facet]')];
	const active = new Map<string, string>();

	function matches(item: HTMLElement, term: string) {
		if (term && !(item.dataset.search ?? '').includes(term)) return false;
		for (const [facet, value] of active) {
			const tokens = (item.dataset[`facet${facet[0]!.toUpperCase()}${facet.slice(1)}`] ?? '').split(' ');
			if (!tokens.includes(value)) return false;
		}
		return true;
	}

	function apply() {
		const term = (search?.value ?? '').trim().toLowerCase();
		let visible = 0;
		for (const item of items) {
			const shown = matches(item, term);
			item.hidden = !shown;
			if (shown) visible += 1;
		}
		for (const group of root.querySelectorAll<HTMLElement>('[data-catalog-group]')) {
			group.hidden = !group.querySelector('[data-catalog-item]:not([hidden])');
		}
		if (counter) {
			counter.textContent = visible === items.length
				? `${items.length} ${counter.dataset.noun ?? 'resultater'}`
				: `${visible} af ${items.length} ${counter.dataset.noun ?? 'resultater'}`;
		}
		if (empty) empty.hidden = visible > 0;
	}

	for (const button of facetButtons) {
		button.addEventListener('click', () => {
			const facet = button.dataset.facet!;
			const value = button.dataset.value ?? '';
			const isReset = value === '';
			if (isReset || active.get(facet) === value) {
				active.delete(facet);
			} else {
				active.set(facet, value);
			}
			for (const sibling of facetButtons.filter((candidate) => candidate.dataset.facet === facet)) {
				const selected = sibling.dataset.value === (active.get(facet) ?? '');
				sibling.setAttribute('aria-pressed', String(selected));
			}
			apply();
		});
	}

	search?.addEventListener('input', apply);
	apply();
}

for (const root of document.querySelectorAll<HTMLElement>('[data-catalog]')) {
	setupCatalog(root);
}
