# Google lukker op, Meta og Reflection åbner op

**Underrubrik:** Gemini 4 Argon blev tilgængelig for alle betalende udviklere, mens Meta og Reflection frigav vægtene til to af de største åbne modeller til dato. Samme uge kom en ny type modeller, der svarer med sandsynligheder i stedet for tekst.

**Periode:** 12.–18. oktober 2026

> **Kort fortalt**
> - Google gjorde 13. oktober Gemini 4 Argon bredt tilgængelig til en introduktionspris på 2 dollar input og 10 dollar output pr. million tokens.
> - Meta frigav 15. oktober Muse Spark Open: 816 mia. parametre, 42 mia. aktive og et kontekstvindue på 1 million tokens.
> - Reflection frigav 16. oktober vægtene til Beam under Apache 2.0 – 501 mia. parametre, 23 mia. aktive.
> - Perplexity, Liquid AI og Sqwish Labs lancerede "decision models", der returnerer strukturerede beslutninger med sandsynligheder.
> - OpenAI og xAI opdaterede deres stemmemodeller: GPT-Live-1.1 i ChatGPT Voice og Grok Voice 3.0 i xAI's API.

## Indhold

- [Gemini 4 Argon til alle betalende](#gemini-4-argon-til-alle-betalende)
- [To store åbne modeller på to dage](#to-store-abne-modeller-pa-to-dage)
- [Modeller, der svarer med sandsynligheder](#modeller-der-svarer-med-sandsynligheder)
- [Stemmen bliver opdateret hos OpenAI og xAI](#stemmen-bliver-opdateret-hos-openai-og-xai)
- [Og i øvrigt](#og-i-ovrigt)

## Gemini 4 Argon til alle betalende

Den 13. oktober gjorde Google Gemini 4 Argon tilgængelig globalt for udviklere og virksomheder via API'et i AI Studio og Gemini-platformen. Modellen kom samtidig til Google AI Ultra- og Pro-abonnenter i Gemini-appen og i AI Mode i Søgning.

Google positionerer Argon til dybt arbejde i komplekse opgaver inden for kode, finans, jura, cybersikkerhed og videnskab, og oplyser, at modellen ligger nummer ét på Vals Index, der måler ydelse i økonomisk vigtige brancher. Introduktionsprisen er 2 dollar pr. million input-tokens og 10 dollar pr. million output-tokens, med 95 % rabat på cachede input-tokens.

Googles egne eksempler er interne: Argon har ifølge Google øget antallet af agent-indsendte kodeændringer med over 35 % og reduceret tilbagerulninger med næsten en tredjedel. Det er virksomhedens egne tal, ikke en uafhængig måling.

## To store åbne modeller på to dage

Den 15. oktober frigav Meta vægtene til Muse Spark Open, som Meta kalder den mest kapable amerikanske open-weight-model til dato. Den er nativt multimodal med 816 mia. parametre i alt, 42 mia. aktive og et kontekstvindue på 1 million tokens, og den er bygget til kode og agentarbejde. Meta fremhæver, at modellen kan køre på to Mac Studio-maskiner med M5 Ultra.

Dagen efter, den 16. oktober, frigav Reflection vægtene til Beam på Hugging Face under Apache 2.0. Beam er en sparse mixture-of-experts-model med 501 mia. parametre og 23 mia. aktive, lanceret sammen med over 40 partnere til inferens, finjustering og drift.

Licenserne er ikke ens. Beam er under Apache 2.0, som tillader fri kommerciel brug. Muse Spark Open er under Metas egen Muse Model License "med begrænsede kommercielle vilkår". Den forskel uddybes i ugens Deep Dives-artikel.

## Modeller, der svarer med sandsynligheder

En mindre omtalt tendens i ugen var "decision models": modeller, der ikke skriver tekst, men returnerer en struktureret beslutning med en sandsynlighed.

Sqwish Labs lancerede 14. oktober kettei-familien til routing og kontrol af beviser. Liquid AI lancerede 15. oktober d1-ultra, der tager tekst og billeder og returnerer sandsynligheder for ja/nej-, valg- og scoringsspørgsmål. Perplexity frigav 16. oktober pplx-decider-v1.2 og en flash-udgave som open-weight-modeller, der kan besvare flere spørgsmål om samme input i én kørsel.

For organisationer er det relevant, fordi mange AI-opgaver i praksis er klassificering: Hvilken afdeling skal en henvendelse til? Er dokumentet komplet? Overholder teksten retningslinjerne? En model, der svarer "ja, 0,92" i stedet for et afsnit tekst, er lettere at kontrollere, logge og sætte tærskler for.

## Stemmen bliver opdateret hos OpenAI og xAI

OpenAI begyndte 15. oktober at rulle GPT-Live-1.1 og den mindre GPT-Live-1.1 Quip ud i ChatGPT Voice med mere naturlige accenter og flere sprogspecifikke stemmer. Udrulningen gælder ChatGPT Voice, ikke generel API-adgang. Dagen før lancerede xAI Grok Voice 3.0, en tale-til-tale-model i selskabets Voice Agent API.

## Og i øvrigt

Meta introducerede 12. oktober Muse Wonder og Muse Wonder Full til personlige og professionelle agentopgaver. Institute of Foundation Models og Inception42 frigav 15. oktober Jais 3, seks åbne arabiske sprogmodeller fra 900 mio. til 375 mia. parametre. NVIDIA frigav samme dag Nemotron 3.5 Super VL og Bolt til multimodale agent-arbejdsgange.

## Kilder

- [Gemini 4 Argon: Built to solve your hardest problems](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/) · Primær kilde · 13. oktober 2026 · Tilgængelighed og introduktionspris
- [Introducing Muse Spark Open](https://research.meta.ai/blog/muse-spark-open) · Primær kilde · 15. oktober 2026 · Parametre, kontekst og licens
- [Beam is now available](https://reflection.ai/blog/beam-is-available) · Primær kilde · 16. oktober 2026 · Vægte under Apache 2.0
- [pplx-decider-v1.2](https://huggingface.co/perplexity-ai/pplx-decider-v1.2) · Primær kilde · 16. oktober 2026
- [Liquid AI d1-ultra](https://www.liquid.ai/blog/d1-ultra) · Primær kilde · 15. oktober 2026
- [Grok Voice 3](https://x.ai/news/grok-voice-3) · Primær kilde · 14. oktober 2026
- [AI models released in October 2026](https://www.nocode.mba/ai-release-tracker/2026/10) · Uafhængig dækning · november 2026 · Udgivelsesoversigt

## FAQ

### Skal vi skifte til Gemini 4 Argon?

Ikke på baggrund af overskrifterne. Test den på én konkret, længere opgave fra jeres egen hverdag, og mål kvalitet og den tid, det tager at gennemgå resultatet. Bemærk, at prisen er en introduktionspris.

### Kan vi bruge Muse Spark Open kommercielt?

Måske. Licensen har "begrænsede kommercielle vilkår", så læs Muse Model License, før I bygger på den. Beam er under Apache 2.0 og har ikke den begrænsning.

### Hvad bruger man en decision model til?

Til opgaver med faste svarmuligheder: routing af henvendelser, kontrol af om noget er komplet, eller vurdering op mod en tjekliste. Fordelen er, at sandsynligheden gør det let at sende de usikre sager videre til et menneske.
