# Ugentlig podcast med ElevenLabs

LearnAI genererer den danske ugepodcast med ElevenLabs og den godkendte stemme
**Søren** (`xj6X4BCUsv9oxohm1E8o`). Generatoren bruger
`eleven_multilingual_v2` og leverer MP3 i 44,1 kHz/128 kbps.

## Hemmeligheder

`ELEVENLABS_API_KEY` skal være en server-side Secret i Vercel for både Preview
og Production. Nøglen må aldrig have et `PUBLIC_`-præfiks eller gemmes i Git.

Den lokale ugentlige agent kan ikke hente Vercels Secret-værdi. På den Mac, der
kører agenten, gemmes samme nøgle derfor separat i macOS Keychain under
service-navnet `learnai-elevenlabs`. Brug Keychain Access eller denne
interaktive kommando; skriv aldrig nøglen som et kommandolinjeargument:

```sh
security add-generic-password -U -s learnai-elevenlabs -w
```

Generatoren læser først `ELEVENLABS_API_KEY` fra procesmiljøet og derefter fra
Keychain. Den skriver eller logger aldrig nøglen.

## Generering

```sh
pnpm podcast:generate -- \
  "/sti/til/Podcast_Uge37_DA.txt" \
  "/sti/til/Podcast_Uge37_DA.mp3"
```

Output skrives atomisk og accepteres kun, når ElevenLabs svarer med en reel
lydfil på mindst 10 KB. Eksisterende output overskrives ikke utilsigtet.

Efter generering skal den ugentlige agent fortsat kontrollere varighed,
filstørrelse, offentlig HTTP-status og matchende filstørrelse/hash, før et link
må bruges i ugebrevet. macOS-stemmen Sara er kun nød-fallback og skal altid
rapporteres som fallback.

## Ugebrevet efter lukningen af learnai.nu

learnai.nu er lukket og viser kun logoet; `/podcast` og artikelsiderne findes ikke længere.
Ugebrevet er derfor en privat mail, der kun sendes til adressen i `WEEKLY_BRIEF_TO`:

- Historierne læses i selve mailen. `url` på en historie er valgfri og vises ikke.
- `issueUrl`, `courseTitle` og `courseUrl` ignoreres.
- `podcastUrl` skal pege direkte på lydfilen, fx
  `https://learnai.nu/audio/news/2026/week-41/Podcast_Uge41_DA.mp3`. Lydfiler under
  `public/audio/` serveres stadig, selv om sitet er lukket.
- `src/lib/podcast/latest-episode.ts` skal ikke længere opdateres; det vises ingen steder.

Kør som før:

```bash
node scripts/send-weekly-brief.mjs uge.json --preview preview.html   # kontrollér mailen
WEEKLY_BRIEF_TO=din@mail.dk node scripts/send-weekly-brief.mjs uge.json --send
```

Før udsendelse skal HTML-previewet kontrolleres for, at podcastknappen peger på lydfilen, og at
lydfilen svarer med HTTP 200 efter deploy.
