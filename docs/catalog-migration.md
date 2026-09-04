# Katalogmigrering fra Lovable

`/tools`, `/use-cases` og `/resources` blev flyttet fra det gamle Lovable-site
(`learn-ai-nu`) til denne platform. Indholdet lå i Supabase-tabellerne `tools`,
`use_cases` og `resources` og ligger nu i platformens eget Supabase-projekt med
RLS som autorisationsgrænse.

## Kilde og omfang

Kun rækker med `locale = 'da'` og `published = true` er migreret, fordi sitet
kører dansk-only:

| Kilde-tabel | Side | Antal |
| --- | --- | --- |
| `tools` | `/tools` | 23 |
| `use_cases` | `/use-cases` | 31 |
| `resources` | `/resources` | 22 |

Engelsk indhold (`locale = 'en'`) og eksporterne af `events` og `courses` er
bevidst ikke migreret.

## Datamodel og sikkerhed

Migrationen `supabase/migrations/20260904090000_catalog_from_lovable.sql`
opretter de tre tabeller, enums for afdeling, kompleksitet, værdi og
ressourcetype, `updated_at`-triggere samt indekser på
`(locale, published, sort_order)`.

RLS følger platformens eksisterende model:

- `*_public_read`: `anon` og `authenticated` må læse rækker, hvor `published`
  er sand. Upublicerede kladder er dermed usynlige for browseren.
- `*_manager_read` og `*_manager_write`: kun sessioner, hvor
  `private.is_content_manager()` er sand (`app_metadata.role` er `admin` eller
  `editor`), kan se kladder og skrive.
- Ingen service-role-nøgle er nødvendig. Siderne bruger brugerens egen session
  via `createServerSupabaseClient`.

Indsættelserne er idempotente (`on conflict (slug, locale) do nothing`), så
migrationen kan køres på et miljø, hvor katalogerne allerede er delvist
importeret.

## Sider

`src/pages/tools.astro`, `use-cases.astro` og `resources.astro` er
server-renderede (`prerender = false`) som `/laer` og `/kurser`, så
redaktionelle rettelser slår igennem uden ny deployment. Data hentes typet
gennem `src/lib/catalog/index.ts`, som også holder de danske labels til
enum-værdierne.

Søgning og facetfiltre er progressiv forbedring i
`src/scripts/catalog-filter.ts`: alt indhold står i HTML fra serveren, og
scriptet skjuler blot de kort, der falder uden for filtrene. Fejler
Supabase-kaldet, vises en fejlbesked i stedet for et tomt katalog.

## Kør migrationen

```sh
supabase db push
```

Alternativt kan SQL-filen indsættes direkte i Supabase Studio's SQL-editor.
Migrationen forudsætter, at `private.is_content_manager()` findes — den blev
oprettet i `20260728120600_admin_quiz_editor.sql`.

## Ny import fra en eksport

Eksportér tabellerne som JSON-arrays og generér nye insert-statements:

```sh
pnpm catalog:prepare <mappe-med-eksporter> ny-import.sql
```

Scriptet finder filerne ud fra tabelnavnet i filnavnet, filtrerer til
publiceret dansk indhold, renser importerede punktlister for dekorative emoji
(`✅`, `🚀`), `Gevinst N:`-nummerering og `+ N flere funktioner`-stubbe, og
skriver idempotente inserts. Læs output igennem, og læg det i en ny migration.

## Åbne punkter

- CMS'et under `/admin` administrerer endnu ikke de tre kataloger. Tabellerne
  er klar til det: skrivepolitikkerne kræver netop redaktør- eller
  admin-rollen, som resten af CMS'et bygger på.
- Kolonnen `sort_order` styrer rækkefølgen og gør det muligt at kuratere
  katalogerne uden kodeændringer.

## Gamle links

`/vaerktoejer` var tidligere en placeholder-side. Den er fjernet og redirecter
nu til `/tools` (se `astro.config.mjs`), så URL'erne fra det gamle site
(`/tools`, `/use-cases`, `/resources`) er bevaret uændret.
