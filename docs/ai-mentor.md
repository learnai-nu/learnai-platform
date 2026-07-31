# AI Mentor

AI Mentor er en loginbeskyttet beta, som svarer ud fra publiceret dansk
LearnAI-indhold og linker tilbage til kilderne.

## MiljÃ¸variabler

```text
OPENAI_API_KEY=<server-only secret>
OPENAI_MODEL=gpt-5.6-terra
```

SÃ¦t variablerne i Vercel for Preview og Production. NÃ¸glen mÃ¥ aldrig ligge i
Git, en `PUBLIC_`-variabel eller browserkode.

## Data

Migrationen `20260731120000_ai_mentor_pilot.sql`:

- udvider `profiles` med branche, foretrukne vÃ¦rktÃ¸jer og onboarding-tidspunkt,
- opretter en privat daglig kvotetÃ¦ller,
- opretter en RLS-bevidst sÃ¸gning i publiceret dansk indhold.

SpÃ¸rgsmÃ¥l og svar gemmes ikke af LearnAI. API-kald sendes med `store: false`.

## Verifikation

1. Log ind og udfyld `/dashboard/profil`.
2. Ã…bn `/mentor` og send et spÃ¸rgsmÃ¥l, der matcher en publiceret guide.
3. KontrollÃ©r at svaret viser interne LearnAI-kilder.
4. KontrollÃ©r at en anonym forespÃ¸rgsel til endpointet afvises.
5. KÃ¸r tests, lint, Astro check og Supabase security/performance advisors.
