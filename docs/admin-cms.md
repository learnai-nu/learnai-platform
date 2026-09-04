# LearnAI admin-CMS

## Omfang

Sprint 6 leverer et serverrenderet adminområde under `/admin` til:

- redaktionelt indhold og publiceringsstatus;
- kurser, moduler og lektioner;
- quizindstillinger, spørgsmål, svarmuligheder og beskyttet facit;
- katalogerne bag `/tools`, `/use-cases` og `/resources`.

CMS'et anvender almindelige HTML-formularer og kræver ikke klient-JavaScript.

## Autorisation

- Sider og mutationer validerer sessionen med Supabase `getClaims()`.
- Rollen læses kun fra `app_metadata.role`.
- Roller `admin` og `editor` har redaktionel adgang.
- Alle normale skrivninger udføres med brugerens egen Supabase-session og eksisterende RLS.
- Adminmutationer kræver et præcist same-origin `Origin`-header.
- Der bruges ingen service-role-nøgle i applikationen.

## Quizfacit

`quiz_option_keys` har fortsat ingen tabelrettigheder for `anon` eller
`authenticated`. Quiz-editoren anvender to smalle RPC-wrappers:

- `public.admin_get_quiz`
- `public.admin_upsert_quiz_question`

De kalder private `SECURITY DEFINER`-funktioner, som selv kontrollerer
`app_metadata.role`. Anonyme brugere har ingen `EXECUTE`-rettighed.
Spørgsmål og facit gemmes atomisk.

## Kataloger

`/admin/vaerktoejer`, `/admin/use-cases` og `/admin/ressourcer` redigerer
tabellerne `tools`, `use_cases` og `resources`. De deler ét gem-endpoint,
`/api/admin/catalog/save`, som vælger tabel og valideringsskema ud fra et
`catalog`-felt i formularen. Nye rækker oprettes altid som kladde
(`published = false`), og `sort_order` bestemmer rækkefølgen på de offentlige
sider. Kun `http(s)`-URL'er accepteres, både ved validering og igen når
katalogerne læses ud til siderne, fordi værdierne ender i `href` og `src`.
Se [`catalog-migration.md`](catalog-migration.md) for datamodellen.

## Redaktionelt tekstformat

CMS'et oversætter en enkel tekstnotation til LearnAI's strukturerede JSON-blocks:

```text
## Overskrift

Almindeligt afsnit.

> Fremhævet pointe.

- Tjeklistepunkt
- Tjeklistepunkt
```

## Begrænsninger

- Eksisterende quizspørgsmåls type kan ikke ændres, fordi det kan gøre historiske
  forsøg tvetydige.
- Sletning er bevidst ikke en del af første adminversion. Publiceret indhold kan
  arkiveres, så data og læringshistorik bevares.
- Medieupload og revisions-/auditlog følger i en senere sprint.
