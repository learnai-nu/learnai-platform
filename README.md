# LearnAI.nu

Dansk, content-first AI-læringsplatform bygget med Astro, Supabase og Vercel.

## Teknologi

- Astro og TypeScript
- Tailwind CSS
- React islands til afgrænset interaktivitet
- Supabase til database, Auth, RLS og Storage
- Vercel til previews og produktion
- Stripe, Resend og n8n i senere sprints

## Lokal start

1. Kopiér `.env.example` til `.env`.
2. Indsæt Supabase-projektets offentlige URL og publishable key.
3. Kør `pnpm dev`.

## Kvalitetskontrol

```sh
pnpm check
pnpm build
```

## Arkitektur

Offentlige indholdssider prerenderes som standard. Login, dashboard, progression,
quiz og betaling overgår til on-demand rendering, efterhånden som de implementeres.
Læs `../LearnAI-CODEX-MASTER.md` før større ændringer.
