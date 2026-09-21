/**
 * Samtykke til Microsoft Clarity.
 *
 * Vercel Analytics og Speed Insights er cookie-fri og kræver ikke samtykke.
 * Clarity sætter cookies og optager sessioner, så den må først køre med
 * cookies, når besøgende aktivt har sagt ja. Valget gemmes i browseren —
 * aldrig på serveren og aldrig koblet til en bruger.
 */

export const CONSENT_STORAGE_KEY = 'learnai:consent:clarity:v1';

/** Banneret og Clarity-scriptet taler sammen gennem denne hændelse. */
export const CONSENT_CHANGE_EVENT = 'learnai:consent-change';

export type ConsentChoice = 'granted' | 'denied';

/** Clarity kalder samtykket med Googles storage-navne. */
export interface ClarityConsent {
	ad_Storage: 'granted' | 'denied';
	analytics_Storage: 'granted' | 'denied';
}

export function parseConsent(raw: string | null | undefined): ConsentChoice | null {
	return raw === 'granted' || raw === 'denied' ? raw : null;
}

/**
 * LearnAI bruger ikke annoncering, så ad_Storage er altid afvist —
 * også når besøgende har sagt ja til statistik.
 */
export function clarityConsentFor(choice: ConsentChoice): ClarityConsent {
	return { ad_Storage: 'denied', analytics_Storage: choice };
}

/** Uden et gemt valg returneres null, så banneret kan vises. */
export function readConsent(storage: Pick<Storage, 'getItem'> | undefined): ConsentChoice | null {
	try {
		return parseConsent(storage?.getItem(CONSENT_STORAGE_KEY));
	} catch {
		// Blokeret storage må ikke vælte siden — vi behandler det som intet valg.
		return null;
	}
}

export function storeConsent(choice: ConsentChoice, storage: Pick<Storage, 'setItem'> | undefined): void {
	try {
		storage?.setItem(CONSENT_STORAGE_KEY, choice);
	} catch {
		// Valget gælder så kun for den aktuelle sidevisning.
	}
}
