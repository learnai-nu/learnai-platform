function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function editorTextToBody(value: string) {
	return {
		format: 'markdown',
		markdown: value.replace(/\r\n/g, '\n').trim(),
	};
}

export function bodyToEditorText(body: unknown) {
	if (!isRecord(body)) return '';
	if (body.format === 'markdown' && typeof body.markdown === 'string') {
		return body.markdown;
	}
	if (!Array.isArray(body.blocks)) return '';

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
