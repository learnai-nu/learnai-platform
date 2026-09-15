# Modul 2 – Den gode prompt

Lektionsindhold, udkast 1. Hører til `docs/claude-grundkursus.md`.

**Modulets løfte:** deltageren går fra at skrive til Claude som til et søgefelt til at skrive som
til en dygtig ny kollega, der ikke kender huset.

**Varighed:** 35 minutter. Fem lektioner. Video i alle fem.

**Forudsætning:** deltageren har valgt sin gennemgående opgave i lektion 1.3.

---

## Lektion 2.1 – Tre trin: sæt scenen, definér opgaven, angiv reglerne

**Varighed:** 8 min. Video: 4 min.

### Læringsmål

Efter lektionen kan deltageren bygge en prompt i tre trin og forklare, hvad hvert trin tilføjer.

### Brødtekst

Forestil dig, at en ny kollega starter i morgen. Hun er kvik, hurtig og har læst utroligt meget. Men
hun har aldrig været i din branche, kender ikke jeres kunder, og har ingen anelse om, hvem der skal
læse det, hun skriver.

Ville du sige "skriv et nyhedsbrev" til hende?

Det er præcis den besked, de fleste giver Claude. Og den får præcis det svar, den fortjener: noget
generisk, der lyder som alle andres.

Den gode prompt har tre dele. De behøver ikke stå i rækkefølge, og de behøver ikke være lange. Men
de skal være der.

**1. Sæt scenen.** Hvem er du, hvad er situationen, hvad skal det bruges til?

> Jeg er administrativ koordinator i Fællesorganisationen Nord, en medlemsorganisation med 120
> ansatte. Jeg udsender et personaleinfobrev hver måned til alle medarbejdere — blandet fagligt
> niveau, og de fleste læser det hurtigt mellem to møder.

**2. Definér opgaven.** Hvad skal der konkret ske? Brug et udsagnsord.

> Skriv et udkast til denne måneds infobrev om de nye regler for rejseafregning.

**3. Angiv reglerne.** Hvilket format, hvilken længde, hvilken tone, hvilke begrænsninger?

> Maks. 250 ord. Direkte og konkret tone, ingen floskler. Start med, hvad det betyder for
> modtagerens hverdag, ikke med paragraffen. Afslut med ét konkret næste skridt.

### Hvorfor det virker

Hvert trin lukker en dør for gætteri.

Uden trin 1 gætter Claude på målgruppen – og gætter typisk på "en bred, interesseret læser", hvilket
er ingen.

Uden trin 3 gætter den på formatet – og lander typisk på noget for langt med en indledning, du
alligevel sletter.

**Reglerne er det trin, folk oftest springer over, og det der giver mest igen.** "Maks. 250 ord" og
"ingen floskler" er to sætninger, der sparer dig for en redigeringsrunde.

### Den korte version

Når du har travlt, virker denne skabelon:

> Jeg er [rolle] og skal [situation]. Skriv [hvad] til [hvem]. Maks. [længde]. Tone: [tone]. Undgå
> [det du ikke vil have].

### Videomanus (4 min)

1. Skriv "skriv et nyhedsbrev" og vis resultatet. Læs to linjer højt. Det er tomt
2. Tilføj trin 1. Kør igen. Nu er der en målgruppe
3. Tilføj trin 2 med et præcist udsagnsord. Kør igen
4. Tilføj trin 3. Kør igen. Sammenlign med det første svar side om side
5. Pointe: samme model, samme opgave. Forskellen var 60 sekunders skrivearbejde

### Øvelse

Tag din gennemgående opgave fra 1.3. Skriv den som prompt tre gange:

1. Kun opgaven, én sætning
2. Opgaven plus scenen
3. Alle tre trin

Kør alle tre. Gem svarene ved siden af hinanden. Du skal bruge dem igen i 2.4.

### Refleksion

Hvilket af de tre trin springer du oftest over, når du har travlt?

---

## Lektion 2.2 – Kontekst er kongen

**Varighed:** 7 min. Video: 3 min.

### Læringsmål

Efter lektionen kan deltageren skrive en genbrugelig kontekstblok og forklare forskellen på kontekst
og instruktion.

### Brødtekst

Claude ved en masse om verden. Den ved ingenting om dig.

Den ved ikke, at I kalder dem medlemmer og aldrig kunder. Den ved ikke, at jeres direktør hader
ordet "synergi". Den ved ikke, at det infobrev, du skriver, bliver læst på tre minutter mellem to
møder.

Alt det er **kontekst**, og det er forskellen mellem et svar, du skal skrive om, og et svar, du kan
bruge.

**Kontekst er ikke det samme som instruktion.** Instruktionen er, hvad Claude skal gøre. Konteksten
er den verden, det skal gøres i. Begge dele er nødvendige, og folk husker næsten altid kun den
første.

### Din kontekstblok

Skriv den én gang. Genbrug den resten af året.

> **Om mig og min organisation**
> Jeg er [titel] i [organisation], som [hvad I laver] for [hvem].
> Vores modtagere er typisk [beskrivelse: rolle, travlhed, forudsætninger].
> Vi kalder dem [det korrekte ord], aldrig [det forkerte].
> Vores tone er [beskrivelse]. Vi undgår [ord, vendinger, klichéer].
> Typiske formater: [hvad I plejer at producere].

Et udfyldt eksempel:

> Jeg er administrativ koordinator i Fællesorganisationen Nord, en medlemsorganisation med 120
> ansatte og ca. 4.000 medlemmer. Modtagerne af mine infobreve er alle medarbejdere — blandet
> fagligt niveau, travle, læser hurtigt. Vi kalder vores medlemmer for medlemmer, aldrig kunder.
> Tonen er konkret og ligefrem, aldrig sælgende. Vi undgår ord som "rejse", "synergi" og "i en
> verden der forandrer sig".

### Tre steder at lægge konteksten

1. **I prompten** – godt til engangsopgaver
2. **I dine personlige præferencer** under indstillinger – gælder alle samtaler
3. **I et projekt** – gælder alle samtaler i det projekt (modul 4)

Start med 1. Når du har skrevet den samme kontekst tre gange, hører den hjemme i 2 eller 3.

### Videomanus (3 min)

1. Vis samme opgave med og uden kontekstblok
2. Peg konkret på tre steder, hvor konteksten slog igennem i svaret
3. Vis hvor man lægger den ind under indstillinger

### Øvelse

Skriv din egen kontekstblok efter skabelonen. Gem den et sted, du kan finde den — en note, et
dokument, hvad som helst.

Kør så din bedste prompt fra 2.1 igen med kontekstblokken sat foran. Hvad ændrede sig?

### Refleksion

Hvilken ting om din arbejdsplads ville en ny kollega tage tre måneder om at lære — og som Claude
kan lære på tre linjer?

---

## Lektion 2.3 – Vedhæft i stedet for at forklare

**Varighed:** 6 min. Video: 3 min.

### Læringsmål

Efter lektionen kan deltageren vedhæfte filer og billeder og ved, hvornår det slår at beskrive
tingene med ord.

### Brødtekst

Der er en grænse for, hvor meget kontekst det giver mening at skrive. Når du er ved at forklare et
dokument, du kunne have vedhæftet, er du på den forkerte side af grænsen.

Claude kan læse PDF, Word, regneark, almindelige tekstfiler og billeder. Den kan læse både teksten
og det visuelle — tabeller, grafer og diagrammer i et dokument.

**Fire ting, det er værd at vedhæfte:**

- **Et eksempel på det, du vil have.** Det sidste infobrev, du var tilfreds med. Ét godt eksempel
  slår tre afsnit om tone.
- **Kildematerialet.** Rejseafregningspolitikken, mødereferatet, regnearket. Lad Claude læse det i
  stedet for at referere det.
- **Et skærmbillede.** Når det er lettere at vise end at forklare.
- **Jeres egne retningslinjer.** Sprogpolitik, designmanual, skabeloner.

**Den vigtigste enkeltvane i hele modulet:** vedhæft et eksempel på et godt resultat og skriv "skriv
i samme stil og struktur som vedhæftede". Det gør mere for kvaliteten end nogen beskrivelse af tone.

### Hvad du skal passe på

Et vedhæftet dokument er delt. Se modul 6, før du vedhæfter noget med persondata, kundeoplysninger
eller fortrolige tal. Hvis du er i tvivl, så anonymisér først — det tager to minutter og fjerner
problemet.

### Videomanus (3 min)

1. Bed om et infobrev med en lang beskrivelse af ønsket tone. Vis resultatet
2. Ny samtale: vedhæft et tidligere infobrev og skriv "samme stil og struktur". Vis resultatet
3. Sammenlign. Den vedhæftede version rammer tættere med en fjerdedel af skrivearbejdet

### Øvelse

Find et eksempel på noget, du selv har lavet, og som du var tilfreds med. Vedhæft det. Bed Claude
lave noget tilsvarende til en ny situation.

Vurdér: hvor tæt rammer den på din stil?

### Refleksion

Hvilket dokument på din computer ville spare dig mest tid, hvis Claude kunne læse det hver gang?

---

## Lektion 2.4 – Når svaret rammer skævt

**Varighed:** 8 min. Video: 4 min.

### Læringsmål

Efter lektionen kan deltageren diagnosticere et utilfredsstillende svar og rette den rigtige ting i
prompten.

### Brødtekst

Det første svar er et udkast, ikke et facit. Det gælder også, når det er tæt på.

De fleste gør én af to ting, når svaret rammer skævt: de accepterer det, eller de starter forfra.
Begge dele er spild. Den rigtige reaktion er at finde ud af, **hvilken slags** skævhed det er — for
hver type har sin egen løsning.

### Fejlfindingstabellen

Print den. Hæng den op.

| Det, du oplever | Det, der mangler | Sådan retter du det |
|---|---|---|
| For generisk, kunne være skrevet til hvem som helst | Målgruppe og kontekst | Tilføj hvem der læser det, og hvad de allerede ved |
| For langt eller for kort | Eksplicit længdekrav | Skriv "maks. 250 ord" eller "tre afsnit" |
| Forkert struktur | Format | Beskriv strukturen, eller vedhæft et eksempel |
| Lyder rigtigt, men er det ikke | Kilder og verifikation | Bed om henvisninger, slå websøgning til, se modul 7 |
| Forkert tone – for sælgende, for stiv, for kæk | Tonebeskrivelse eller eksempel | Beskriv tonen konkret, eller vedhæft noget i den rigtige |
| Rammer ved siden af opgaven | Klart udsagnsord | Skriv præcist, hvad handlingen er: opsummér, sammenlign, omskriv |
| God begyndelse, dårlig slutning | For meget på én gang | Del op. Bed om én ting ad gangen |

Læg mærke til, at **ingen af rækkerne siger "prøv en anden model"**. I ni ud af ti tilfælde er
problemet instruktionen, ikke modellen.

### De tre måder at rette på

**1. Følg op i samtalen.** Hurtigst, når svaret er tæt på.

> Godt udgangspunkt. Gør andet afsnit halvt så langt, og fjern indledningen helt.

**2. Redigér din egen besked.** Klik på blyanten ved din prompt, ret den, og send igen. Bruges, når
du indser, at din oprindelige besked manglede noget. Fordelen: du får et rent svar i stedet for et
svar, der er farvet af den skæve første runde.

**3. Start en ny samtale.** Når samtalen er kørt så langt af sporet, at Claude bliver ved med at
trække det gamle med sig. Det sker, og det er ikke et nederlag. Tag den bedste version med over.

### Det, der ikke virker

"Er du sikker?" og "det var ikke godt nok" giver dig en høflig undskyldning og et nyt forsøg i
blinde. Sig hvad der var galt, og hvad du vil have i stedet.

Forskellen:

> ❌ Det her er ikke godt nok, prøv igen.
>
> ✅ Tonen er for sælgende. Skriv det, som om du forklarer det til en kollega, du kender godt. Og
> skær indledningen væk — start ved pointen.

### Videomanus (4 min)

1. Vis et svar med tre forskellige problemer: for langt, for generisk, forkert tone
2. Diagnosticér dem ét ad gangen med tabellen synlig på skærmen
3. Ret én ting ad gangen, vis effekten hver gang
4. Vis blyant-ikonet og forskellen på at følge op og at redigere sin egen besked

### Øvelse

Tag de tre svar fra 2.1. Kør hvert af dem gennem fejlfindingstabellen.

For hvert svar: hvilken række i tabellen passer bedst, og hvad retter du?

Ret én ting i din bedste prompt. Kør igen.

### Refleksion

Hvor ofte har du accepteret et svar, der var "godt nok", fordi det var lettere end at forklare, hvad
der manglede?

---

## Lektion 2.5 – Tone, målgruppe og iteration

**Varighed:** 6 min. Video: 3 min.

### Læringsmål

Efter lektionen kan deltageren få det samme indhold til at ramme tre forskellige målgrupper og
beskrive tone præcist nok til, at det virker.

### Brødtekst

Claude er god til at skifte tone. Den er ikke god til at gætte, hvilken tone du vil have.

"Skriv det professionelt" betyder ingenting. Professionelt over for direktionen er ikke det samme
som professionelt over for en kollega i kantinen.

**Tre måder at beskrive tone, der faktisk virker:**

1. **Sammenlign med en situation.** "Skriv det, som om du forklarer det til en kollega over
   frokost." "Skriv det, som om det skal læses højt på et bestyrelsesmøde."
2. **Sig, hvad du ikke vil have.** "Ingen udråbstegn. Ingen retoriske spørgsmål. Ingen indledning om
   at verden forandrer sig."
3. **Vedhæft et eksempel.** Stadig det stærkeste, jf. 2.3.

### Samme indhold, tre modtagere

Det er den øvelse, der sidder fast. Tag ét budskab — de nye regler for rejseafregning — og skriv
det til tre modtagere:

| Modtager | Hvad de vil vide | Hvad du skal skære væk |
|---|---|---|
| Direktionen | Hvad koster det, hvad er risikoen, hvornår træder det i kraft | Detaljer om selve processen |
| En kollega i sekretariatet | Hvad ændrer sig for mig, hvornår, hvem hjælper | Den strategiske begrundelse |
| Et medlem, der spørger | Om det overhovedet vedrører dem | Alt om jeres interne arbejdsgang |

Det er den samme besked tre gange. Men hvis du sender direktionens version ud til alle 120
medarbejdere, har du spildt alles tid.

### Iteration som normalen

De bedste brugere af Claude fører en samtale. De skriver ikke én perfekt prompt.

En typisk god runde ser sådan ud:

> 1. Skriv udkastet
> 2. "Kort det ned til det halve"
> 3. "Andet afsnit er stadig for teknisk — skriv det, så en ikke-fagperson forstår det"
> 4. "Giv mig tre forslag til overskriften"

Fire beskeder. Under to minutter. Et resultat, ingen af dem kunne have leveret alene.

### Videomanus (3 min)

1. Ét budskab, tre målgrupper. Vis alle tre versioner
2. Peg på, hvad der forsvandt i hver version
3. Vis en iterationsrunde på fire beskeder fra udkast til færdigt

### Øvelse

Tag ét budskab fra dit eget arbejde. Skriv det til tre modtagere efter tabellen ovenfor.

Læs de tre versioner igennem. Hvilken af dem ville du selv have skrevet uden hjælp — og hvor lang
tid ville det have taget?

### Refleksion

Hvilken af dine tre modtagere får i dag den version, der egentlig var skrevet til en af de andre?

---

## Quizspørgsmål fra modul 2

**1.** Du får et svar, der er velskrevet, men som kunne være sendt til hvem som helst. Hvad mangler
i din prompt?
- a) En længdeangivelse
- b) Målgruppe og kontekst ✔
- c) En kraftigere model
- d) Et tydeligere udsagnsord

*Forklaring: generiske svar er næsten altid et kontekstproblem. Claude gætter på en bred læser, når
du ikke fortæller, hvem der skal læse det.*

**2.** Hvad er den mest effektive måde at få Claude til at ramme jeres skrivestil?
- a) Beskrive tonen grundigt i prompten
- b) Bede om "professionel tone"
- c) Vedhæfte et eksempel på noget, I selv har skrevet, og bede om samme stil ✔
- d) Rette til bagefter

*Forklaring: ét godt eksempel slår tre afsnit om tone. Det er modulets vigtigste enkeltvane.*

**3.** Du har skrevet en prompt, sendt den, og indser så, at du glemte at nævne målgruppen. Hvad er
bedst?
- a) Skrive en ny besked med målgruppen
- b) Redigere din oprindelige besked med blyanten og sende igen ✔
- c) Starte en helt ny samtale
- d) Acceptere svaret og rette til selv

*Forklaring: redigering giver et rent svar. En opfølgning giver et svar, der stadig er farvet af den
mangelfulde første runde. Begge virker — redigering virker bedre.*

**4.** Hvilken formulering hjælper Claude mest, når svaret har forkert tone?
- a) "Det her er ikke godt nok"
- b) "Er du sikker på, at det er den rigtige tone?"
- c) "Skriv mere professionelt"
- d) "Tonen er for sælgende. Skriv det, som om du forklarer det til en kollega, du kender godt" ✔

*Forklaring: sig hvad der er galt og hvad du vil have i stedet. De tre andre er enten indholdsløse
eller beder om en undskyldning frem for en rettelse.*

**5.** Hvornår hører din kontekst hjemme i dine personlige præferencer frem for i selve prompten?
- a) Når den fylder mere end fem linjer
- b) Når du har skrevet den samme kontekst tre gange ✔
- c) Altid – prompten skal kun indeholde opgaven
- d) Aldrig – kontekst skal altid stå i prompten

*Forklaring: engangskontekst hører til i prompten. Kontekst, du gentager, hører til et sted, hvor
den gælder automatisk.*

---

## Redaktionelle noter

- Eksemplerne bruger LearnAI's standardcase, Fællesorganisationen Nord. Se
  `docs/claude-grundkursus-case.md`. Tal og betegnelser skal stemme nøjagtigt overens med casen.
- Kontekstblok-eksemplet i 2.2 er skrevet, så det kan genbruges som skabelon i modul 4 om projekter.
  Hold de to konsistente.
- Fejlfindingstabellen i 2.4 skal produceres som et selvstændigt PDF-ark, deltageren kan hente ned.
  Det er kursets mest genbrugelige enkeltside og et godt argument på salgssiden.
- 2.3 rører ved datasikkerhed, før modul 6 har undervist i det. Henvisningen skal stå, men må ikke
  udfoldes her — ellers kommer modulet til at handle om to ting.
- Videoerne i 2.1 og 2.4 kræver forberedte før-og-efter-eksempler. Improviserede prompts på video
  giver rodede sammenligninger.
