# Knowledge Graph MVP

LearnAI's Knowledge Graph er et internt, redaktionelt lag oven på de eksisterende
indholds- og kursustabeller. Det erstatter ikke `content_items`, tags, kategorier
eller kursusstrukturen.

## Model

- `entities` indeholder kuraterede værktøjer, emner, begreber, målgrupper, use
  cases, brancher og kompetencer.
- `knowledge_nodes` giver FK-sikrede grafnoder til `content_items`, `courses`,
  `lessons` og `entities`.
- `relationships` forbinder to noder og har workflowet `proposed`, `approved`,
  `rejected` og `archived`.

Migrationsfilen backfiller noder til eksisterende indhold, kurser og lektioner.
Smalle triggers opretter automatisk noder for fremtidige rækker.

## Adgang

- Tabellerne har RLS og ingen grants til `anon`.
- Kun brugere med `app_metadata.role` sat til `admin` eller `editor` kan læse
  eller ændre grafen.
- Webapplikationen bruger brugerens egen Supabase-session; der anvendes ingen
  service-role-nøgle.
- Relationer kan ikke slettes gennem browserrollen. De arkiveres.

## AI-forslag

Fra `/admin/vidensgraf` kan en editor vælge en artikel, et kursus eller en
lektion. Serveren sender den valgte kilde og kataloget af publicerede entities
til OpenAI Responses API med `store: false` og strict Structured Outputs.

AI'en kan kun vælge eksisterende entity-node-ID'er og relationstyperne `about`,
`mentions`, `uses`, `demonstrates` og `targets`. Resultatet valideres igen med
Zod. Alle rækker indsættes som `origin = 'ai'` og `status = 'proposed'`.

En separat menneskelig handling er nødvendig for at godkende eller afvise.
Databasetriggeren sætter selv `reviewed_by` og `reviewed_at` og beskytter
behandlede relationer mod efterfølgende tavse ændringer.

## Før produktion

1. Afstem repositoryets migrationshistorik med live-databasen.
2. Find eller genskab den manglende `LearnAI-CODEX-MASTER.md`.
3. Anvend migrationen i et isoleret preview-/branchmiljø.
4. Generér TypeScript-typer efter migrationen.
5. Kør tests, lint, Astro check, build og Supabase security/performance advisors.
6. Opret et lille kurateret entity-katalog og evaluer AI-forslagenes precision.
