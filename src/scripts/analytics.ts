import { track } from '@vercel/analytics';
import type { AnalyticsEventName } from '../lib/analytics/events';

interface AnalyticsElement extends HTMLElement {
	dataset: DOMStringMap & {
		analyticsEvent?: AnalyticsEventName;
		analyticsSource?: string;
		analyticsDetail?: string;
		analyticsTrigger?: 'click' | 'load';
	};
}

function propertiesFor(element: AnalyticsElement) {
	const properties: Record<string, string> = {};
	if (element.dataset.analyticsSource) properties.source = element.dataset.analyticsSource;
	if (element.dataset.analyticsDetail) properties.detail = element.dataset.analyticsDetail;
	return Object.keys(properties).length > 0 ? properties : undefined;
}

function trackElement(element: AnalyticsElement) {
	const eventName = element.dataset.analyticsEvent;
	if (!eventName) return;
	track(eventName, propertiesFor(element));
}

document.addEventListener('click', (event) => {
	if (!(event.target instanceof Element)) return;
	const element = event.target.closest<AnalyticsElement>('[data-analytics-event]:not([data-analytics-trigger="load"])');
	if (element) trackElement(element);
});

for (const element of document.querySelectorAll<AnalyticsElement>('[data-analytics-event][data-analytics-trigger="load"]')) {
	const eventName = element.dataset.analyticsEvent;
	if (!eventName) continue;
	const key = `learnai:analytics:${eventName}:${window.location.pathname}:${window.location.search}`;
	try {
		if (window.sessionStorage.getItem(key)) continue;
		window.sessionStorage.setItem(key, '1');
	} catch {
		// Analytics må ikke påvirke siden, hvis browserens storage er slået fra.
	}
	trackElement(element);
}
