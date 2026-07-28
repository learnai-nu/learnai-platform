type ContentBlock =
	| { type: 'heading'; text: string; level: number }
	| { type: 'paragraph'; text: string }
	| { type: 'callout'; text: string }
	| { type: 'checklist'; items: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function editorTextToBody(value: string) {
	const sections = value
		.replace(/\r\n/g, '\n')
		.split(/\n\s*\n/)
		.map((section) => section.trim())
		.filter(Boolean);
	const blocks: ContentBlock[] = [];

	for (const section of sections) {
		const heading = /^(#{2,3})\s+(.+)$/s.exec(section);
		if (heading) {
			blocks.push({ type: 'heading', level: heading[1].length, text: heading[2].trim() });
			continue;
		}

		if (section.startsWith('> ')) {
			blocks.push({ type: 'callout', text: section.slice(2).replace(/\n>\s?/g, ' ').trim() });
			continue;
		}

		const lines = section.split('\n').map((line) => line.trim()).filter(Boolean);
		if (lines.length > 0 && lines.every((line) => /^-\s+/.test(line))) {
			blocks.push({
				type: 'checklist',
				items: lines.map((line) => line.replace(/^-\s+/, '').trim()).filter(Boolean),
			});
			continue;
		}

		blocks.push({ type: 'paragraph', text: lines.join(' ') });
	}

	return { format: 'blocks', blocks };
}

export function bodyToEditorText(body: unknown) {
	if (!isRecord(body) || !Array.isArray(body.blocks)) return '';

	return body.blocks
		.map((block) => {
			if (!isRecord(block) || typeof block.type !== 'string') return '';
			if (block.type === 'heading' && typeof block.text === 'string') {
				const level = block.level === 3 ? '###' : '##';
				return `${level} ${block.text}`;
			}
			if (block.type === 'callout' && typeof block.text === 'string') return `> ${block.text}`;
			if (block.type === 'checklist' && Array.isArray(block.items)) {
				return block.items
					.filter((item): item is string => typeof item === 'string')
					.map((item) => `- ${item}`)
					.join('\n');
			}
			return typeof block.text === 'string' ? block.text : '';
		})
		.filter(Boolean)
		.join('\n\n');
}
