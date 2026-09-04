# Katalogmigrering fra Lovable

`/tools`, `/use-cases` og `/resources` blev flyttet fra det gamle Lovable-site
(`learn-ai-nu`) til denne platform. Indholdet lå i Supabase-tabellerne `tools`,
`use_cases` og `resources` og ligger nu i platformens eget Supabase-projekt med
RLS som autorisationsgrænse.

## Kilde og omfang

Alle publicerede rækker er migreret i begge sprog:

| Kilde-tabel | Dansk side | Engelsk side | Antal (da/en) |
| --- | --- | --- | --- |
| `tools` | `/tools` | `/en/tools` | 23 / 23 |
| `use_cases` | `/use-cases` | `/en/use-cases` | 31 / 31 |
| `resources` | `/resources` | `/en/resources` | 22 / 22 |
| `events` | `/events` | `/en/events` | 8 / 8 |

Lovable havde brug for globalt unikke slugs og gav derfor sine engelske rækker
et `-en`-suffiks. Vores nøgle er `(slug, locale)`, så suffikset fjernes under
importen, og de to sprog deler slug, hvor kilden parrede dem. Use cases har
oversatte slugs og kan derfor ikke parres.

Lovable-databasens artikler (178 da / 150 en) og prompts (60 da / 68 en) er
ikke migreret. De overlapper med `content_items`, som allerede har sin egen
import og redaktionelle proces — se `content-import.md`.

## To migrationer

- `20260904090000_catalog_from_lovable.sql` opretter de tre kataloger og det
  danske indhold.
- `20260904120000_catalog_english_and_events.sql` tilføjer `events`-tabellen,
  kolonnen `resources.content_language` og det engelske indhold i alle fire
  kataloger.

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

## Sider og sprog

Hvert katalog er én komponent i `src/components/catalog/`, som tager `locale`
som prop og selv henter data. Siderne under `src/pages/` og `src/pages/en/` er
tynde indpakninger, så de to sprog aldrig kan komme til at divergere i markup.
Alle er server-renderede (`prerender = false`) som `/laer` og `/kurser`, så
redaktionelle rettelser slår igennem uden ny deployment.

Enum-værdier gemmes sprogneutralt (`hr`, `bog`, `fysisk`); kun labels
oversættes, via `labels(locale, set)` i `src/lib/catalog/index.ts`. Siderne
sætter `<html lang>` og `hreflang`-alternates gennem `SiteLayout`.

Ressourcer har både `locale` (hvilken side de vises på) og `content_language`
(hvilket sprog ressourcen selv er på). En dansk podcast i det engelske katalog
mærkes derfor "Danish" i stedet for at blive skjult.

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

Katalogerne administreres under `/admin/vaerktoejer`, `/admin/use-cases`,
`/admin/ressourcer` og `/admin/events` med samme mønster som resten af CMS'et: sider kræver en
session og rollen `admin` eller `editor`, gemmer via ét POST-endpoint
(`/api/admin/catalog/save`) med same-origin-tjek, og skriver med redaktørens
egen session, så RLS er den reelle grænse.

- Nye rækker oprettes altid som kladde og bliver først synlige på sitet, når
  de publiceres.
- `sort_order` styrer rækkefølgen på de offentlige sider. For events er det
  datoen, der bestemmer, om et event står under kommende eller tidligere.
- Hver række har et sprog, som vælges i formularen og vises i listerne som
  `DA`/`EN`.
- Felter med flere værdier (nøglefunktioner, gevinster, emner) redigeres som
  én værdi pr. linje. Kategorier og mærkater er afkrydsningsfelter, så de
  matcher labels i `src/lib/catalog`.
- Kun `http(s)`-URL'er accepteres, både i formularvalideringen og igen når
  data læses ud til siderne — værdierne ender i `href` og `src`.

## Gamle links

`/vaerktoejer` var tidligere en placeholder-side. Den er fjernet og redirecter
nu til `/tools` (se `astro.config.mjs`), så URL'erne fra det gamle site
(`/tools`, `/use-cases`, `/resources`) er bevaret uændret.
