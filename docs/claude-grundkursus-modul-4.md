# Modul 4 – Giv Claude struktur og hukommelse

Lektionsindhold, udkast 1. Hører til `docs/claude-grundkursus.md`.
Bruger standardcasen i `docs/claude-grundkursus-case.md`.

**Modulets løfte:** deltageren holder op med at skrive den samme kontekst forfra hver gang.

**Varighed:** 40 minutter. Fem lektioner. Video i alle fem.

**Forudsætning:** deltageren har en kontekstblok fra 2.2 og en fungerende prompt fra modul 2.

**Bemærk:** dette er kursets tungeste modul, og det er her, flest falder fra. Rækkefølgen er valgt,
så hver lektion løser et problem, den forrige skabte.

---

## Lektion 4.1 – Projekter: et arbejdsrum i stedet for en samtale

**Varighed:** 8 min. Video: 4 min.

### Læringsmål

Efter lektionen kan deltageren oprette et projekt med instruktioner og forklare, hvornår en opgave
fortjener et projekt frem for en almindelig samtale.

### Brødtekst

Du har nu en god kontekstblok. Og du har sikkert allerede opdaget problemet: du sætter den ind
forfra hver eneste gang.

Et projekt løser det. Et projekt er et arbejdsrum med sin egen chathistorik, sin egen viden og sine
egne instruktioner. Alt, hvad du lægger ind, gælder automatisk i alle samtaler i det projekt.

Tænk på forskellen sådan her: en almindelig samtale er en seddel på skrivebordet. Et projekt er en
ringbind på hylden, hvor materialet allerede ligger.

**Hvornår fortjener en opgave et projekt?**

Tre spørgsmål. To ja er nok:

1. Kommer den igen? (Månedligt infobrev, ja. Én enkelt tale til en afskedsreception, nej)
2. Kræver den den samme baggrundsviden hver gang?
3. Skal andre kunne arbejde videre i det?

I casen er det oplagt: infobrevet, fællespostkassen og onboardingmaterialet er projekter.
Kvartalsstatus til direktionen er det også. En hurtig omskrivning af en enkelt mail er det ikke.

### Sådan sætter du det op

Tre trin, og det andet er det vigtigste:

**1. Opret projektet.** Navn, kort beskrivelse, og hvem der kan se det.

**2. Skriv instruktionerne.** Det er her, din kontekstblok fra 2.2 hører hjemme — men udvidet med
proces og krav, ikke bare baggrund:

> Du hjælper med det månedlige personaleinfobrev i Fællesorganisationen Nord.
>
> Modtagere: alle 120 medarbejdere, blandet fagligt niveau, læser hurtigt.
> Tone: konkret og ligefrem, aldrig sælgende. Vi undgår "rejse", "synergi" og floskler om
> forandring.
> Format: maks. 250 ord per punkt. Start altid med, hvad det betyder for modtagerens hverdag.
> Afslut hvert punkt med ét konkret næste skridt.
> Vores medlemmer kaldes medlemmer, aldrig kunder.
>
> Spørg mig, hvis noget i kildematerialet er uklart, i stedet for at gætte.

Den sidste linje er undervurderet. Den ændrer Claudes adfærd mærkbart.

**3. Læg viden ind.** Det er lektion 4.2.

### Deling

På Team- og Enterprise-planer kan projekter deles med kolleger, med forskellige rettigheder: se,
redigere eller eje. Det er sådan et projekt går fra at være din personlige genvej til at være
afdelingens fælles arbejdsgang.

På gratis- og Pro-planer er projekter dine egne. Du kan stadig dele instruktionerne som tekst — de
er bare ord.

### Videomanus (4 min)

1. Vis to samtaler i træk, hvor den samme kontekst indsættes forfra. Den irritation er pointen
2. Opret projektet "Personaleinfobrev". Vis navn og beskrivelse
3. Indsæt instruktionerne. Læs de vigtigste linjer højt
4. Start en samtale i projektet med kun én sætning: "Skriv et punkt om de nye rejseafregningsregler"
5. Vis, at svaret allerede rammer tone, længde og format

### Øvelse

Opret et projekt til din egen gennemgående opgave fra 1.3.

Skriv instruktionerne. Genbrug din kontekstblok fra 2.2, og tilføj mindst to procesregler — noget om
format, rækkefølge eller hvad Claude skal gøre, når noget er uklart.

Start en samtale i projektet med en kort prompt. Ramte den bedre end i modul 2?

### Refleksion

Hvilken opgave i din hverdag har du forklaret fra bunden flere end fem gange?

---

## Lektion 4.2 – Videnbasen: hvad du lægger ind, og hvad du lader være

**Varighed:** 8 min. Video: 4 min.

### Læringsmål

Efter lektionen kan deltageren vælge de rigtige dokumenter til et projekt, navngive dem, så Claude
kan finde dem, og henvise til dem præcist.

### Brødtekst

Instruktionerne fortæller Claude, *hvordan* den skal arbejde. Videnbasen giver den noget at arbejde
*med*.

I casens infobrev-projekt hører det her hjemme:

- De sidste tre infobreve (så stilen er lært, ikke beskrevet)
- Rejseafregningspolitikken
- Organisationsdiagrammet
- Jeres sprogpolitik, hvis I har en

Og det her gør ikke:

- Alle infobreve fra de sidste fem år
- Referater fra møder, der ikke vedrører infobrevet
- Noget som helst med personoplysninger

### Tre regler, der gør forskellen

**1. Navngiv filerne, så et menneske kan se hvad de er.** "Rejseafregningspolitik 2026.pdf" virker.
"Dokument (3) endelig FINAL v2.pdf" gør ikke. Claude bruger filnavnet til at afgøre, hvad der er
relevant.

**2. Henvis til dokumenter ved navn i din prompt.** "Ifølge rejseafregningspolitikken, §4" giver et
markant bedre svar end "ifølge reglerne".

**3. Start småt og hold det opdateret.** Fem relevante dokumenter slår halvtreds tilfældige. Og et
forældet dokument i videnbasen er værre end ingen dokumenter, fordi Claude bruger det med samme
selvtillid som et opdateret.

### Når videnbasen bliver stor

Lægger du meget materiale ind, henter Claude automatisk de relevante dele frem i stedet for at læse
alt hver gang. Det betyder, at du kan lægge mere ind, end der umiddelbart kan være.

Det betyder ikke, at du bør. Jo mere støj, jo større chance for at den henter det forkerte frem.
Kurér din videnbase som en hylde, ikke som et loftsrum.

### Datasikkerhed

Alt, hvad du lægger i en videnbase, er delt med Claude — og med alle, projektet er delt med. Modul 6
går i dybden. Indtil da: **læg ikke noget i en videnbase, du ikke ville sende til en ekstern
samarbejdspartner.**

### Videomanus (4 min)

1. Læg tre infobreve og politikken ind i projektet. Vis de beskrivende filnavne
2. Stil et spørgsmål med vag formulering: "hvad siger reglerne om bilag?"
3. Stil det igen præcist: "hvad siger rejseafregningspolitikken §4 om dokumentation af bilag?"
4. Sammenlign. Forskellen er navnet på dokumentet

### Øvelse

Læg tre til fem dokumenter i dit projekt fra 4.1.

Tjek hver enkelt mod tre spørgsmål, før du lægger den ind:

- Er filnavnet forståeligt for et menneske?
- Er dokumentet aktuelt?
- Kan det deles?

Stil så et spørgsmål, hvor du henviser til ét af dokumenterne ved navn.

### Refleksion

Hvor mange af dine mest brugte dokumenter har et filnavn, du selv kan tyde om et halvt år?

---

## Lektion 4.3 – Artifacts: når svaret bliver et dokument

**Varighed:** 8 min. Video: 4 min.

### Læringsmål

Efter lektionen kan deltageren genkende et artifact, bede om et, redigere i det og dele det — og ved,
hvad der *ikke* er et artifact.

### Brødtekst

Nogle gange er Claudes svar noget, du læser. Andre gange er det noget, du skal bruge.

Når svaret er substantielt og skal kunne redigeres eller genbruges, laver Claude det som et
**artifact** — et selvstændigt vindue ved siden af samtalen, hvor indholdet lever sit eget liv. Du
kan rette i det, bede om ændringer, og indholdet bliver opdateret i stedet for at blive skrevet
forfra længere nede i chatten.

**Hvad der bliver til artifacts:**

- Dokumenter og længere tekster
- Kode
- Websider
- Diagrammer og visualiseringer
- Små interaktive værktøjer

**Hvad der ikke gør — og det her forvirrer alle:**

Word, Excel, PowerPoint og PDF er **ikke** artifacts. Beder du om en Excel-fil, laver Claude en
rigtig fil, du henter ned. Det er en anden mekanisme, og den har sine egne muligheder — mere om det
i 4.4.

Grundreglen: **et artifact bor i vinduet. En fil lander i din downloadmappe.**

### Tre vaner, der gør artifacts brugbare

**1. Bed eksplicit om det.** "Lav det som et artifact" virker, når Claude ikke selv gør det.

**2. Ret én ting ad gangen.** "Gør afsnit to kortere" giver et præcist resultat. "Gør det hele
bedre, kortere og mere konkret" giver et nyt dokument, hvor du ikke kan se, hvad der skete.

**3. Beskriv slutbrugeren.** Et artifact til en kollega og et artifact til direktionen skal se
forskellige ud. Sig hvem det er til.

### Deling

Du kan kopiere, hente ned og — på de fleste planer — udgive et artifact som en side, andre kan åbne
med et link. Selve samtalen forbliver privat.

**Vær opmærksom:** udgiver du et artifact, kan alle med linket se det. Tjek, hvad der står i det,
før du deler. Det gælder især dokumenter, der er bygget på materiale fra din videnbase.

### Videomanus (4 min)

1. Bed om en oversigt over rejseafregningsreglerne til onboardingmaterialet. Vis at det åbner som
   artifact
2. Ret én ting: "gør tabellen til en punktopstilling". Vis at det opdateres i vinduet
3. Bed derefter om det samme som en Excel-fil. Vis at det bliver en fil, ikke et artifact
4. Sig forskellen højt: vinduet mod downloadmappen

### Øvelse

Tag resultatet fra dit projekt i 4.2 og bed om det som et artifact.

Lav derefter tre præcise rettelser, én ad gangen. Notér, hvad der skete efter hver.

Til sidst: bed om det samme som en fil, du kan hente ned. Læg mærke til forskellen.

### Refleksion

Hvilke af dine dokumenter bliver rettet mere end tre gange, før de er færdige?

---

## Lektion 4.4 – Skills: din fremgangsmåde, ikke din viden

**Varighed:** 9 min. Video: 4 min.

### Læringsmål

Efter lektionen kan deltageren forklare forskellen på et projekt og en skill, kende de indbyggede
skills til Office-filer og planlægge en skill til en egen tilbagevendende opgave.

### Brødtekst

Nu bliver det interessant — og her springer folk ofte forkert.

Et projekt indeholder **viden**. En skill indeholder **fremgangsmåde**.

| | Projekt | Skill |
|---|---|---|
| Hvad det er | Viden og kontekst | Proces og metode |
| Bedst til | Reference, materiale, samarbejde | Opgaver, der gøres på samme måde hver gang |
| Billedet | Ringbindet på hylden | Opskriften i skuffen |

Konkret fra casen: **projektet** "Personaleinfobrev" indeholder de tidligere breve og politikken.
**Skillen** "Mødereferat" indeholder fremgangsmåden: hvilken struktur et referat har hos jer,
hvordan beslutninger markeres, hvordan opgaver med ansvarlig og deadline stilles op, og hvad der
aldrig kommer med.

Det afgørende: Claude tager selv skillen i brug, når den er relevant. Du skal ikke huske at bede om
den.

### De indbyggede skills

Der findes færdige skills til Word, Excel, PowerPoint og PDF. Det er dem, der gør, at Claude kan
lave en rigtig regnearksfil frem for en tabel i chatten — jf. 4.3.

De skal være slået til under indstillingerne, sammen med kodeudførelse og filoprettelse. På
Enterprise-planer skal en ejer først aktivere det for hele organisationen. Kan du ikke finde
funktionen, er det typisk der, den er stoppet.

### Din egen skill

Du behøver ikke skrive den selv. Du kan fortælle Claude, hvad skillen skal kunne, svare på dens
spørgsmål, vedhæfte et par eksempler — og så genererer den skillen, du gemmer.

Gode kandidater fra casen:

- **Mødereferat:** fast struktur, faste markeringer af beslutninger og opgaver
- **Henvendelseskategorisering:** kategorier, prioritet, standardsvar
- **Kvartalsstatus:** samme afsnit hver gang, samme rækkefølge, tal først

Kendetegnet ved en god skill-kandidat: **du kunne skrive en instruks til en vikar om det.**

### Sikkerhed

Installér kun skills fra kilder, du stoler på, og læs indholdet igennem først. En skill er
instruktioner, Claude følger — og instruktioner kan være skrevet af andre end dig.

Det er samme vurdering, som når du åbner en makro i et regneark fra en ukendt afsender.

### Videomanus (4 min)

1. Vis projektet og skillen side om side. Sig forskellen: viden mod fremgangsmåde
2. Bed Claude om at hjælpe med at bygge en skill til mødereferater. Vis, at den stiller spørgsmål
3. Vedhæft to tidligere referater som eksempler
4. Gem skillen. Start en ny samtale, indsæt et råt mødenotat, og vis at strukturen kommer af sig selv

### Øvelse

Planlæg en skill til en opgave, du løser på samme måde hver gang.

Skriv ned, som var det en instruks til en vikar:

- Hvad er trinene?
- Hvilken struktur skal resultatet have?
- Hvad kommer aldrig med?
- Hvordan ser et godt eksempel ud?

Har du planerne slået til, så byg den. Har du ikke, så gem instruksen — den er stadig værdifuld, og
den kan bruges som projektinstruktion i stedet.

### Refleksion

Hvilken opgave ville du kunne overdrage til en vikar med én A4-side?

---

## Lektion 4.5 – Hukommelse og personlige præferencer

**Varighed:** 7 min. Video: 3 min.

### Læringsmål

Efter lektionen kan deltageren sætte sine præferencer, gennemse hvad Claude husker, og rette eller
slette det.

### Brødtekst

Du har nu tre steder at lægge kontekst: i prompten, i et projekt og i en skill. Det fjerde er
Claude selv.

**Personlige præferencer** er noget, du skriver én gang under indstillingerne, og som gælder i alle
dine samtaler. Godt sted til: din rolle, dit sprog, din foretrukne længde, ting du aldrig vil have.

> Jeg arbejder administrativt i en medlemsorganisation. Svar på dansk. Vær konkret og kortfattet.
> Undgå indledninger om, hvor spændende et emne er — start ved sagen.

**Hukommelse** er noget andet: Claude gemmer selv relevant kontekst fra dine samtaler — din rolle,
dine præferencer, beslutninger du har truffet — så du ikke gentager dig selv.

Forskellen: præferencer skriver du. Hukommelsen skriver sig selv.

### Det, du skal vide, før du går videre til modul 6

Hukommelsen gemmer oplysninger på tværs af samtaler. Det er praktisk, og det er også noget, du skal
holde øje med.

Tre ting at gøre nu:

1. **Find indstillingen.** Du skal vide, hvor den er, før du har brug for den
2. **Læs hvad der står.** De fleste bliver overraskede første gang
3. **Slet det, der ikke skal være der.** Du kan rette og fjerne enkeltposter

Nævner du noget fortroligt i en samtale, kan det ende i hukommelsen. Det er ikke farligt i sig selv,
men det er dit ansvar at vide det — og det er en af grundene til, at modul 6 kommer lige efter dette.

### Hvad hører hvor?

Den her tabel er værd at gemme:

| Kontekst | Hører hjemme |
|---|---|
| Gælder kun denne ene opgave | I prompten |
| Gælder alt, hvad du laver | I personlige præferencer |
| Gælder ét tilbagevendende arbejdsområde | I et projekt |
| Er en fremgangsmåde, ikke viden | I en skill |
| Noget Claude selv har samlet op | I hukommelsen — gennemse den |

### Videomanus (3 min)

1. Vis indstillingen for personlige præferencer. Skriv en ind
2. Start en ny samtale og vis, at den slår igennem uden at blive nævnt
3. Åbn hukommelsen. Vis en post, redigér den, slet en anden

### Øvelse

Skriv dine personlige præferencer. Maks. fem linjer.

Åbn derefter hukommelsen og læs den igennem. Er der noget, der ikke skal være der? Slet det.

Notér én ting, du blev overrasket over.

### Refleksion

Hvis en kollega kiggede med i, hvad Claude husker om dig — ville der stå noget, du ikke ville dele?

Det spørgsmål er indgangen til modul 6.

---

## Quizspørgsmål fra modul 4

**1.** Du skriver den samme kontekst ind forfra i hver ny samtale om det samme arbejdsområde. Hvad
er den rigtige løsning?
- a) Gemme kontekstblokken i et dokument og kopiere den ind
- b) Oprette et projekt med instruktionerne ✔
- c) Skrive den ind i dine personlige præferencer
- d) Bygge en skill

*Forklaring: konteksten gælder ét arbejdsområde, ikke alt du laver. Personlige præferencer ville
sende den med ind i alle samtaler, også de irrelevante.*

**2.** Hvad er forskellen på et projekt og en skill?
- a) Projekter er til Team-planer, skills er til alle
- b) Projekter indeholder viden, skills indeholder fremgangsmåde ✔
- c) Skills er projekter, man har delt med andre
- d) Projekter er til tekst, skills er til filer

*Forklaring: ringbindet mod opskriften. Viden mod metode.*

**3.** Du beder Claude om et regneark med oversigten. Hvad får du?
- a) Et artifact, du kan redigere i vinduet
- b) En fil, du kan hente ned ✔
- c) En tabel i chatten
- d) Det afhænger af, om du beder om et artifact

*Forklaring: Excel, Word, PowerPoint og PDF er filer, ikke artifacts. Artifacts bor i vinduet, filer
lander i downloadmappen.*

**4.** Du har lagt 40 dokumenter i en videnbase, og Claude henter jævnligt det forkerte frem. Hvad
gør du?
- a) Beder Claude om kun at bruge de nyeste
- b) Deler videnbasen op i flere projekter og fjerner det, der ikke er relevant ✔
- c) Skifter til en kraftigere model
- d) Lægger flere dokumenter ind, så der er mere at vælge mellem

*Forklaring: en videnbase kureres som en hylde, ikke som et loftsrum. Jo mere støj, jo større chance
for at den forkerte kilde hentes frem.*

**5.** En kollega sender dig en skill, de har hentet et sted fra. Hvad gør du først?
- a) Installerer den og afprøver på en rigtig opgave
- b) Læser indholdet igennem og vurderer kilden ✔
- c) Beder Claude vurdere, om den er sikker
- d) Installerer den kun på en gratisplan

*Forklaring: en skill er instruktioner, Claude følger. Samme vurdering som en makro fra en ukendt
afsender.*

---

## Redaktionelle noter

- Eksemplerne bruger LearnAI's standardcase, Fællesorganisationen Nord. Se
  `docs/claude-grundkursus-case.md`. Tal og betegnelser skal stemme nøjagtigt overens med casen.
- Projektinstruktionen i 4.1 er en udvidelse af kontekstblokken fra 2.2. De to skal holdes
  konsistente — det er samme tekst, der vokser. Ændres den ene, skal den anden rettes med.
- **Modulet er kursets tungeste, og 4.4 om skills er den lektion, der vil koste flest deltagere.**
  Overvej at gøre skills valgfri fordybelse, hvis brugertest viser frafald. Kurset skal kunne stå
  uden 4.4.
- Skills kræver, at kodeudførelse og filoprettelse er slået til, og på Enterprise-planer at en ejer
  har aktiveret det. Alternativøvelsen i 4.4 (planlæg skillen, byg den ikke) skal stå tydeligt, ikke
  som en fodnote.
- 4.3 og 4.4 hænger sammen omkring filer mod artifacts. Videoerne skal optages i forlængelse af
  hinanden, så eksemplet er det samme.
- 4.5 lægger op til modul 6 med vilje. Den sidste refleksion er broen. Lad den stå.
- Videnbasens dokumenter i casen skal produceres som download: tre infobreve,
  rejseafregningspolitikken og et organisationsdiagram.
