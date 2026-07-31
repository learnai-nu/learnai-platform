# ADR 0001: Kildebaseret AI Mentor-pilot

- Status: Besluttet
- Dato: 2026-07-31

## Kontekst

LearnAI skal tilbyde personlig vejledning uden at gøre en sprogmodel til faglig
system of record. Platformen har allerede publicerede danske artikler, guides og
prompts samt Supabase Auth og RLS.

## Beslutning

- AI Mentor er kun tilgængelig for loggede, ikke-anonyme brugere.
- Svar dannes med OpenAI Responses API og `gpt-5.6-terra` som konfigurerbar
  standard. Terra er valgt som balance mellem kvalitet og omkostning til en
  interaktiv læringsfunktion.
- Hver forespørgsel groundes i op til seks publicerede danske LearnAI-elementer.
- Kilder vises som interne links, og modellen instrueres i at afvise svar, når
  konteksten ikke rækker.
- `store: false` bruges, og LearnAI gemmer ikke spørgsmål eller svar.
- Kun et dagligt forbrugstal gemmes. Kvoten er 20 spørgsmål pr. bruger pr. dag.
- OpenAI-nøglen er server-side og må aldrig få `PUBLIC_`-prefix.
- Bruger-id sendes kun som en envejs SHA-256-baseret `safety_identifier`.

## Sikkerhedsgrænser

- Indholds-RPC'en er `security invoker` og kan kun kaldes af `authenticated`.
- Kvotetælleren ligger i `private`, har ingen Data API-grants og muteres gennem
  en afgrænset funktion med eksplicit auth-kontrol og transaktionslås.
- Private kursusfiler, quizfacit og service-role-nøgler indgår ikke i konteksten.
- Endpointet validerer input, har tidsgrænse og returnerer ikke leverandørfejl.

## Konsekvenser

Piloten er enkel og privatlivsvenlig, men har ikke flerturnssamtaler, embeddings
eller semantisk vektorsøgning. Kvaliteten skal måles på et dansk evalueringssæt,
før funktionen udvides eller gøres til et betalt produkt.
