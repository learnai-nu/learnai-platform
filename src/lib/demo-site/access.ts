import { createHmac, timingSafeEqual } from 'node:crypto';

export const DEMO_COOKIE_NAME = 'learnai_demo_access';
export const DEMO_REWRITE_HEADER = 'x-learnai-demo-rewrite';
const DEMO_COOKIE_PAYLOAD = 'learnai-demo-site-v1';

function requiredEnv(name: 'DEMO_SITE_PASSWORD' | 'DEMO_SITE_COOKIE_SECRET') {
	const value = (name === 'DEMO_SITE_PASSWORD'
		? import.meta.env.DEMO_SITE_PASSWORD
		: import.meta.env.DEMO_SITE_COOKIE_SECRET
	)?.trim();
	if (!value) throw new Error(`${name} is required for the private demo site.`);
	return value;
}

function equalText(left: string, right: string) {
	const leftBuffer = Buffer.from(left);
	const rightBuffer = Buffer.from(right);
	return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyDemoPassword(candidate: string) {
	return equalText(candidate, requiredEnv('DEMO_SITE_PASSWORD'));
}

export function createDemoCookieValue() {
	return createHmac('sha256', requiredEnv('DEMO_SITE_COOKIE_SECRET'))
		.update(DEMO_COOKIE_PAYLOAD)
		.digest('base64url');
}

export function isValidDemoCookie(candidate?: string) {
	if (!candidate) return false;
	try {
		return equalText(candidate, createDemoCookieValue());
	} catch {
		return false;
	}
}
