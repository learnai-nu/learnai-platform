# LearnAI admin-CMS

## Omfang

Sprint 6 leverer et serverrenderet adminområde under `/admin` til:

- redaktionelt indhold og publiceringsstatus;
- kurser, moduler og lektioner;
- quizindstillinger, spørgsmål, svarmuligheder og beskyttet facit;
- katalogerne bag `/tools`, `/use-cases` og `/resources`.

CMS'et anvender almindelige HTML-formularer og kræver ikke klient-JavaScript.

## Autorisation

### Kursusstatus

Administratorer ser kursusstatistik på `/admin` og `/admin/kurser`: tilmeldte,
ikke startet, i gang, fuldført og konvertering for hele perioden.
`enrollments` er grundlaget for tilmeldinger; `lesson_progress` er grundlaget
for aktivitet og gennemførsel. Fuldført kræver alle kursets nuværende lektioner,
ikke en afrundet procent eller den potentielt forældede enrollment-status.
Konvertering er fuldførte **blandt tilmeldte** divideret med tilmeldte.
Samlet rate er vægtet efter antal tilmeldinger. Ingen tilmeldinger vises som `—`.

Historiske fremskridt uden enrollment tælles i aktivitet, men holdes ude af
konverteringen og vises med en datakvalitetsnote. Kontooprettelse alene er ikke
en kursustilmelding; det eksisterende sign-up-flow opretter ikke enrollments.
Denne oversigt ændrer ikke tilmeldings- eller betalingsflowet.

Migrationen `admin_course_statistics` tilføjer en adminbeskyttet, privat
aggregatfunktion og en offentlig SECURITY INVOKER-wrapper. Kun summerede tal
returneres, og eksisterende RLS på kursistdata ændres ikke. SQL-testen i
`supabase/tests/admin_course_statistics.sql` tester beregninger og rettigheder
i en transaktion, der rulles tilbage.

### Quizstatistik

Admin-overblikket `/admin` viser også quizstatistik: unikke deltagere,
afleverede og beståede forsøg, beståelsesprocent og gennemsnitlig score,
samlet og pr. quiz med kursusnavn. Kun forsøg med `completed_at` indgår.
Gentagne forsøg tæller i resultaterne, men personer tælles kun én gang i
det samlede deltagerantal. Samlet gennemsnit beregnes over alle afleverede
forsøg med score, inklusive nul; det er ikke et gennemsnit af quizgennemsnit.
Manglende beregningsgrundlag vises som `—`. Browserbesvarelser registreres
først ved aflevering, så oversigten viser ikke quizzer, der stadig udfyldes.

`admin_quiz_statistics` følger samme private, adminbeskyttede aggregatmønster
som kursusstatistikken. SQL-testen `supabase/tests/admin_quiz_statistics.sql`
kontrollerer gentagne forsøg, tomme quizzer, ufærdige forsøg, vægtet
gennemsnit, unikke deltagere og afvisning af ikke-administratorer.

### Deltagere og fremskridt

Kursusstatistikkens kort, kursusnavne og tal linker til `/admin/deltagere` med
filtre for kursus og status. Administratorer kan søge efter navn/e-mail og
se tilmelding, status, fuldførte lektioner, procent og seneste gemte aktivitet.
Hver række kan foldes ud til en ordnet liste over lektionernes status.
Historiske deltagere uden enrollment er med, ligesom i kursusstatistikken.
Konverteringslinket viser kun tilmeldte, der har fuldført.

`admin_course_participants` returnerer højst 50 kursusforløb pr. side.
Navn kommer fra `profiles.display_name`, e-mail fra `auth.users`; hvis navnet
mangler, vises det eksplicit. Funktionen kræver en bruger-id og adminrollen
i serverstyret `app_metadata`. Editor og anon afvises både på siden og i
databasen. Ingen nye direkte tabelrettigheder tildeles. Siden caches ikke,
har noindex og bruger ikke analytics. SQL-testen kontrollerer også, at
lektionsfremskridt ikke blandes mellem deltagere.

### Generel adgangskontrol

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
