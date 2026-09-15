/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://learnai.nu',
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel(),
  output: 'server',

  redirects: {
    // Keep existing Danish→English tools alias
    '/vaerktoejer': '/tools',

    // Legacy English marketing paths → current Danish surfaces (301)
    '/articles': '/laer',
    '/about': '/om',
    '/courses': '/kurser',
    '/privacy': '/privatliv',
    // Query destination is supported by Astro→Vercel redirect emission
    '/prompts': '/laer?type=prompt',

    // Dynamic /articles/<slug> → /laer/<slug> is handled in src/middleware.ts
    // (Astro config catch-all '[...slug]' is emitted literally by @astrojs/vercel).
  }
});
