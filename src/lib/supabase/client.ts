import { createBrowserClient } from '@supabase/ssr';

function requiredPublicEnv(name: 'PUBLIC_SUPABASE_URL' | 'PUBLIC_SUPABASE_PUBLISHABLE_KEY') {
	const value = import.meta.env[name];
	if (!value) {
		throw new Error(`Miljøvariablen ${name} mangler.`);
	}
	return value;
}

export function createBrowserSupabaseClient() {
	return createBrowserClient(
		requiredPublicEnv('PUBLIC_SUPABASE_URL'),
		requiredPublicEnv('PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
	);
}
