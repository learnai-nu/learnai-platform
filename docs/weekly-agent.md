# Instruktioner til den ugentlige LearnAI-agent

Gælder fra november 2026. Erstatter tidligere instruktioner, hvor de er i modstrid.

## Situationen nu

- **learnai.nu er lukket.** Forsiden viser kun logoet, og alle andre offentlige
  adresser sender videre til forsiden.
- **Demositet:** Hele sitet findes kun bag adgangskode på `learnai.nu/demo-site`.
  Det er her, ugens nyheder, podcast og "Denne uge" skal kunne ses.
- **Ugebrevet er privat** og sendes kun til Jesper (`WEEKLY_BRIEF_TO`), ikke til
  tilmeldingslisten i Resend.
- **Supabase-databasen** sættes på pause efter ca. en uge uden aktivitet. En ugentlig
  udgivelse holder den i gang.

## Faste regler

- **Nævn aldrig Jespers arbejdsgiver** eller interne projekter, tal og resultater derfra.
- **Ingen tilbud:** Skriv ikke om kurser, forløb, workshops, rådgivning eller tilbud til
  virksomheder. Henvis aldrig til `/kurser` eller `/virksomheder`.
- **Ingen links til lukkede sider i mailen:** Ugebrevet må ikke linke til artikelsider,
  `/podcast` eller andre sider på learnai.nu. Den eneste undtagelse er lydfilen under `/audio/`.
- **Udgiv via pull request:** Push aldrig direkte til `main`. Brug en branch og en PR,
  og vent på et grønt Vercel-byg, før der merges.
- **Hemmeligheder** (Resend, ElevenLabs, Supabase) må aldrig skrives i filer, commits
  eller logs.
- **Rapportér, hvad du ikke kunne:** Hvis et trin fejler, så stop og skriv præcist hvilket.
  Lad som ingenting er ikke en mulighed.

## Ugentlig rutine

Eksemplerne bruger uge 42 i 2026. Ret år og uge.

### 1. Nyhedspakke

Læg dansk og engelsk markdown pr. kategori i `content/weekly/2026/week-42/`:

| Kategori | Filer |
| --- | --- |
| Headlines & Launches | `Headlines_and_Launches_DA.md` + `_EN.md` |
| Deep Dives & Analysis | `Deep_Dives_and_Analysis_DA.md` + `_EN.md` |
| Marketing | `Marketing_DA.md` + `_EN.md` |
| Business | `Business_DA.md` + `_EN.md` |
| Education (valgfri) | `Education_DA.md` + `_EN.md` |

Hver fil skal have:
- `# Titel`
- `**Underrubrik:**` (EN: `**Standfirst:**`)
- `**Periode:**` (EN: `**Period:**`)
- kilder med links

Brug uge 41 som skabelon. Hver kategori skal have både en dansk og en engelsk fil.

Hero-grafik er valgfri: SVG'er i `public/images/news/2026/week-42/`, og kør derefter
`node scripts/render-news-heroes.mjs public/images/news/2026/week-42`.

### 2. Importér og udgiv nyhederne i Supabase

```bash
pnpm news:prepare content/weekly/2026/week-42 2026 42
```

Kommandoen skriver `draft.sql`, `publish.sql` og `rollback.sql` til `.content-import/week-42/`.
Mappen er git-ignoreret, så filerne må ikke committes.

1. Kør `draft.sql` i Supabase (SQL-editoren). Nyhederne oprettes som kladder.
2. Kontrollér i admin under `learnai.nu/admin/indhold`, eller i tabellen
   `content_items`, at alle filer er kommet ind med titel og tekst.
3. Kør `publish.sql`. Først nu er nyhederne udgivet.
4. Tjek `learnai.nu/demo-site/laer?type=news`: ugens nyheder skal stå øverst.
   "Denne uge" på `learnai.nu/demo-site` henter selv den nyeste udgivne uge fra
   databasen og skal derfor ikke rettes i koden.

Går noget galt, ruller `rollback.sql` importen tilbage.

### 3. Podcast

1. Skriv manuskriptet og generér lyden:

   ```bash
   pnpm podcast:generate -- "/sti/til/Podcast_Uge42_DA.txt" "public/audio/news/2026/week-42/Podcast_Uge42_DA.mp3"
   ```

   Nøglen hentes fra macOS Keychain (`learnai-elevenlabs`); se `docs/podcast-generation.md`.

2. Opdatér `src/lib/podcast/latest-episode.ts`. Den bruges igen af `/demo-site/podcast`
   og af kortet "Lyt til uge X". Ret følgende felter:
   - uge, år og periode,
   - `datePublished`,
   - `durationSeconds` (målt med `ffprobe`),
   - `audioUrl`, `title` og `headline`,
   - de fire `topics` med links til `/laer/uge-42-…`.

3. Commit lydfil og episodefil på en branch, lav en PR, og merge, når Vercel-bygget er grønt.

4. Kontrollér efter deploy, at lydfilen svarer med HTTP 200 på
   `https://learnai.nu/audio/news/2026/week-42/Podcast_Uge42_DA.mp3`, og at størrelsen
   matcher den lokale fil.

### 4. Ugebrev til Jesper

1. Lav ugens JSON efter `examples/weekly-brief.example.json`.
   - `podcastUrl` skal være den direkte adresse til lydfilen fra trin 3.
   - Historiernes `url`, `issueUrl` og kursusfelter bruges ikke og kan udelades.

2. Lav et preview og kontrollér det:

   ```bash
   node scripts/send-weekly-brief.mjs uge42.json --preview preview.html
   ```

   - Podcastknappen skal pege på lydfilen.
   - Der må ikke være links til `learnai.nu/laer`, `/podcast` eller `/kurser`.

3. Send:

   ```bash
   WEEKLY_BRIEF_TO=<Jespers mail> node scripts/send-weekly-brief.mjs uge42.json --send
   ```

   Scriptet sender kun til den adresse. Det kræver `RESEND_API_KEY` og `RESEND_EMAIL_DOMAIN`.

### 5. Afslut med en kort rapport

- Hvilke kategorier der blev udgivet, og antal nyheder.
- Podcastens varighed og lydfilens URL med HTTP-status.
- Om ugebrevet blev sendt (status fra scriptet).
- PR-link og om den er merget.
- Alt, der fejlede eller blev sprunget over, og hvorfor.
