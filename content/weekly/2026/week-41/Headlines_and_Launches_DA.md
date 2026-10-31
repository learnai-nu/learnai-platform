# Prisen faldt, og vægtene blev åbnet

**Underrubrik:** Anthropic skar prisen på sin lille model med op til 90 %, OpenAI gav alle ChatGPT-brugere GPT-6, og to åbne storemodeller landede inden for to dage.

**Periode:** 5.–11. oktober 2026

> **Kort fortalt**
> - Claude Haiku 5.5 kom 7. oktober til 0,10 dollar input og 0,50 dollar output pr. million tokens under 100k.
> - OpenAI rullede GPT-6 ud til alle ChatGPT-niveauer 7.–8. oktober, gratisbrugere inklusive.
> - Mistral Large 4 "Le Chonk" åbnede som API-preview 6. oktober med omkring 1 billion parametre.
> - Reflection annoncerede 5. oktober Beam, en 501 mia. parametre stor MoE-model med Apache 2.0-vægte i udsigt.
> - Satya Nadella foreslog 10. oktober en "nødbremse", som mennesker kontrollerer, til agentbaserede modeller.

## Indhold

- [Anthropic starter en priskrig](#anthropic-starter-en-priskrig)
- [GPT-6 til alle, også gratisbrugerne](#gpt-6-til-alle-ogsa-gratisbrugerne)
- [To åbne storemodeller på to dage](#to-abne-storemodeller-pa-to-dage)
- [Nadella beder om en nødbremse](#nadella-beder-om-en-nodbremse)
- [Og i øvrigt](#og-i-ovrigt)

## Anthropic starter en priskrig

Den 7. oktober udsendte Anthropic Claude Haiku 5.5 med en prissætning, der flytter regnestykket for høj-volumen-opgaver: 0,10 dollar pr. million input-tokens og 0,50 dollar pr. million output-tokens for prompts op til 100.000 tokens. Over den grænse stiger det til 0,50 og 2,50 dollar. Cache-læsninger koster 0,01 dollar.

Anthropic oplyser selv, at modellen i gennemsnit koster omkring 75 % mindre at køre end Haiku 4.5 — og 90 % mindre for forespørgsler op til 100k. Samtidig blev prisen for cache-læsninger på Sonnet 5.5 halveret.

Ydelsestallene fra Anthropics egen annoncering er usædvanligt store spring for en lille model. På OSWorld 2.1 (offline-delmængden) scorer Haiku 5.5 72,4 % mod Haiku 4.5's 15,7 %. På Terminal-Bench 4.0 er tallene 39,2 % mod 0,0 %. På Humanity's Last Exam lander den på 45,9 % uden værktøjer og 57,4 % med.

Modellen er tilgængelig som `claude-haiku-5-5` på Anthropics API og hos AWS, Google Cloud og Microsoft Azure. Bemærk, at flere nyhedsopsamlinger i ugens løb skrev, at modellen har et kontekstvindue på 1 million tokens; det tal står ikke i Anthropics egen annoncering.

## GPT-6 til alle, også gratisbrugerne

OpenAI begyndte 7. oktober at rulle GPT-6 ud i ChatGPT til de betalte niveauer, og 8. oktober fulgte Free og Go. Udrulningen følges af en funktion, flere medier omtaler som Intelligent UI. Modelfamilien beskrives med Sol til betalte planer og Luna til gratisbrugere, mens adgang i virksomheder afhænger af administratorindstillinger.

Det bemærkelsesværdige er ikke modellen, men distributionen. En frontier-model på gratisniveauet ændrer forudsætningen for enhver organisation, der har bygget sin AI-politik på, at de gode modeller lå bag en betalingsmur.

## To åbne storemodeller på to dage

Den 5. oktober annoncerede Reflection modellen Beam: en mixture-of-experts-model med 501 mia. parametre, hvor virksomheden tager imod tilmeldinger til tidlig adgang og stiller vægte under Apache 2.0 i udsigt senere på måneden.

Dagen efter, den 6. oktober, åbnede Mistral Large 4 — internt kaldet "Le Chonk" — som offentlig API-preview. Modellen er nativt multimodal og en mixture-of-experts med omkring 1 billion parametre i alt og omkring 50 mia. aktive. Mistral har oplyst, at vægte kan hentes inden udgangen af oktober, men virksomheden har ikke navngivet licensen. Large 3 lå under Apache 2.0; det kan ikke antages at gælde Large 4.

For europæiske organisationer er Mistral-lanceringen den mest relevante af de to, men "åben" betyder her indtil videre "annonceret som åben".

## Nadella beder om en nødbremse

Lørdag 10. oktober skrev Microsofts CEO Satya Nadella et opslag på X, hvor han argumenterede for, at virksomheder bør behandle kraftige AI-modeller som potentielle insidertrusler og bygge en mekanisme, der lader et menneske sætte agentbaserede modeller på pause midt i en opgave. "We must assume a model is compromised and contain it from the start," skrev han.

Forslaget behandles i ugens Deep Dives-artikel.

## Og i øvrigt

Anthropic udvidede 6. oktober sit Cyber Verification Program, der giver kvalificerede sikkerhedsprofessionelle adgang til avancerede cyberkapabiliteter og færre blokerende klassifikatorer. Google opdaterede sin billedmodel Nano Banana til version 2.1 med gradvis udrulning på tværs af Googles produkter.

## Kilder

- [Claude Haiku 5.5](https://www.anthropic.com/news/claude-haiku-5-5) · Primær kilde · 7. oktober 2026 · Priser og benchmarks
- [Anthropic News](https://www.anthropic.com/news) · Primær kilde · oktober 2026 · Cyber Verification Program, 6. oktober
- [Anthropic has released Claude Haiku 5.5](https://artificialanalysis.ai/articles/claude-haiku-5-5) · Uafhængig dækning · 7. oktober 2026
- [Anthropic Cuts Small-Model Pricing 90% With Claude Haiku 5.5](https://www.vktr.com/ai-platforms/anthropic-cuts-smallmodel-pricing-90-with-claude-haiku-55/) · Uafhængig dækning · oktober 2026
- [OpenAI Brings GPT-6 With Intelligent UI to All ChatGPT Tiers](https://www.unite.ai/openai-brings-gpt-6-with-intelligent-ui-to-all-chatgpt-tiers/) · Uafhængig dækning · oktober 2026
- [OpenAI Is Finally Bringing GPT-6 to ChatGPT for Everyone](https://www.androidheadlines.com/2026/10/openai-bringing-gpt-6-ai-models-chatgpt-everyone.html) · Uafhængig dækning · oktober 2026
- [Mistral's Large 4 'Le Chonk' joins the West's open model push](https://www.therundown.ai/news/mistral-large-4-le-chonk-open-models) · Uafhængig dækning · oktober 2026
- [Microsoft's Nadella says AI needs an 'emergency brake' that humans control](https://www.cnbc.com/2026/10/10/microsoft-satya-nadella-ai-emergency-brake-safety.html) · Uafhængig dækning · 10. oktober 2026
- [Security and AI news from the week beginning 5 October 2026](https://www.enterprisetimes.co.uk/2026/10/12/security-and-ai-news-from-the-week-beginning-5-october-2026/) · Uafhængig dækning · 12. oktober 2026 · Ugeoverblik

## FAQ

### Skal vi skifte til Haiku 5.5 for at spare penge?

Regn på det før I flytter noget. Den store besparelse gælder prompts under 100.000 tokens; over den grænse femdobles prisen. Hvis jeres arbejdsgange sender lange dokumenter med hver gang, er gevinsten langt mindre end overskrifterne antyder.

### Hvad betyder GPT-6 på gratisniveauet for vores AI-politik?

At forudsætningen om, at medarbejdere skal betale for at få adgang til en stærk model, ikke længere holder. Hvis jeres politik regulerer adgang frem for anvendelse og datahåndtering, bør den skrives om.

### Er Mistral Large 4 reelt en åben model?

Ikke endnu. Modellen kom som API-preview, og Mistral har hverken frigivet vægtene eller navngivet licensen. Planlæg ikke selvhosting på den, før begge dele foreligger.
