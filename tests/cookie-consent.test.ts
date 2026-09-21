import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	CONSENT_CHANGE_EVENT,
	CONSENT_STORAGE_KEY,
	clarityConsentFor,
	parseConsent,
	readConsent,
	storeConsent,
} from '../src/lib/analytics/consent';

const banner = readFileSync(new URL('../src/components/marketing/CookieConsent.astro', import.meta.url), 'utf8');
const clarity = readFileSync(new URL('../src/scripts/clarity.ts', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../src/layouts/SiteLayout.astro', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../src/components/marketing/BlueOrbitFooter.astro', import.meta.url), 'utf8');
const privacyPage = readFileSync(new URL('../src/pages/[slug].astro', import.meta.url), 'utf8');

function memoryStorage(initial?: string) {
	let value = initial;
	return {
		getItem: () => value ?? null,
		setItem: (_key: string, next: string) => { value = next; },
		read: () => value,
	};
}

describe('cookiesamtykke', () => {
	it('accepterer kun kendte valg', () => {
		expect(parseConsent('granted')).toBe('granted');
		expect(parseConsent('denied')).toBe('denied');
		expect(parseConsent('ja tak')).toBeNull();
		expect(parseConsent(null)).toBeNull();
	});

	it('afviser altid annoncecookies', () => {
		expect(clarityConsentFor('granted')).toEqual({ ad_Storage: 'denied', analytics_Storage: 'granted' });
		expect(clarityConsentFor('denied')).toEqual({ ad_Storage: 'denied', analytics_Storage: 'denied' });
	});

	it('læser og gemmer valget lokalt uden at vælte på blokeret storage', () => {
		const storage = memoryStorage();
		expect(readConsent(storage)).toBeNull();
		storeConsent('granted', storage);
		expect(storage.read()).toBe('granted');
		expect(readConsent(storage)).toBe('granted');

		const blocked = {
			getItem: () => { throw new Error('blocked'); },
			setItem: () => { throw new Error('blocked'); },
		};
		expect(readConsent(blocked)).toBeNull();
		expect(() => storeConsent('denied', blocked)).not.toThrow();
		expect(readConsent(undefined)).toBeNull();
	});

	it('starter Clarity uden cookies, indtil der er sagt ja', () => {
		expect(clarity).toContain("apply(readConsent(window.localStorage) ?? 'denied')");
		expect(clarity).toContain('Clarity.consentV2(clarityConsentFor(choice))');
		expect(clarity).toContain(`addEventListener(CONSENT_CHANGE_EVENT`);
		expect(CONSENT_STORAGE_KEY).toBe('learnai:consent:clarity:v1');
		expect(CONSENT_CHANGE_EVENT).toBe('learnai:consent-change');
	});

	it('viser banneret på offentlige sider og aldrig i admin', () => {
		expect(layout).toContain('{analytics && <CookieConsent {locale} />}');
		expect(layout).toContain("import '../styles/cookie-consent.css'");
		expect(layout).toContain('{analytics && <script src="../scripts/clarity.ts"></script>}');
	});

	it('viser kun banneret uden et gemt valg og giver begge svar lige vægt', () => {
		expect(banner).toContain('if (!readConsent(window.localStorage)) show()');
		expect(banner).toContain('data-consent="denied"');
		expect(banner).toContain('data-consent="granted"');
	});

	it('gør det lige så let at trække samtykket tilbage', () => {
		expect(banner).toContain('[data-consent-reopen]');
		expect(footer).toContain('data-consent-reopen');
		expect(privacyPage).toContain('data-consent-reopen');
	});
});
