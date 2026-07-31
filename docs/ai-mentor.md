# AI Mentor

AI Mentor er en loginbeskyttet beta, som svarer ud fra publiceret dansk
LearnAI-indhold og linker tilbage til kilderne.

## Miljøvariabler

```text
OPENAI_API_KEY=<server-only secret>
OPENAI_MODEL=gpt-5.6-terra
```

Sæt variablerne i Vercel for Preview og Production. Nøglen må aldrig ligge i
Git, en `PUBLIC_`-variabel eller browserkode.

## Data

Migrationen `20260731120000_ai_mentor_pilot.sql`:

- udvider `profiles` med branche, foretrukne værktøjer og onboarding-tidspunkt,
- opretter en privat daglig kvotetæller,
- opretter en RLS-bevidst søgning i publiceret dansk indhold.

Spørgsmål og svar gemmes ikke af LearnAI. API-kald sendes med `store: false`.

## Verifikation

1. Log ind og udfyld `/dashboard/profil`.
2. Åbn `/mentor` og send et spørgsmål, der matcher en publiceret guide.
3. Kontrollér at svaret viser interne LearnAI-kilder.
4. Kontrollér at en anonym forespørgsel til endpointet afvises.
5. Kør tests, lint, Astro check og Supabase security/performance advisors.
