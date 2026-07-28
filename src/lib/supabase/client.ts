import { createClient } from '@supabase/supabase-js';

function requiredPublicEnv(name: 'PUBLIC_SUPABASE_URL' | 'PUBLIC_SUPABASE_PUBLISHABLE_KEY') {
	const value = import.meta.env[name];
	if (!value) {
		throw new Error(`Miljøvariablen ${name} mangler.`);
	}
	return value;
}

export function createBrowserSupabaseClient() {
	return createClient(
		requiredPublicEnv('PUBLIC_SUPABASE_URL'),
		requiredPublicEnv('PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
		{
			auth: {
				persistSession: true,
				autoRefreshToken: true,
				detectSessionInUrl: true,
			},
		},
	);
}
