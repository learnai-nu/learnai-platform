# "Åben" betyder tre forskellige ting

**Underrubrik:** Uge 42 bød på to af de største åbne modeller til dato og en lukket frontier-model til en lavere pris. Men open-weight dækker over meget forskellige licenser – og det er licensen, ikke parameterantallet, der afgør, hvad I må.

**Periode:** 12.–18. oktober 2026

> **Kort fortalt**
> - Reflection frigav Beam under Apache 2.0: fri brug, også kommercielt.
> - Meta frigav Muse Spark Open under sin egen licens med "begrænsede kommercielle vilkår".
> - Google valgte den modsatte vej med Gemini 4 Argon: lukket model, men bred adgang og en introduktionspris.
> - For en dansk organisation er valget mellem åben og lukket mest et spørgsmål om kontrol, drift og licens – ikke om ydelse alene.

## Indhold

- [Tre modeller, tre modeller for adgang](#tre-modeller-tre-modeller-for-adgang)
- [Licensen er det vigtigste tal](#licensen-er-det-vigtigste-tal)
- [Hvad åbne vægte reelt giver jer](#hvad-abne-vaegte-reelt-giver-jer)
- [Fire spørgsmål før I vælger](#fire-sporgsmal-for-i-vaelger)
- [Hvad der stadig er uklart](#hvad-der-stadig-er-uklart)

## Tre modeller, tre modeller for adgang

I løbet af fire dage i uge 42 kom tre store modeller, der hver repræsenterer en forskellig strategi.

Google gjorde 13. oktober Gemini 4 Argon tilgængelig for alle betalende udviklere til 2 dollar input og 10 dollar output pr. million tokens. Modellen er lukket: I får adgang gennem Googles API og produkter, men ikke til selve modellen.

Meta frigav 15. oktober vægtene til Muse Spark Open, 816 mia. parametre, under Muse Model License. Dagen efter frigav Reflection Beam, 501 mia. parametre, under Apache 2.0.

To af de tre kan altså downloades. Men de to downloadbare modeller giver ikke de samme rettigheder.

## Licensen er det vigtigste tal

Apache 2.0 er en af de mest udbredte open source-licenser. Den tillader brug, ændring og videresalg, også kommercielt, så længe licens og ophavsret angives. For Beam betyder det, at en virksomhed kan køre modellen internt, finjustere den og bygge produkter oven på den uden at forhandle med Reflection.

Muse Spark Open er under Metas egen licens, som Meta selv beskriver som en licens "med begrænsede kommercielle vilkår", der lader mange udviklere bruge modellen gratis. Det er en anden kategori: vægtene er tilgængelige, men brugsretten er defineret af Meta og kan have grænser for kommerciel brug.

Pointen er ikke, at den ene er god og den anden dårlig. Pointen er, at "open-weight" i en pressemeddelelse ikke fortæller, hvad jeres jurist vil sige. Det gjorde den heller ikke i uge 41, hvor Mistral annoncerede Large 4 som åben uden at navngive licensen.

## Hvad åbne vægte reelt giver jer

Åbne vægte giver tre ting, som en lukket model ikke kan: Data kan forblive i jeres eget miljø, modellen kan ikke pludselig ændres eller udfases af leverandøren, og den kan finjusteres til jeres domæne.

Men de kommer med en regning. Meta fremhæver, at Muse Spark Open kan køre på to Mac Studio-maskiner med M5 Ultra – en imponerende demonstration, men stadig hardware, der skal købes, drives og opdateres. I praksis tilgår de fleste organisationer åbne modeller gennem en hostingpartner, og så er forskellen til en lukket API mindre, end den ser ud.

## Fire spørgsmål før I vælger

**Hvilke data skal modellen se?** Hvis svaret er personfølsomme eller forretningskritiske data, taler det for en model, I selv kan drive, eller en leverandør med klare databehandleraftaler.

**Hvad siger licensen om jeres brug?** Læs den før piloten, ikke efter. Apache 2.0 er enkel; leverandørspecifikke licenser kræver juridisk gennemgang.

**Hvem drifter den?** En åben model, ingen ejer driften af, er en risiko, ikke en besparelse.

**Hvordan måler I, om den er god nok?** Test på jeres egne opgaver, ikke på leverandørens benchmarks. Det gælder både Argon, Beam og Muse Spark Open.

## Hvad der stadig er uklart

Ingen af de tre lanceringer siger noget om, hvordan modellerne opfører sig over tid i jeres miljø. De fleste ydelsestal i ugens annonceringer er leverandørernes egne. Og for open-weight-modellerne er det stadig uklart, hvor hurtigt sikkerhedsrettelser og nye versioner kommer, når modellen først er downloadet.

## Kilder

- [Beam is now available](https://reflection.ai/blog/beam-is-available) · Primær kilde · 16. oktober 2026 · Apache 2.0 og partnere
- [Introducing Muse Spark Open](https://research.meta.ai/blog/muse-spark-open) · Primær kilde · 15. oktober 2026 · Muse Model License
- [Gemini 4 Argon: Built to solve your hardest problems](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/) · Primær kilde · 13. oktober 2026 · Pris og adgang
- [AI models released in October 2026](https://www.nocode.mba/ai-release-tracker/2026/10) · Uafhængig dækning · november 2026 · Udgivelsesoversigt

## FAQ

### Er open-weight det samme som open source?

Nej. Open-weight betyder, at modellens vægte kan downloades. Open source i klassisk forstand betyder også, at licensen tillader fri brug og ændring. Beam under Apache 2.0 er tæt på; Muse Spark Open under en leverandørlicens er det ikke.

### Er en åben model billigere end en lukket?

Ikke nødvendigvis. Licensen kan være gratis, men drift, hardware og vedligehold er det ikke. Sammenlign den samlede pris for jeres konkrete brug.

### Hvornår giver en åben model mest mening?

Når data ikke må forlade jeres miljø, når I har brug for at finjustere til et snævert domæne, eller når I vil være uafhængige af én leverandørs prisændringer og udfasninger.
