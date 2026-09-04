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

Katalogets enums hedder `catalog_*`, fordi produktionsdatabasen allerede har
et `public.resource_type` med helt andre værdier (`download`, `link`,
`template`, `prompt`, `video`, `audio`), som tilhører en anden funktion. Et
navnerum er den eneste måde at undgå at låne — eller ændre — en fremmed type.

Hele migrationen kan køres igen oven på et miljø, hvor dele allerede findes:
enums oprettes i en blok, der tier ved dubletter, tabeller og indekser bruger
`if not exists`, triggere og politikker droppes før de genskabes, og rækkerne
indsættes med `on conflict do nothing`.

## Ny import fra en eksport

Eksportér tabellerne som JSON-arrays og generér nye insert-statements:

```sh
pnpm catalog:prepare <mappe-med-eksporter> ny-import.sql
```

Scriptet finder filerne ud fra tabelnavnet i filnavnet, filtrerer til
publiceret dansk indhold, renser importerede punktlister for dekorative emoji
(`✅`, `🚀`), `Gevinst N:`-nummerering og `+ N flere funktioner`-stubbe, og
skriver idempotente inserts. Læs output igennem, og læg det i en ny migration.

## Redigering i CMS'et

Katalogerne administreres under `/admin/vaerktoejer`, `/admin/use-cases` og
`/admin/ressourcer` med samme mønster som resten af CMS'et: sider kræver en
session og rollen `admin` eller `editor`, gemmer via ét POST-endpoint
(`/api/admin/catalog/save`) med same-origin-tjek, og skriver med redaktørens
egen session, så RLS er den reelle grænse.

- Nye rækker oprettes altid som kladde og bliver først synlige på sitet, når
  de publiceres.
- `sort_order` styrer rækkefølgen på de offentlige sider.
- Felter med flere værdier (nøglefunktioner, gevinster, emner) redigeres som
  én værdi pr. linje. Kategorier og mærkater er afkrydsningsfelter, så de
  matcher labels i `src/lib/catalog`.
- Kun `http(s)`-URL'er accepteres, både i formularvalideringen og igen når
  data læses ud til siderne — værdierne ender i `href` og `src`.

## Gamle links

`/vaerktoejer` var tidligere en placeholder-side. Den er fjernet og redirecter
nu til `/tools` (se `astro.config.mjs`), så URL'erne fra det gamle site
(`/tools`, `/use-cases`, `/resources`) er bevaret uændret.
