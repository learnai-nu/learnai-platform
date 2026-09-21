import Clarity from '@microsoft/clarity';

const projectId = import.meta.env.PUBLIC_CLARITY_PROJECT_ID;

// Uden projekt-id kører sitet helt uden Clarity — fx i lokal udvikling og preview.
if (projectId) {
	try {
		Clarity.init(projectId);
	} catch {
		// Clarity må aldrig kunne vælte siden, hvis scriptet blokeres.
	}
}
