# Modul 7 – Kontrol, kvalitet og evals

Lektionsindhold, udkast 1. Hører til `docs/claude-grundkursus.md`.

**Modulets løfte:** deltageren går fra at *fornemme* om Claude har ret til at kunne *vise* det.

**Varighed:** 30 minutter. Fire lektioner. Video i 7.1, 7.2 og 7.3. 7.4 er tekst.

**Forudsætning:** deltageren har en gennemgående opgave fra 1.3 og en prompt fra modul 2.

---

## Lektion 7.1 – Tre kontrolvaner

**Varighed:** 8 min. Video: 3 min.

### Læringsmål

Efter lektionen kan deltageren anvende tre faste vaner på et hvilket som helst svar fra Claude og
afgøre, om svaret kan bruges som det er.

### Brødtekst

Du har nu fået Claude til at skrive, analysere og samle ting for dig. Spørgsmålet er, hvornår du tør
sende resultatet videre med dit eget navn på.

Det korte svar: når du har tjekket det. Det lange svar er tre vaner, der tager under et minut hver.

**Vane 1: Kend svaret på mindst ét spørgsmål, før du stiller det**

Når du beder Claude om at analysere et dokument, du ikke har læst, har du ingen mulighed for at
vurdere svaret. Så læs et enkelt afsnit først. Stil et spørgsmål, du kender svaret på. Hvis Claude
rammer rigtigt der, er det et signal. Hvis den rammer forkert, har du sparet dig selv for at bygge
videre på noget forkert.

En kollega i en medlemsorganisation fik Claude til at opsummere en overenskomsttekst. Hun læste selv
§4 først. Da opsummeringen beskrev §4 korrekt, læste hun resten med ro i maven. Det tog hende tre
minutter og gjorde hele resten brugbar.

**Vane 2: Bed om kilder og åbn mindst én**

Claude kan henvise til kilder, når den har søgt på nettet eller læst dine dokumenter. Bed altid om
henvisninger, når svaret indeholder tal, datoer, paragraffer eller citater.

Og åbn så mindst én af dem. Ikke alle. Én. Det er forskellen mellem at have kilder og at have
tjekket dem.

**Vane 3: Test på noget, du kan kontrollere**

Før du stoler på en prompt til ny data, kør den på gammel data, hvor du kender facit. Det er
grundtanken i lektion 7.3, og den er vigtig nok til at få sin egen lektion.

### Hvornår gælder vanerne?

Ikke altid. Skriver du et udkast til en intern mail, som du selv læser igennem alligevel, er
vanerne overkill. Men så snart svaret indeholder **tal, jura, navne, datoer eller noget, en anden
skal handle på**, skal alle tre vaner i brug.

### Videomanus (3 min)

1. Vis et svar fra Claude med tre tal i, som ser overbevisende ud
2. Vane 1: stil et kontrolspørgsmål om noget, vi kender svaret på. Det rammer rigtigt
3. Vane 2: bed om kilder. Åbn den ene. Den understøtter faktisk kun to af de tre tal
4. Pointe: svaret var ikke forkert, men det tredje tal var uunderbygget. Det er typisk

### Øvelse

Tag det sidste svar, du fik fra Claude i modul 5. Kør alle tre vaner på det. Skriv ned:

- Hvilket kontrolspørgsmål stillede du, og ramte Claude rigtigt?
- Hvor mange kilder bad du om, og hvad fandt du, da du åbnede en af dem?
- Er der noget i svaret, du nu ikke tør sende videre uden at tjekke selv?

### Refleksion

Hvornår sidst sendte du noget videre, som du ikke havde kontrolleret? Hvad havde det kostet, hvis
det var forkert?

---

## Lektion 7.2 – Hallucinationer og selvsikre fejl

**Varighed:** 7 min. Video: 3 min.

### Læringsmål

Efter lektionen kan deltageren forklare, hvorfor sprogmodeller finder på, og genkende de fem steder
det oftest sker.

### Brødtekst

En sprogmodel gætter det næste ord. Den slår ikke op i en database. Det betyder, at den kan
producere noget, der lyder fuldstændig rigtigt, og som ikke er det.

Det kaldes en hallucination. Ordet er dårligt valgt, fordi det lyder som en fejl i systemet. Det er
det ikke. Det er den samme mekanisme, der gør modellen god til at skrive en velformuleret mail: den
producerer det mest sandsynlige næste ord. Når der findes et rigtigt svar i træningsdataene, rammer
den rigtigt. Når der ikke gør, producerer den noget sandsynligt i stedet for at sige "det ved jeg
ikke".

Det farlige er ikke fejlen. Det farlige er, at fejlen er skrevet i præcis samme selvsikre tone som
alt det rigtige.

**De fem steder det oftest går galt:**

| Hvor | Hvorfor | Eksempel |
|---|---|---|
| Præcise tal og statistik | Modellen kender formen på et tal, ikke tallet | "Cirka 34 procent af danske virksomheder …" |
| Paragraffer og lovhenvisninger | Juridiske referencer har et meget forudsigeligt format | En §-henvisning der ikke findes |
| Citater og hvem der sagde hvad | Citatet lyder som personen, men er konstrueret | Et citat tillagt en kendt ekspert |
| Navne på personer og virksomheder | Plausible navne er nemme at danne | En "kollega" i en kildeliste, der ikke findes |
| Meget nye begivenheder | Ligger efter modellens viden | En lovændring fra i sidste måned |

Bemærk mønsteret: **jo mere forudsigeligt formatet er, jo lettere er det at finde på.** Derfor er
paragrafhenvisninger og procenttal de farligste steder i et dansk arbejdsliv.

### Det, der hjælper

- Slå websøgning til, når svaret afhænger af aktuelle fakta
- Bed om kilder, ikke om sikkerhed. "Er du sikker?" får modellen til at være høflig, ikke til at
  tjekke efter
- Giv den dine egne dokumenter i stedet for at bede den huske
- Spørg åbent: "hvilke af disse påstande er du mindst sikker på?" Det virker bedre end at spørge,
  om den er sikker

### Videomanus (3 min)

1. Bed Claude om en statistik på et snævert dansk område uden websøgning
2. Vis det selvsikre svar
3. Slå websøgning til og stil samme spørgsmål. Sammenlign
4. Pointe: forskellen var ikke modellens evner, men om den havde adgang til noget at slå op i

### Øvelse

Provokér en fejl bevidst. Spørg Claude om noget meget snævert fra dit eget fagområde, uden
websøgning slået til – et tal, en paragraf eller en dato, du selv kender.

Skriv ned: hvordan lød svaret? Kunne du have set fejlen, hvis du ikke kendte området?

Det sidste spørgsmål er hele pointen.

### Refleksion

På hvilke områder i dit arbejde ville du *ikke* kunne se fejlen?

---

## Lektion 7.3 – Din egen lille eval

**Varighed:** 10 min. Video: 5 min.

### Læringsmål

Efter lektionen kan deltageren bygge en simpel test af en prompt med fem eksempler, hvor facit er
kendt, og bruge resultatet til at forbedre prompten.

### Brødtekst

De to foregående lektioner handlede om at tjekke ét svar. Denne handler om at tjekke **prompten** –
altså om din fremgangsmåde overhovedet er til at stole på, før du bruger den på noget vigtigt.

Teknikken hedder en eval. Ordet lyder teknisk. Det er den ikke.

**Sådan gør du:**

1. **Find fem til ti eksempler, hvor du allerede kender det rigtige svar.** Gamle sager, afsluttede
   opgaver, dokumenter du selv har behandlet. Facit er det afgørende.
2. **Kør din prompt på dem.** Én ad gangen, i hver sin samtale, så det ene svar ikke påvirker det
   næste.
3. **Sammenlign med facit.** Ikke "lyder det rigtigt", men "er det rigtigt".
4. **Notér hvor den fejler, og hvordan.** Rammer den altid skævt på samme type? Overser den altid
   det samme?
5. **Justér prompten og kør igen.** Samme eksempler. Blev det bedre?

Først når prompten klarer de kendte eksempler, bruger du den på nye.

**Et konkret eksempel.** En medarbejder i en brancheorganisation vil have Claude til at kategorisere
indkomne medlemshenvendelser. Hun tager 8 henvendelser fra sidste måned, som hun selv har
kategoriseret. Første runde: Claude rammer 5 ud af 8. De tre fejl er alle henvendelser, der handler
om to ting på én gang – dem tvinger prompten ned i én kategori.

Hun tilføjer én sætning: "en henvendelse kan have to kategorier, angiv den primære først". Anden
runde: 8 ud af 8.

Nu ved hun ikke bare, at prompten virker. Hun ved, *hvor godt*, og hun ved hvorfor den fejlede før.
Det tog hende 20 minutter.

### Hvorfor det er kursets vigtigste teknik

Alt andet i dette kursus giver dig en fornemmelse af, om Claude er til at stole på. Dette giver dig
et tal.

Og det gør noget vigtigt ved samtalen med din chef eller dine kolleger. "Jeg synes, det virker
meget godt" er en holdning. "Den rammer 8 ud af 8 på sidste måneds sager" er et argument.

### Hvor mange eksempler?

Fem er nok til at starte. Ti er bedre. Hundrede er et andet fag.

Pointen er ikke statistisk sikkerhed. Pointen er, at du opdager systematiske fejl, før de rammer
rigtigt arbejde. Systematiske fejl viser sig næsten altid inden for de første fem.

### Videomanus (5 min)

1. Vis fem gamle sager med kendt facit i et regneark
2. Kør prompten på alle fem. Vis at tre rammer, to fejler
3. Peg på mønsteret i de to fejl
4. Ret én sætning i prompten
5. Kør igen. Fem ud af fem
6. Pointe: det var ikke modellen, der blev bedre. Det var instruktionen

### Øvelse

Byg din egen eval på kursets gennemgående opgave.

1. Find fem gamle eksempler, hvor du kender facit
2. Kør din prompt fra modul 2 på dem
3. Notér: hvor mange rammer rigtigt? Er der et mønster i fejlene?
4. Ret én ting i prompten
5. Kør igen på de samme fem

Skriv dit før-og-efter-resultat ned. Det er dokumentationen for, at din arbejdsgang virker – og det
er præcis den slags, der overbeviser en leder.

### Refleksion

Hvilken af dine opgaver ville du aldrig overlade til Claude uden en eval først?

---

## Lektion 7.4 – Hvornår du ikke skal bruge Claude

**Varighed:** 5 min. Tekst, ingen video.

### Læringsmål

Efter lektionen har deltageren en personlig stopliste over opgaver, der ikke skal løses med Claude.

### Brødtekst

Et kursus som dette kan let komme til at lyde, som om alt bliver bedre af AI. Det gør det ikke. At
kende grænsen er en del af kompetencen – ikke et forbehold.

**Fem steder, hvor du skal lade være:**

**1. Når du ikke selv kan vurdere svaret, og konsekvensen er stor.** Bruger du Claude på et område,
du ikke kender, kan du ikke se fejlene. Det er acceptabelt, når du skal lære noget. Det er ikke
acceptabelt, når nogen handler på resultatet.

**2. Når data ikke må forlade huset.** Se modul 6. Ingen prompt er så god, at den retfærdiggør at
lægge personfølsomme oplysninger et forkert sted.

**3. Når opgaven er relationen, ikke teksten.** En svær samtale med en medarbejder, en undskyldning
til en kunde, en kondolence. Claude kan hjælpe dig med at forberede dig. Den skal ikke skrive det.
Modtageren kan mærke forskellen, og prisen for at blive opdaget er høj.

**4. Når du skal stå på mål for det fagligt, og du bruger Claude til at springe forståelsen over.**
Forskellen mellem at bruge Claude til at arbejde hurtigere og til at undgå at sætte dig ind i noget
er hårfin. Den første gør dig bedre. Den anden gør dig sårbar.

**5. Når det er hurtigere at gøre det selv.** En prompt på fire linjer til en opgave, der tager to
minutter i hånden, er ikke effektivisering. Det er en hobby.

### Øvelse

Skriv din egen stopliste. Tre til fem punkter, formuleret som dine egne, ikke som mine.

Gem den sammen med din ansvarsregel fra lektion 6.4. De to hører sammen: den ene siger, hvad du
står på mål for, den anden hvornår du lader være.

### Refleksion

Er der noget på din stopliste, som en kollega ville være uenig i? Den samtale er værd at tage.

---

## Quizspørgsmål fra modul 7

Til den samlede kursusquiz. Scenariebaserede, ikke definitionsspørgsmål.

**1.** Du har bedt Claude opsummere en rapport på 60 sider, som du ikke har læst. Hvad gør du først?
- a) Læser opsummeringen igennem og vurderer, om den lyder rimelig
- b) Læser selv et enkelt afsnit og tjekker, om opsummeringen rammer det korrekt ✔
- c) Beder Claude bekræfte, at opsummeringen er korrekt
- d) Beder om en kortere opsummering

*Forklaring: du kan ikke vurdere et svar på materiale, du ikke kender. Vane 1 giver dig et
holdepunkt. Svar c virker ikke – modellen bekræfter gerne sig selv.*

**2.** Claude har givet dig et svar med tre præcise procenttal og ingen kilder. Hvad er mest
sandsynligt?
- a) Tallene er rigtige, Claude glemte bare kilderne
- b) Tallene kan være konstrueret, fordi formatet er let at gætte ✔
- c) Tallene er altid forkerte uden websøgning
- d) Claude kan ikke give procenttal

*Forklaring: præcise tal er et af de fem steder, hvor modeller oftest finder på, netop fordi formen
på et procenttal er meget forudsigelig. "Kan være" er det rigtige niveau – ikke "er altid".*

**3.** Du vil bruge en prompt til at kategorisere indkomne henvendelser fremover. Hvad gør du, før
du sætter den i drift?
- a) Kører den på ti gamle henvendelser, du selv har kategoriseret ✔
- b) Beder Claude vurdere, hvor pålidelig prompten er
- c) Kører den på ti nye henvendelser og læser svarene igennem
- d) Beder en kollega læse prompten

*Forklaring: en eval kræver kendt facit. Nye henvendelser har ikke et facit at måle mod.*

**4.** Din eval viser 6 rigtige ud af 8. De to fejl handler begge om henvendelser med to emner.
Hvad er det rigtige næste skridt?
- a) Acceptere 75 procent som godt nok
- b) Skifte til en kraftigere model
- c) Rette prompten, så den håndterer flere emner, og køre de samme otte igen ✔
- d) Udvide til 50 eksempler

*Forklaring: et mønster i fejlene peger på instruktionen, ikke på modellen. Og man kører de samme
eksempler igen, ellers kan man ikke se, om rettelsen hjalp.*

**5.** Hvilken af disse opgaver hører hjemme på en stopliste?
- a) Udkast til et internt mødereferat
- b) En kondolencehilsen til en kollega, der har mistet en forælder ✔
- c) Opsummering af en lang mailtråd
- d) Forslag til overskrifter til et nyhedsbrev

*Forklaring: når opgaven er relationen og ikke teksten, er det dig, der skal skrive.*

---

## Redaktionelle noter

- Eksemplerne med medlemsorganisationen og brancheorganisationen skal tilpasses eller erstattes af
  cases fra LearnAI's faktiske kundegrundlag. De er skrevet som generiske illustrationer.
- 7.2's tabel bør have et dansk eksempel på en falsk paragrafhenvisning, men eksemplet skal
  **konstrueres**, ikke hentes fra en rigtig lov, så vi ikke selv udbreder en forkert henvisning.
- 7.3 er modulets tungeste lektion på 10 minutter. Overvej at splitte i to, hvis brugertest viser
  frafald.
- Videoen i 7.3 kræver et forberedt regneark med testdata. Det skal produceres, ikke improviseres.
- Ingen af øvelserne kræver fortrolige data, men 7.3 beder deltageren om gamle sager. Der skal stå
  eksplicit: brug afsluttede, anonymiserede eksempler.
