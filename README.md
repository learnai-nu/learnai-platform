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

## Administration

Brugere med `app_metadata.role` sat til `admin` eller `editor` kan åbne
`/admin`. CMS'et administrerer indhold, kurser, lektioner og quizzer gennem
brugerens egen Supabase-session og eksisterende RLS. Se
[`docs/admin-cms.md`](docs/admin-cms.md) for sikkerhedsmodel og begrænsninger.

## Indholdsimport

Den reproducerbare og privacy-afgrænsede import af den oprindelige
LearnAI-backup er beskrevet i
[`docs/content-import.md`](docs/content-import.md). Kildebackup og genererede
SQL-batches er bevidst udeladt fra Git.

Den redaktionelle vurdering og første publiceringskø findes i
[`docs/editorial-review-2026-07-28.md`](docs/editorial-review-2026-07-28.md).
Den maskinlæsbare prioritering findes i
[`config/editorial-priorities.json`](config/editorial-priorities.json).

Headerens sprogvælger, søgning og profilindikator er beskrevet i
[`docs/site-header.md`](docs/site-header.md).

Katalogsiderne `/tools`, `/use-cases` og `/resources` er migreret fra det
gamle Lovable-site til Supabase-tabellerne `tools`, `use_cases` og `resources`.
Migration, RLS-model og genimport er beskrevet i
[`docs/catalog-migration.md`](docs/catalog-migration.md).

Promptbibliotekets kontrakt, privacy-model og redaktionelle arbejdsgang er
beskrevet i [`docs/prompt-library.md`](docs/prompt-library.md).

Knowledge Graph MVP'ens datamodel, RLS og menneskelige godkendelsesflow er
beskrevet i [`docs/knowledge-graph.md`](docs/knowledge-graph.md).
