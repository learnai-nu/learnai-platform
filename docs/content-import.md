# Import af LearnAI-backup

Importen er bevidst opdelt i forberedelse og databasekørsel. Den oprindelige
backupfil og de genererede SQL-filer bliver aldrig committed.

## Første kuraterede import

- alle publicerede danske `guide`- og `viden`-artikler;
- danske nyheder publiceret fra og med 5. juli 2026;
- alle publicerede danske prompts;
- alt importeres som `draft`;
- `quiz_results` og `user_roles` udelukkes altid.

Konfigurationen ligger i `config/content-import.json`.

## Forbered

```powershell
pnpm content:prepare C:\sti\til\learnai-backup.json
```

Kommandoen opretter en checksum, en rapport og idempotente SQL-batches i den
git-ignorerede mappe `.content-import/`. Batches begrænses både efter antal
elementer og tegnstørrelse, så lange guides ikke afkortes under overførslen.

## Datamodel

`content_items` udvides med:

- `locale`
- `difficulty`
- `source_key`
- `source_metadata`

`source_key` gør det muligt at køre importen igen uden dubletter. Oprindelige
publiceringsdatoer bevares, mens alt indhold forbliver skjult, indtil en redaktør
ændrer status fra `draft`.

Markdown gemmes som kildeformat og renderes server-side gennem en eksplicit
HTML-tilladelsesliste. Scripts, billeder, event handlers og `javascript:`-links
fjernes.

## Import gennemført 28. juli 2026

- 79 danske kladder
- 9 vidensartikler
- 4 guides
- 6 nyere nyheder
- 60 prompts
- 123 forskellige tags og 393 indholdsrelationer
- 0 importerede quizresultater, brugerroller eller e-mailadresser

Backupens SHA-256:
`2f32b812fa649d31026e67532297537c5ae4e8e2ea0bdef88f74ed1913bfbf92`
