# Claude grundkursus – udkast

## Status

Udkast. Pris, format, fokus og certifikat er besluttet. Indholdet er ikke redaktionelt gennemgået,
videoerne er ikke optaget, og kurset er ikke klar til publicering.

## Besluttet

| Beslutning | Valg |
|---|---|
| Pris | Betalt, lavt prispunkt. Forslag: 299 kr. normalpris, 199 kr. intropris |
| Fokus | Claude-specifikt. Ikke modelneutralt |
| Format | Skærmoptaget video i hver lektion plus tekst og øvelse |
| Certifikat | Ja. Udstedes af LearnAI.nu |

## Kilde og afgrænsning

Kursets opbygning er dækningstjekket mod Anthropics eget **Claude 101** (13 lektioner, ca. 2,5 timer,
engelsk, gratis) via en intern researchoversigt fra 15. september 2026. Researchoversigten er en
struktureret opsummering, ikke en ordret gengivelse, og den ligger bevidst uden for dette repo.

Claude 101 er brugt som **inspirationsmappe og dækningsliste**, ikke som undervisningsmateriale.
Al tekst, alle cases, prompts, øvelser og videoer er selvstændigt LearnAI-materiale. Anthropics
materiale må ikke kopieres, oversættes, genudgives eller udleveres til kursister.

**Hvorfor nogen skal betale for et dansk kursus, når Anthropics er gratis:**

1. Dansk sprog, danske arbejdsgange og danske eksempler
2. GDPR, Datatilsynet og AI-forordningen – emner Claude 101 slet ikke berører
3. Kontrolvaner, kildekritik og simple evals som selvstændigt modul
4. En konkret implementeringsplan for deltagerens egen hverdag
5. Et LearnAI.nu-certifikat og en kurator, der holder materialet opdateret

Det skal stå åbent på salgssiden, at Anthropic har et gratis engelsk kursus. Vi konkurrerer på
sprog, kontekst og jura, ikke på at skjule alternativet.

## Kursuskontrakt

- Arbejdstitel: **Claude fra første samtale til daglig rutine**
- Slug: `claude-grundkursus`
- Niveau: begynder – ingen teknisk baggrund
- Pris: 299 kr. normalpris, 199 kr. intropris (bekræftes redaktionelt)
- Varighed: ca. 210 minutter, 8 moduler, 22 lektioner
- Format: skærmoptaget video i hver lektion (2-5 min) plus tekst og én øvelse, eget tempo
- Certifikat: LearnAI.nu-certifikat ved gennemført forløb og bestået quiz
- Quiz: 12 scenariebaserede spørgsmål, 70 procent for at bestå, ubegrænsede forsøg
- Preview: lektion 1.1 og 1.2 er gratis preview på salgssiden

## Forudsætninger

- En Claude-konto. Gratisplanen rækker til det meste af kurset
- Ingen erfaring med Claude eller andre AI-assistenter nødvendig
- Enkelte funktioner er bag betalte planer. Det skal stå tydeligt i den enkelte lektion, og hver
  sådan øvelse skal have et alternativ, der kan gennemføres på gratisplanen

### Planafhængige funktioner – skal markeres i lektionen

| Funktion | Krav | Konsekvens for øvelsen |
|---|---|---|
| Cowork | Pro, Max, Team eller Enterprise | Demonstreres på video, ingen hands-on på gratisplan |
| Søgning i virksomhedens viden | Team eller Enterprise, admin skal aktivere | Kun video og beslutningsøvelse |
| Claude i Chrome | Ikke på gratisplan. Enterprise som udgangspunkt slået fra | Kun omtale |
| Udvidet kontekstvindue | Pro, Max, Team, Enterprise | Nævnes, ingen øvelse |
| Skills | Kræver kodeudførelse og filoprettelse slået til. Enterprise kræver ejer-godkendelse | Alternativ: forstå og planlæg en skill uden at oprette den |

Denne tabel er den enkeltstørste kilde til supporthenvendelser, hvis den ikke er præcis. Den skal
verificeres mod live produkt umiddelbart før publicering.

## Målgruppe

Alle, der skal bruge Claude i deres arbejde. Både nye brugere, der vil have en guidet vej fra
første besked til daglig rutine, og eksisterende brugere, der bruger Claude som en søgemaskine og
mangler den strukturerede rundtur i Projects, Artifacts, Skills, Connectors og Research.

## Læringsmål

Efter kurset kan deltageren:

1. forklare hvad Claude er, og hvordan den adskiller sig fra en chatbot og fra en søgemaskine
2. skrive en prompt i tre trin – sæt scenen, definér opgaven, angiv reglerne – og rette den, når
   svaret rammer skævt
3. vælge den rigtige arbejdsform: tur for tur, uddelegering eller egentligt byggeri
4. bruge Projects til viden og Skills til proces, og kende forskellen
5. lave, redigere og dele et artifact
6. koble egne værktøjer og internettet på med Connectors og vælge rigtigt mellem Research,
   websøgning og udvidet tænkning
7. vurdere hvilke data der må deles, med hvem, og på hvilken plan
8. teste Claudes pålidelighed med en simpel eval på data, deltageren selv kender svaret på
9. lægge en plan for de tre opgaver, der fremover løses med Claude

## Standardcase

Kurset bruger én gennemgående case: **Fællesorganisationen Nord**, en fiktiv dansk
medlemsorganisation med 120 ansatte, hvor deltageren træder ind i rollen som administrativ
koordinator. Casen er beskrevet i `docs/claude-grundkursus-case.md` og skal bruges konsekvent i alle
moduler, videoer og quizspørgsmål.

Arbejdsdelingen: **videoerne bruger casen**, så alle ser det samme uden at have data klar.
**Øvelserne bruger deltagerens egen opgave**, så læringen sidder fast i noget virkeligt. Hvor en
øvelse kræver data, deltageren ikke har, ligger der et datasæt fra casen at falde tilbage på.

## Kursets røde tråd

Deltageren vælger i lektion 1.3 én tilbagevendende arbejdsopgave fra sin egen hverdag. Den opgave
følger kurset hele vejen: prompt i modul 2, arbejdsform i modul 3, projekt og artifact i modul 4,
ekstern viden i modul 5, datavurdering i modul 6, eval i modul 7 og rutine i modul 8.

## Modulstruktur

### Modul 1 – Mød Claude (25 min, 1.1 og 1.2 er preview)

| Lektion | Indhold | Øvelse |
|---|---|---|
| 1.1 | Hvad Claude er: tænkepartner, ikke svarmaskine. Constitutional AI kort og forståeligt | Skriv dit eget mål med kurset |
| 1.2 | Quick win: ryd op i en rodet mailtråd | Egen mailtråd, anonymiseret |
| 1.3 | Tænkepartner eller søgefelt? Seks opgaver, sortér dem | Vælg kursets gennemgående opgave |
| 1.4 | Sådan "tænker" en sprogmodel – mønstre, ikke opslag. Hvad et stort kontekstvindue betyder i praksis | Find et sted hvor Claude gætter forkert |

Sorteringsøvelsen i 1.3 er modulets vigtigste. De fleste nye brugere skriver til Claude som til et
søgefelt, og hele kursets værdi afhænger af, at den vane bliver brudt tidligt.

### Modul 2 – Den gode prompt (35 min)

| Lektion | Indhold | Øvelse |
|---|---|---|
| 2.1 | Tre trin: sæt scenen, definér opgaven, angiv reglerne | Byg samme prompt i tre trin |
| 2.2 | Kontekst er kongen – hvad Claude ikke ved om dig | Skriv en kontekstblok du kan genbruge |
| 2.3 | Vedhæft filer og billeder: PDF, Word, regneark, tekst, skærmbilleder | Vedhæft et dokument og få det analyseret |
| 2.4 | Når svaret rammer skævt: fejlfindingstabellen | Diagnosticér tre dårlige svar |
| 2.5 | Iteration, tone og målgruppe | Samme budskab til ledelse, kollega og kunde |

**Fejlfindingstabellen i 2.4** er kursets mest genbrugelige ene side. Deltageren skal kunne printe
den:

| Problem | Løsning |
|---|---|
| For generisk | Tilføj målgruppe, rolle og begrænsninger |
| Forkert længde | Skriv længden eksplicit |
| Forkert format | Giv et eksempel eller beskriv strukturen |
| Selvsikkert forkert | Bed om kilder, slå websøgning til, verificér |
| Forkert tone | Beskriv tonen eller vedhæft et stileksempel |

I 2.5 skal redigér-blyanten på egne beskeder med, og pointen om at starte en ny chat, når konteksten
er kørt af sporet.

### Modul 3 – Vælg den rigtige arbejdsform (25 min)

| Lektion | Indhold | Øvelse |
|---|---|---|
| 3.1 | Tre former: tur for tur, uddelegering, byggeri | Kortlæg tre af dine opgaver |
| 3.2 | Uddelegering i praksis: flertrinsopgaver, planlagte opgaver, arbejde på tværs af værktøjer | Find en opgave der egentlig er en uddelegering |
| 3.3 | Modelvalg og udvidet tænkning | Kør samme opgave med og uden udvidet tænkning |

Refleksionsspørgsmålet fra 3.2 er stærkt nok til at være øvelsen: *hvilke af dine hidtidige samtaler
var i virkeligheden uddelegeringer forklædt som chat?*

Modelvalg undervises i **roller, ikke versionsnumre**: en hverdagsmodel som standard, en tungere
model til komplekse opgaver. Versionsnavne ændrer sig og må ikke bindes ind i lektionsteksten.
Nævn at modelskift starter en ny samtale.

Her hører også et kort overblik over Claudes flader: web, desktop og mobil som ét produkt, og
Claude Code, Claude i Slack, Claude Design, Claude i Microsoft 365 og Claude i Chrome som
selvstændige indgange. Dybden ligger i 8.4.

### Modul 4 – Giv Claude struktur og hukommelse (40 min)

| Lektion | Indhold | Øvelse |
|---|---|---|
| 4.1 | Projects: eget arbejdsrum med egen historik, viden og instruktioner | Opret et projekt til kursets opgave |
| 4.2 | Videnbasen: hvilke filer, hvilke navne, hvor meget | Læg tre dokumenter ind og henvis til dem ved navn |
| 4.3 | Artifacts: dokumenter, kode, websider, diagrammer – og hvad der *ikke* er et artifact | Lav din opgave som artifact og redigér den |
| 4.4 | Skills: genbrugelige instruktioner. De indbyggede til Office-filer og dine egne | Planlæg en skill til kursets opgave |
| 4.5 | Hukommelse og personlige præferencer | Sæt dine præferencer og gennemse hvad Claude husker |

**Tre præciseringer, der skal stå eksplicit, fordi de forvirrer alle nye brugere:**

1. Word, Excel, PowerPoint og PDF er *ikke* artifacts. De oprettes som filer, du henter ned.
   Artifacts er dokumenter, kode, websider, diagrammer og små værktøjer i vinduet ved siden af.
2. **Projects er viden. Skills er proces.** Projektet er videnhubben. Skillen er fremgangsmåden.
   Samme distinktion, to helt forskellige værktøjer.
3. Man kan bede eksplicit om "lav det som et artifact", hvis Claude ikke selv gør det.

4.5 er også et databeskyttelsesemne. Hukommelsen gemmer oplysninger på tværs af samtaler, og
deltageren skal vide, hvor man gennemser, retter og sletter, før modul 6.

Sikkerhedspointe i 4.4: installér kun skills fra kilder, du stoler på, og læs indholdet igennem.

### Modul 5 – Træk viden ind udefra (30 min)

| Lektion | Indhold | Øvelse |
|---|---|---|
| 5.1 | Connectors: kobl Claude til dine egne værktøjer. Web-connectors og desktop-udvidelser | Kobl ét værktøj på og test det |
| 5.2 | Adgang og sikkerhed: Claude ser kun det, du selv har adgang til – og kan kobles fra igen | Gennemgå hvad du reelt gav adgang til |
| 5.3 | Research: systematisk undersøgelse med kilder | Kør en research-opgave og åbn mindst to kilder |
| 5.4 | Vælg rigtigt: Research, websøgning, udvidet tænkning eller intern søgning | Placér fire opgaver i beslutningstabellen |

Beslutningstabellen i 5.4:

| Du skal … | Brug |
|---|---|
| grave dybt i mange kilder og have en rapport med henvisninger | Research |
| tjekke et hurtigt faktum | Websøgning |
| tænke en svær beslutning igennem uden ny information | Udvidet tænkning |
| finde noget, din egen organisation ved | Intern søgning (Team/Enterprise) |

MCP nævnes én gang i 5.1 som det, der gør connectors mulige, med en enkelt sætning. Ikke mere.
Begrebet hører til udviklersporet.

Kildekontrollen i 5.3 er ikke valgfri. Den er der, hvor kurset adskiller sig fra en funktionsrundtur.

### Modul 6 – Data, sikkerhed og ansvar (30 min)

| Lektion | Indhold | Øvelse |
|---|---|---|
| 6.1 | Hvad må du dele? Persondata, kundedata, forretningshemmeligheder | Klassificér fem dokumenter fra din hverdag |
| 6.2 | Planen betyder noget: gratis, Pro, Max, Team og Enterprise | Find ud af hvilken plan du reelt sidder på |
| 6.3 | Dansk kontekst: GDPR, Datatilsynet og AI-forordningen | Tjek din organisations regler – eller konstatér at de mangler |
| 6.4 | Ansvar: du underskriver, ikke modellen | Skriv din egen ansvarsregel på én sætning |

Skal faktatjekkes mod primærkilder og dateres før publicering. Kurset er undervisning, ikke juridisk
rådgivning, og det skal stå eksplicit i modulet.

### Modul 7 – Kontrol, kvalitet og evals (30 min)

| Lektion | Indhold | Øvelse |
|---|---|---|
| 7.1 | Tre kontrolvaner: kend svaret, bed om kilder, test på noget du kan tjekke | Kør vanerne på kursets opgave |
| 7.2 | Hallucinationer og selvsikre fejl | Provokér en fejl bevidst og genkend mønsteret |
| 7.3 | Din egen lille eval: test på data, hvor du kender facit | Byg en eval med fem eksempler |
| 7.4 | Hvornår du ikke skal bruge Claude | Lav din egen stopliste |

**7.3 er kursets stærkeste enkeltlektion.** Metoden: saml fem til ti eksempler fra dit eget arbejde,
hvor du allerede kender det rigtige svar. Kør dem gennem din prompt. Sammenlign. Justér prompten.
Først når den klarer de kendte eksempler, stoler du på den med nye.

Det er den eneste teknik i kurset, der giver deltageren et *målbart* grundlag for tillid i stedet
for en fornemmelse. Den hører hjemme i quizzen.

### Modul 8 – Fra kursus til hverdag (25 min)

| Lektion | Indhold | Øvelse |
|---|---|---|
| 8.1 | Claude i din rolle: fire gennemgåede eksempler | Vælg det tætteste på dit eget arbejde |
| 8.2 | Vælg én opgave til denne uge, og tre til den næste måned | 3-opgavers plan med forventet tidsbesparelse |
| 8.3 | Del med kollegerne – prompts, projekter og skills som fælles ejendom | Skriv én prompt til teamets bibliotek |
| 8.4 | De andre indgange: Claude Code, Slack, Design, Microsoft 365, Chrome | Vælg næste skridt |

8.1 skal dække fire roller valgt efter LearnAI's kundegrundlag. Forslag: administration, salg og
marketing, projektledelse, faglig specialist. Hver rolle får to til tre konkrete opgaver, ikke en
liste af muligheder.

8.2 låner Claude 101's bedste afslutning: **vælg én tilbagevendende opgave og prøv den i denne uge.**
En opgave gennemført slår ti planlagte.

Afslutning: quiz, LearnAI.nu-certifikat og henvisning videre – til LearnAI's betalte forløb og til
Anthropics egne gratiskurser for dem, der vil mod Claude Code, API og MCP.

## Dækning mod Claude 101

| Lektion i Claude 101 | Dækkes hos os | Hvor |
|---|---|---|
| 1. What is Claude? | Ja | 1.1, 1.4 |
| 2. Your first conversation | Ja, udvidet | 1.2, 2.1-2.3 |
| 3. Getting better results | Ja, udvidet | 2.4, 7.3 |
| 4. Chat, Cowork, Code | Ja | Modul 3 |
| 5. Projects | Ja | 4.1, 4.2 |
| 6. Artifacts | Ja | 4.3 |
| 7. Skills | Ja | 4.4 |
| 8. Connectors | Ja | 5.1, 5.2 |
| 9. Enterprise search | Kort, plan-gated | 5.4, forudsætningstabel |
| 10. Research | Ja | 5.3, 5.4 |
| 11. Use cases by role | Ja | 8.1 |
| 12. Other ways to work with Claude | Overblik | 3.3, 8.4 |
| 13. What's next | Ja | 8.2, 8.4 |
| **GDPR og dansk jura** | **Kun hos os** | Modul 6 |
| **Kontrolvaner og stopliste** | **Kun hos os** | 7.1, 7.2, 7.4 |
| **Implementeringsplan** | **Kun hos os** | 8.2, 8.3 |

### Hvad vi bevidst gør anderledes

- **AI Fluency-rammen (Delegation, Description, Discernment, Diligence)** undervises ikke som fire
  engelske fagtermer. Vi bruger vores egen tretrinsmodel til prompten og lægger vurdering og ansvar
  i modul 6 og 7, hvor de hører til i en dansk kontekst. Rammen krediteres og der henvises til
  Anthropics gratiskursus for dem, der vil have den fulde model.
- **Enterprise search** får ikke en hel lektion. Målgruppen sidder overvejende på gratis- eller
  Pro-planer, og en lektion, de ikke kan gennemføre, er en dårlig oplevelse i et betalt kursus.
- **MCP** nævnes i én sætning. Begrebet hører til udviklersporet.
- **Evals** får derimod mere plads end i Claude 101, fordi det er den eneste teknik, der gør tillid
  målbar, og fordi det passer til LearnAI's forankringstankegang.

## Produktplacering

| Kursus | Rolle | Pris |
|---|---|---|
| `ai-i-praksis` | Modelneutral introduktion, første gevinst | 0 kr. |
| **`claude-grundkursus`** | Bliv fortrolig med ét værktøj: Claude | 299 kr. |
| Flagskibsforløbet | Fire ugers hybridforløb, organisation og dybde | Se eget dokument |
| `ai-for-ledere` | Ledelsesansvar, strategi, 90-dages plan | 995 kr. |

Prispunktet skal være lavt nok til at kunne købes uden godkendelse fra en chef, og højt nok til at
signalere at det ikke er gratismateriale. 299 kr. er et forslag, ikke en endelig beslutning.

Overlap mod `ai-i-praksis` skal tjekkes konkret, før begge kurser sælges side om side. Gratiskurset
skal svare på "hvad kan AI gøre for mig", dette kursus på "hvordan bruger jeg Claude ordentligt".

## Videoproduktion

- Én skærmoptagelse på 2-5 minutter per lektion. Samlet ca. 70 minutter ud af kursets 210.
- Optages i Claudes eget interface med testdata. Ingen fortrolige data på skærmen.
- **Én opgave per video, ingen lange sammenhængende optagelser.** Interfacet ændrer sig, og vi skal
  kunne genoptage én lektion i stedet for et helt modul. Claude 101's egen video fra december 2025
  viser allerede en menu, der siden er fjernet – det er præcis den fælde, vi skal undgå.
- Alle videoer får undertekster og et tekstresumé, så kurset kan gennemføres uden lyd.
- Hver video dateres synligt.
- Videoer af planafhængige funktioner mærkes tydeligt i afspilleren.
- Vis roller frem for versionsnumre, når modeller nævnes.

Prioriteret optagerækkefølge, hvis produktionen skal deles op: **modul 4 og 5 først**, fordi
Projects, Artifacts, Skills og Connectors er svære at forstå af tekst alene. Modul 6 og 7 kan klare
sig med tekst i version 1.

## Certifikat

- Udstedes af LearnAI.nu, ikke af Anthropic. Det skal fremgå tydeligt på selve certifikatet.
- Krav: alle lektioner markeret gennemført plus quiz bestået med mindst 70 procent.
- Indhold: deltagerens navn, kursustitel, dato, varighed, udsteder og et verificerbart ID.
- Skal kunne deles på LinkedIn.
- Formuleringen må ikke antyde en officiel Anthropic-certificering, og Anthropics logo, badges og
  kursusnavne må ikke bruges på certifikatet.

## Didaktiske valg

- Én gennemgående opgave, deltageren selv vælger i lektion 1.3.
- Én øvelse per lektion, aldrig flere. Færdiggørelse slår igennem i progressionen.
- Hver lektion slutter med ét refleksionsspørgsmål. Lav friktion, høj overførsel til egen hverdag.
- Ingen øvelse kræver fortrolige eller personfølsomme data.
- Hver planafhængig lektion har et alternativ til gratisplanen.
- Produktnavne og modelnavne holdes i få, afgrænsede afsnit, så kurset er let at opdatere.

## Åbne beslutninger

- [ ] Endeligt prispunkt. Forslag: 299 kr. normal, 199 kr. intro.
- [ ] Skal kurset sælges enkeltvis eller også indgå i en pakke med flagskibsforløbet?
- [ ] Hvilke fire roller skal med i 8.1?
- [ ] Overlapsanalyse mod `ai-i-praksis` – hvad skal flyttes eller skæres?
- [ ] Hvem producerer casens eksempeldata (referater, henvendelser, politik, infobrev)?
- [ ] Hvem optager og redigerer videoerne, og hvornår?
- [ ] Certifikatets visuelle design og verifikations-URL.
- [ ] Opdateringskadence. Forslag: kvartalsvist review af produktnavne, planregler og skærmbilleder.

## Publiceringsport

- [ ] Alle 22 lektioner gennemlæst af dansk fagredaktør
- [ ] Alle prompts testet på aktuel Claude-model
- [ ] Produktnavne og funktioner kontrolleret mod Anthropics dokumentation med dato
- [ ] Tabellen over planafhængige funktioner verificeret mod live produkt
- [ ] Alternativøvelser skrevet til hver planafhængig lektion
- [ ] Casens tal og betegnelser er konsistente på tværs af alle moduler, videoer og quizspørgsmål
- [ ] Navnet "Fællesorganisationen Nord" tjekket mod CVR og almindelig søgning
- [ ] Casens eksempeldata produceret og tilgængelige som download
- [ ] Modul 6 faktatjekket mod Datatilsynet, GDPR og AI-forordningen
- [ ] Quizspørgsmål fagligt valideret, med mindst ét spørgsmål om evals
- [ ] Alle videoer optaget, tekstet, dateret og kontrolleret mod aktuelt interface
- [ ] Certifikatskabelon, verifikations-ID og LinkedIn-deling testet
- [ ] Betalings- og adgangsflow testet på det valgte prispunkt
- [ ] Salgssiden nævner åbent Anthropics gratis engelske alternativ
- [ ] Ophavsret gennemgået: intet materiale fra Claude Academy er kopieret eller oversat
- [ ] Overlap mod `ai-i-praksis` afklaret
- [ ] Cover, landingsside og SEO på plads
- [ ] Mobilvisning, tastaturnavigation og skærmlæsertekster kontrolleret
