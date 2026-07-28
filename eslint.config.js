import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
	{
		ignores: ['.astro/**', '.vercel/**', 'dist/**', 'node_modules/**'],
	},
	...tseslint.configs.recommended,
	...astro.configs['flat/recommended'],
];
