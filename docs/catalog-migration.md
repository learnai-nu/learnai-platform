# Katalogmigrering fra Lovable

`/tools`, `/use-cases` og `/resources` blev flyttet fra det gamle Lovable-site
(`learn-ai-nu`) til denne platform. Indholdet lå i Supabase-tabellerne `tools`,
`use_cases` og `resources` og er nu bygget ind i sitet som statiske data.

## Kilde og omfang

Kun rækker med `locale = 'da'` og `published = true` er migreret, fordi sitet
kører dansk-only:

| Kilde-tabel | Side | Antal |
| --- | --- | --- |
| `tools` | `/tools` | 23 |
| `use_cases` | `/use-cases` | 31 |
| `resources` | `/resources` | 22 |

Engelske rækker (`locale = 'en'`) er bevidst ikke migreret. De kan hentes samme
vej, hvis platformen på et tidspunkt får engelske ruter.

## Datamodel

Data ligger i `src/data/tools.json`, `src/data/use-cases.json` og
`src/data/resources.json` og læses typet gennem `src/lib/catalog/index.ts`.
Siderne er prerenderede (`prerender = true`), så katalogerne ikke belaster
Supabase eller kræver server-rendering. Søgning og filtre er progressiv
forbedring i `src/scripts/catalog-filter.ts`: alt indhold står i HTML fra
starten, og scriptet skjuler blot kort, der falder uden for filtrene.

Under migreringen blev importerede punktlister renset for dekorative emoji
(`✅`, `🚀`), for `Gevinst N:`-nummerering og for afkortnings-stubbene
`+ N flere funktioner`, som ikke pegede nogen steder hen.

## Opdatering af data

Eksportér tabellerne fra Supabase som JSON-arrays og kør:

```sh
pnpm catalog:prepare <mappe-med-eksporter>
```

Scriptet finder filerne ud fra tabelnavnet i filnavnet, filtrerer til publiceret
dansk indhold og skriver de tre JSON-filer. Kør derefter `pnpm test` og
`pnpm build`.

Hvis katalogerne senere skal redigeres i CMS'et, er næste skridt at flytte de
samme felter ind i Supabase med RLS som autorisationsgrænse og lade siderne
hente data på samme måde som `/laer`.

## Gamle links

`/vaerktoejer` var tidligere en placeholder-side. Den er fjernet og redirecter
nu til `/tools` (se `astro.config.mjs`), så URL'erne fra det gamle site
(`/tools`, `/use-cases`, `/resources`) er bevaret uændret.
