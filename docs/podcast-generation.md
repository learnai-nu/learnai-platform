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

## Opdatér ugens episode på sitet

Ugens episode vedligeholdes ét sted: `src/lib/podcast/latest-episode.ts`. Opdatér uge, år,
periode, publiceringsdato, valideret varighed, lydfil, overskrift og ét aktuelt emnespor for
hver inkluderet kategori. Både `/podcast` og forsidens sektion "Denne uge" læser fra filen,
så de altid viser samme uge.

Testen `tests/latest-podcast.test.ts` finder automatisk den nyeste lydfil under
`public/audio/news/` og fejler, hvis episodeobjektet stadig peger på en tidligere uge. En ny
podcastfil må derfor ikke deployes alene: episodeobjektet og kategori-linkene skal opdateres i
samme commit.

## Ugebrevets podcastlink

Podcastblokken i ugebrevet skal altid føre til `https://learnai.nu/podcast`, hvor lytteren får
afspilleren, ugens emner og links til artiklerne. Den rå MP3/M4A-URL bruges kun til teknisk
validering af lydfilen og må ikke være mailens CTA eller plaintext-link.

Før udsendelse skal HTML-previewet kontrolleres for begge dele:

- podcastknappen peger på `https://learnai.nu/podcast`;
- ingen `href` i podcastblokken peger direkte på `/audio/news/`.
