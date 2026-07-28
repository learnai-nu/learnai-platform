# Sikker quizafvikling

## Formål

Quizzer bedømmes atomisk på databaseserveren. Browseren modtager spørgsmål og svarmuligheder, men aldrig rækker eller korrekte option-id'er fra `quiz_option_keys`.

## Dataflow

1. En logget bruger henter quiz, spørgsmål og svarmuligheder gennem eksisterende RLS.
2. Browseren sender kun `quizId`, `questionId`, valgte option-id'er og eventuel fritekst til `POST /api/quizzes/submit`.
3. Astro-endpointet validerer JWT med `getClaims()` og payloaden med Zod.
4. Endpointet kalder `public.submit_quiz` med brugerens egen Supabase-session.
5. Den invoker-baserede wrapper kalder `private.grade_quiz`.
6. Den private funktion kontrollerer adgang og `max_attempts`, bedømmer og gemmer attempt og answers i samme transaktion.
7. Browseren modtager score, bestået-status, antal forsøg og forklaringer. Korrekte option-id'er returneres ikke.

## Privilegier

- `anon` har ingen `EXECUTE`-rettighed på quizfunktionerne.
- `authenticated` kan kalde den smalle public wrapper.
- Kernefunktionen ligger i det ikke-eksponerede `private`-schema.
- Kernefunktionen er `SECURITY DEFINER`, har fast `search_path` og kontrollerer altid `auth.uid()` og lektionsadgang.
- Wrapperen er `SECURITY INVOKER`.
- Astro bruger aldrig `service_role`.
- `quiz_option_keys` har ingen tabelrettigheder for `anon` eller `authenticated`.
- `authenticated` kan læse quizspørgsmålet, men ikke kolonnen `quiz_questions.explanation`; forklaringen returneres først efter bedømmelsen.

## Fejl og statuskoder

| Situation | HTTP |
|---|---:|
| Ikke logget ind | 401 |
| Ugyldig besvarelse | 400 |
| Ingen adgang til quiz | 403 |
| Maksimalt antal forsøg brugt | 409 |
| Uventet bedømmelsesfejl | 500 |

Alle quizresponses bruger `Cache-Control: private, no-store`.

## Tests

Automatiske Vitest-tests kontrollerer payloadvalidering, dublerede spørgsmål, UUID- og længdegrænser, resultatfiltrering og `max_attempts`-fejl.

Databasefunktionen er verificeret mod det aktive Supabase-projekt i rollback-transaktioner:

- komplet aflevering, scoring og forklaringer;
- oprettelse af attempt og answers uden persistente testdata;
- håndhævelse af `max_attempts`;
- rollback til den oprindelige quizkonfiguration.

## Migration

Implementeringen ligger i:

`supabase/migrations/20260728101349_secure_quiz_grading.sql`

Efter ændringer køres:

```text
pnpm test
pnpm lint
pnpm check
pnpm build
```

Kør derefter Supabase Security Advisor og gennemgå nye advarsler før deployment.
