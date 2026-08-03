/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_SITE_URL?: string;
	readonly PUBLIC_SUPABASE_URL: string;
	readonly PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
	readonly OPENAI_API_KEY?: string;
	readonly OPENAI_MODEL?: string;
	readonly OPENAI_VECTOR_STORE_ID?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
