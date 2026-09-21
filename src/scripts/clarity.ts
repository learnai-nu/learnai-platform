import Clarity from '@microsoft/clarity';
import {
	CONSENT_CHANGE_EVENT,
	clarityConsentFor,
	readConsent,
	type ConsentChoice,
} from '../lib/analytics/consent';

const projectId = import.meta.env.PUBLIC_CLARITY_PROJECT_ID;

// Uden projekt-id kører sitet helt uden Clarity — fx i lokal udvikling og preview.
if (projectId) {
	try {
		Clarity.init(projectId);

		const apply = (choice: ConsentChoice) => {
			try {
				Clarity.consentV2(clarityConsentFor(choice));
			} catch {
				// Clarity må aldrig kunne vælte siden, hvis scriptet blokeres.
			}
		};

		// Uden et aktivt ja starter Clarity uden cookies.
		apply(readConsent(window.localStorage) ?? 'denied');

		window.addEventListener(CONSENT_CHANGE_EVENT, (event) => {
			const choice = (event as CustomEvent<ConsentChoice>).detail;
			if (choice === 'granted' || choice === 'denied') apply(choice);
		});
	} catch {
		// Samme her: en blokeret måling er aldrig en fejl for besøgende.
	}
}
