# LearnAI promptbibliotek

## Status

Første redaktionelle bølge består af 20 prompts. De står i `review` og er ikke
offentligt synlige. Administratorer og redaktører kan åbne dem i CMS'et og bruge
den private forhåndsvisning.

## Datamodel

Prompts er fortsat `content_items` med typen `prompt`. Den strukturerede
definition ligger i `source_metadata.prompt_definition`:

```json
{
  "version": 1,
  "template": "Skriv om [EMNE] til [MÅLGRUPPE].",
  "fields": [
    {
      "key": "emne",
      "token": "[EMNE]",
      "label": "Emne",
      "placeholder": "Skriv emne…",
      "input_type": "text",
      "required": true,
      "options": []
    }
  ],
  "privacy_notice": "Del ikke fortrolige oplysninger.",
  "tool_note": null
}
```

Formatet valideres med Zod på serveren. Hvis metadata ikke validerer, falder
indholdssiden tilbage til den almindelige Markdown-visning.

## Privacy

- Brugerens input lever kun i React-komponentens lokale state.
- Input sendes ikke til LearnAI, Supabase eller en AI-tjeneste.
- Kopiering bruger browserens clipboard-API efter et aktivt klik.
- Følsomme prompttyper viser en skærpet databeskyttelsesadvarsel.

## Redaktionel arbejdsgang

1. Kør `pnpm editorial:prepare <backupfil>` for at regenerere SQL-batches.
2. Kontrollér rapporten og prøvekør batches med rollback.
3. Anvend batches på Supabase.
4. Åbn `/admin/indhold`.
5. Redigér og forhåndsvis hvert element.
6. Publicér manuelt, når definition of done er opfyldt.

Kildebackup og SQL-batches er ikke versionsstyret. Script, prioritering og
kontrakter ligger i repositoryet, så processen kan reproduceres.

## Første bølge

Den præcise liste findes i `config/editorial-priorities.json`. Bølgen indeholder:

- 20 prompts;
- 60 strukturerede inputfelter;
- privacy-note på alle prompts;
- værktøjsnote på dokumentprompts;
- status `review`;
- redaktionel provenance i `source_metadata.editorial`.

## Test

`tests/prompts.test.ts` dækker:

- validering af promptmetadata;
- udfyldning af tokens;
- bevarelse af tomme tokens;
- kontrol af obligatoriske felter.
