# Når AI skal beslutte, ikke skrive

**Underrubrik:** For anden uge i træk kom der nye decision models – modeller, der svarer med en sandsynlighed i stedet for tekst. Det lyder som en teknisk detalje, men det løser et af de mest oversete problemer med AI i drift: hvordan man kontrollerer den.

**Periode:** 19.–25. oktober 2026

> **Kort fortalt**
> - Base Labs frigav 21. oktober mammoth-1 og elephant-1, i forlængelse af decision models fra Perplexity, Liquid AI og Sqwish Labs i uge 42.
> - En decision model returnerer en fordeling af sandsynligheder over de mulige svar – ikke fri tekst.
> - Den passer til tre typer spørgsmål: valg mellem kategorier, scoring på en skala og ja/nej.
> - Sandsynligheden gør det muligt at sætte en tærskel og sende de usikre sager til et menneske.

## Indhold

- [Hvad en decision model er](#hvad-en-decision-model-er)
- [Hvorfor tekst er et dårligt svarformat](#hvorfor-tekst-er-et-darligt-svarformat)
- [Hvor det passer i en organisation](#hvor-det-passer-i-en-organisation)
- [Sådan kommer man i gang](#sadan-kommer-man-i-gang)
- [Forbehold](#forbehold)

## Hvad en decision model er

En almindelig sprogmodel skriver tekst. En decision model gør noget andet: den får et input og et spørgsmål og returnerer en sandsynlighed for hvert muligt svar, der tilsammen giver 1.

Baseten beskriver tre typer spørgsmål. Valg: hvilket team ejer denne sag – infrastruktur, fakturering, sikkerhed eller support? Score: hvor akut er sagen, lav eller høj? Og ja/nej: er denne mail et phishing-forsøg?

I uge 42 lancerede Perplexity, Liquid AI og Sqwish Labs modeller i kategorien. I uge 43 fulgte Base Labs med mammoth-1 og elephant-1, som ifølge Baseten ligger øverst på Jev Decision Index blandt 208 decision models.

## Hvorfor tekst er et dårligt svarformat

Mange organisationer bruger i dag generative modeller til opgaver, der i virkeligheden er klassificering. Man beder modellen om at "svare med én af følgende kategorier" og håber, at den gør det. Det virker ofte, men det har tre svagheder.

Svaret kan være formuleret anderledes end forventet og skal derfor fortolkes. Man ved ikke, hvor sikker modellen er. Og man kan ikke sætte en grænse for, hvornår et menneske skal tage over.

En decision model svarer i stedet: "fakturering, 0,87". Det er et svar, et system kan bruge direkte, og et tal, en organisation kan styre efter.

## Hvor det passer i en organisation

Opgaverne er typisk ikke de mest synlige, men de er mange.

**Fordeling af henvendelser.** Hvilken afdeling skal en mail eller en sag til?

**Kontrol af fuldstændighed.** Indeholder ansøgningen, fakturaen eller dokumentationen det, den skal?

**Vurdering op mod en tjekliste.** Overholder teksten retningslinjerne for tone, jura eller brand?

**Prioritering.** Hvilke sager haster?

Fælles for dem er, at der findes et kendt sæt svar, og at en forkert vurdering kan fanges, hvis man ved, hvornår modellen er usikker.

## Sådan kommer man i gang

**Vælg én beslutning med et fast sæt svar.** Fx fordeling af indkomne mails på fire teams.

**Saml 100 eksempler, hvor et menneske har givet det rigtige svar.** Det er jeres målestok.

**Sæt en tærskel.** Sager over fx 0,9 håndteres automatisk; resten går til en person.

**Mål løbende.** Hvor ofte havde modellen ret, når den var sikker? Hvor mange sager endte hos et menneske?

## Forbehold

Kategorien er ny, og de fleste tal er leverandørernes egne. Placeringer på indekser som Jev Decision Index siger noget om generel ydelse, men ikke om jeres konkrete beslutning. Og en sandsynlighed er kun nyttig, hvis den er kalibreret – altså hvis 0,9 faktisk betyder, at modellen har ret ni ud af ti gange. Det skal testes på jeres egne data.

## Kilder

- [The top ranked decision models in the world: mammoth-1 and elephant-1](https://www.baseten.co/blog/the-best-decision-models-in-the-world-mammoth-1-and-elephant-1/) · Primær kilde · 21. oktober 2026 · Definition og spørgsmålstyper
- [AI models released in October 2026](https://www.nocode.mba/ai-release-tracker/2026/10) · Uafhængig dækning · november 2026 · pplx-decider, d1-ultra og kettei i uge 42

## FAQ

### Skal vi udskifte vores sprogmodel med en decision model?

Nej. De løser forskellige opgaver. Brug sprogmodellen, når der skal skrives eller forklares, og en decision model, når der skal vælges mellem kendte svar.

### Hvor sikker skal modellen være, før vi lader den beslutte alene?

Det afhænger af, hvad en fejl koster. Start højt, fx 0,9, og sænk først tærsklen, når I har målt, hvor ofte modellen tager fejl over den.

### Kræver det særlige kompetencer at bruge en decision model?

Mindre end man skulle tro. Det sværeste er ikke teknikken, men at definere beslutningen og samle gode eksempler.
