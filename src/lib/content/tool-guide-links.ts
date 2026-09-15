export interface GuideLink {
	title: string;
	href: string;
}

const guideLinksByTool: Record<string, GuideLink> = {
	chatgpt: { title: 'Læs ChatGPT-guiden', href: '/laer/hvad-er-chatgpt-guide' },
	'claude-anthropic': { title: 'Læs Claude-guiden', href: '/laer/hvad-er-claude-ai-guide' },
	'claude-design': { title: 'Læs guiden til Claude Design', href: '/laer/claude-design-guide' },
	'google-gemini': { title: 'Guide: Vælg den rigtige AI-assistent', href: '/laer/saadan-vaelger-du-den-rigtige-ai-assistent' },
	'microsoft-copilot': { title: 'Guide: Vælg den rigtige AI-assistent', href: '/laer/saadan-vaelger-du-den-rigtige-ai-assistent' },
	'perplexity-ai': { title: 'Guide: Vælg den rigtige AI-assistent', href: '/laer/saadan-vaelger-du-den-rigtige-ai-assistent' },
	'grok-xai': { title: 'Guide: Vælg den rigtige AI-assistent', href: '/laer/saadan-vaelger-du-den-rigtige-ai-assistent' },
	notebooklm: { title: 'Guide: Vælg den rigtige AI-assistent', href: '/laer/saadan-vaelger-du-den-rigtige-ai-assistent' },
};

const toolSlugsByGuide: Record<string, string[]> = {
	'hvad-er-chatgpt-guide': ['chatgpt', 'perplexity-ai', 'microsoft-copilot'],
	'hvad-er-claude-ai-guide': ['claude-anthropic', 'notebooklm', 'chatgpt'],
	'claude-design-guide': ['claude-design', 'lovable', 'google-stitch'],
	'saadan-vaelger-du-den-rigtige-ai-assistent': ['chatgpt', 'claude-anthropic', 'google-gemini', 'microsoft-copilot'],
	'saadan-kommer-du-i-gang-med-generativ-ai': ['chatgpt', 'claude-anthropic', 'google-gemini'],
	'saadan-skill-engineering-med-ai': ['chatgpt', 'claude-anthropic', 'lovable'],
	'ai-guide-mus-samtaler': ['chatgpt', 'microsoft-copilot', 'claude-anthropic'],
};

export function guideLinkForTool(slug: string): GuideLink | null {
	return guideLinksByTool[slug] ?? null;
}

export function toolSlugsForGuide(slug: string): string[] {
	return toolSlugsByGuide[slug] ?? [];
}
