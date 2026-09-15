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
    '/vaerktoejer/': '/tools',

    // Legacy English marketing paths → current Danish surfaces (301)
    '/articles': '/laer',
    '/articles/': '/laer',
    '/about': '/om',
    '/about/': '/om',
    '/courses': '/kurser',
    '/courses/': '/kurser',
    '/privacy': '/privatliv',
    '/privacy/': '/privatliv',
    // Query destination is supported by Astro→Vercel redirect emission
    '/prompts': '/laer?type=prompt',
    '/prompts/': '/laer?type=prompt',

    // Orphan fallback: rewrite slug under /laer; missing content stays a real 404
    '/articles/[...slug]': '/laer/[...slug]',
  }
});
