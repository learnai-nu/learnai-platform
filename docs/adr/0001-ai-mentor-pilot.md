# ADR 0001: Kildebaseret AI Mentor-pilot

- Status: Besluttet
- Dato: 2026-07-31

## Kontekst

LearnAI skal tilbyde personlig vejledning uden at gÃ¸re en sprogmodel til faglig
system of record. Platformen har allerede publicerede danske artikler, guides og
prompts samt Supabase Auth og RLS.

## Beslutning

- AI Mentor er kun tilgÃ¦ngelig for loggede, ikke-anonyme brugere.
- Svar dannes med OpenAI Responses API og `gpt-5.6-terra` som konfigurerbar
  standard. Terra er valgt som balance mellem kvalitet og omkostning til en
  interaktiv lÃ¦ringsfunktion.
- Hver forespÃ¸rgsel groundes i op til seks publicerede danske LearnAI-elementer.
- Kilder vises som interne links, og modellen instrueres i at afvise svar, nÃ¥r
  konteksten ikke rÃ¦kker.
- `store: false` bruges, og LearnAI gemmer ikke spÃ¸rgsmÃ¥l eller svar.
- Kun et dagligt forbrugstal gemmes. Kvoten er 20 spÃ¸rgsmÃ¥l pr. bruger pr. dag.
- OpenAI-nÃ¸glen er server-side og mÃ¥ aldrig fÃ¥ `PUBLIC_`-prefix.
- Bruger-id sendes kun som en envejs SHA-256-baseret `safety_identifier`.

## SikkerhedsgrÃ¦nser

- Indholds-RPC'en er `security invoker` og kan kun kaldes af `authenticated`.
- KvotetÃ¦lleren ligger i `private`, har ingen Data API-grants og muteres gennem
  en afgrÃ¦nset funktion med eksplicit auth-kontrol og transaktionslÃ¥s.
- Private kursusfiler, quizfacit og service-role-nÃ¸gler indgÃ¥r ikke i konteksten.
- Endpointet validerer input, har tidsgrÃ¦nse og returnerer ikke leverandÃ¸rfejl.

## Konsekvenser

Piloten er enkel og privatlivsvenlig, men har ikke flerturnssamtaler, embeddings
eller semantisk vektorsÃ¸gning. Kvaliteten skal mÃ¥les pÃ¥ et dansk evalueringssÃ¦t,
fÃ¸r funktionen udvides eller gÃ¸res til et betalt produkt.
