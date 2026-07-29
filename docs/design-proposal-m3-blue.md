# Blue Orbit

## Nyt designforslag til LearnAI.nu

**Status:** High-fidelity koncept og lokal prototype  
**Dato:** 29. juli 2026  
**Designretning:** Google Material Design 3, fortolket som et særpræget dansk læringsbrand  
**Prototype:** `design-prototypes/m3-blue/index.html`

---

## 1. Executive summary

Blue Orbit positionerer LearnAI som Danmarks moderne og tillidsvækkende indgang til praktisk AI. Designet kombinerer tre kvaliteter:

1. **Klarhed:** Et enkelt, nordisk informationshierarki, tydelige handlinger og meget lidt visuel støj.
2. **Energi:** En levende blå palet, bløde baner, progression og produktvisualiseringer skaber fremdrift.
3. **Troværdighed:** Tonale flader, stærk typografi, gennemtænkte states og konkret produkt-UI gør løftet håndgribeligt.

Retningen er funderet i Material 3, men ser ikke ud som en standardiseret Google-app. M3 bruges som adfærds- og tokensystem. LearnAI-brandet opstår gennem egen farvekarakter, typografisk rytme, asymmetriske kompositioner, læringsmetaforer og et præcist dansk toneleje.

### Det centrale designgreb

Forsiden viser ikke en abstrakt robot eller generisk AI-gradient. Den viser selve læringsoplevelsen: progression, næste lektion, færdigheder og konkrete handlinger. Brugeren skal allerede i hero-sektionen kunne mærke, at LearnAI er et fungerende produkt — ikke bare et indholdsarkiv.

---

## 2. Audit af den nuværende retning

Den eksisterende løsning har et solidt, roligt fundament:

- enkel navigation og gode responsive basismønstre
- tydelige CTA'er
- høj læsbarhed
- en sammenhængende grøn farveretning
- genbrugelige kort, knapper og admin-komponenter

Den visuelle identitet har dog fire begrænsninger i forhold til ambitionen:

| Nuværende princip | Begrænsning | Blue Orbit |
|---|---|---|
| Grøn, afdæmpet palette | Føles mere som bæredygtighed/vidensportal end teknologisk læring | Blå autoritet med cyan energi og violet dybde |
| Ensartede hvide kort | Begrænset hierarki og få mindeværdige øjeblikke | Tonale M3-flader, bento-kompositioner og kontrolleret kontrast |
| Hero med et enkelt kursuskort | Forklarer kursus, men ikke platformens fulde værdi | Produktvindue med progression, næste lektion og kompetencer |
| Samme visuelle temperament overalt | Marketing, læring og admin føles næsten ens | Ét system med tre modaliteter: inspirerende, fokuseret og effektiv |

Den nuværende kode er overvejende samlet i `src/styles/global.css`. Det gør en første MVP hurtig, men en kommende visuel relancering bør bryde tokens og komponentstyles ud, så marketing, læringsflader og admin kan udvikle sig kontrolleret.

---

## 3. Kreativ retning

### Navn: Blue Orbit

En orbit er en stabil bane omkring noget vigtigt. For LearnAI er det vigtige ikke teknologien i sig selv, men brugerens udvikling. Designet bruger cirkler, baner, noder og progression som en diskret visuel grammatik:

- **baner** viser en læringsrejse
- **noder** viser milepæle
- **ringe** viser progression
- **signaler** viser ny viden eller næste handling

Det gør identiteten teknologisk uden at falde tilbage på robotter, hjerner, neonnetværk eller stockfotos.

### Brandfortælling

> AI flytter sig hurtigt. Din læring behøver ikke føles kaotisk. LearnAI giver dig en klar bane fra nysgerrighed til kompetence.

### Personlighed

- premium, men ikke elitær
- intelligent, men aldrig akademisk tung
- energisk, men ikke hektisk
- dansk og ligefrem, men ikke tør
- ansvarlig, men ikke forsigtig på en defensiv måde

---

## 4. Inspirationskilder — oversat, ikke kopieret

### Material Design 3

[Material Design 3](https://m3.material.io/) beskriver et adaptivt designsystem med fokus på farveroller, typografisk skala, shapes, motion og robuste komponenter. M3 Expressive fremhæver desuden fleksibel typografi, kontrasterende former, intuitiv motion og emotionel UX. [M3 states](https://m3.material.io/foundations/interaction/states/overview) anbefaler konsistente tilstande og mere end ét visuelt signal for tilgængelighed. [M3 canonical layouts](https://m3.material.io/foundations/layout/canonical-examples/overview) beskriver feed, list-detail og supporting pane på tværs af breakpoints.

**Oversættelse til LearnAI:**

- semantiske farveroller frem for tilfældige hex-værdier
- container-niveauer frem for tunge skygger overalt
- M3-shapes til at kommunikere funktion
- feed-layout til Lær AI og kursuskatalog
- supporting pane til lektioner
- list-detail til admin
- tydelige enabled, hover, focus, pressed, selected, loading og disabled states
- motion med funktionel kontinuitet

### Netlify

[Netlifys forside](https://www.netlify.com/) bruger korte, selvsikre budskaber, store product-first demonstrationer og en stærk kobling mellem løfte og faktisk workflow.

**Det vi adopterer:**

- produktet som hovedvisual i stedet for dekorative illustrationer
- selvsikkert copy-hierarki
- vekselvirkning mellem store udsagn og konkrete produktbeviser
- teknologisk præcision uden “enterprise-gråhed”

**Det vi ikke kopierer:**

- Netlifys developer-first kodeæstetik
- deres sort/hvide brandkontrast
- deres specifikke layout eller illustrationer

### Current

[Current](https://current.com/) bruger ekstrem enkelhed, store udsagn, høj energi og visuelle historier, der gør et komplekst produkt umiddelbart.

**Det vi adopterer:**

- enkel, direkte overskrift
- få stærke budskaber pr. viewport
- venlig, menneskelig energi
- klare feature-øjeblikke

**Det vi ikke kopierer:**

- finansappens ungdommelige tone
- karakterillustrationer
- dens kampagneagtige gentagelser

### Revolut

[Revolut](https://www.revolut.com/) arbejder med premium produktpræsentation, modulære serviceuniverser og en oplevelse af kontrol og momentum.

**Det vi adopterer:**

- premium finish og disciplineret detaljegrad
- produktkort som konkrete værdibeviser
- en klar overgang fra inspiration til brugerens personlige rum

**Det vi ikke kopierer:**

- bankens sorte luksussprog
- produktfotografi og app-mockups
- finansielle kortmetaforer

---

## 5. Designprincipper

### 5.1 Vis produktet, ikke bare løftet

Hver central marketingside skal vise mindst ét realistisk produktøjeblik: en læringssti, et promptværktøj, en lektion, en quiz eller et dashboard.

### 5.2 Én primær handling pr. kontekst

- Forside: “Find dit første kursus”
- Kursusdetalje: “Start/Fortsæt kursus”
- Lektion: “Markér som færdig”
- Dashboard: “Fortsæt lektion”
- Admin: “Nyt indhold” eller “Gem”

Sekundære handlinger bruger tonal, outline eller tekstbehandling.

### 5.3 Tonale flader før skygger

M3's surface containers skaber hierarki med farvetoner. Skygger reserveres til flydende navigation, vigtige produktvinduer og interaktive kort i hover/focus.

### 5.4 Form forklarer funktion

- 999 px: chips, status, små valg og primære CTA'er
- 16 px: felter, menupunkter og kompakte admin-elementer
- 24 px: kort og læringsmoduler
- 32–48 px: hero-vinduer, bento-flader og kampagnepaneler

### 5.5 Fremdrift er det visuelle motiv

Progression vises med både tal, tekst og form. Farve bruges aldrig alene.

### 5.6 Dansk ro

Høj energi kommer fra skala og farve — ikke fra mange elementer. Store whitespace-zoner, præcis tekst og få valg bevarer roen.

---

## 6. Farvesystem

Blue Orbit bygger på en fast blå seed color og semantiske M3-roller.

### Brand- og kernetokens

| Token | Værdi | Rolle |
|---|---:|---|
| `primary` | `#0B45FF` | Primære CTA'er, aktive states, links |
| `on-primary` | `#FFFFFF` | Tekst/ikon på primary |
| `primary-container` | `#DCE5FF` | Valgte chips, læringsflader, tonal CTA |
| `on-primary-container` | `#001849` | Tekst på primary container |
| `deep` | `#06246B` | Premium mørke sektioner |
| `deepest` | `#04143E` | Footer, læringsfokus og dramatisk kontrast |
| `signal` | `#78E8FF` | Progression, highlights, nye signaler |
| `violet` | `#7257FF` | Sekundær AI-/værktøjsaccent |
| `surface` | `#F7F8FF` | Primært canvas |
| `surface-low` | `#F0F2FB` | Navigation og baggrund |
| `surface-container` | `#E9ECF7` | Kortgrupper og sektioner |
| `surface-bright` | `#FFFFFF` | Højeste læseflade |
| `on-surface` | `#111827` | Primær tekst |
| `on-surface-variant` | `#4E5669` | Sekundær tekst |
| `outline-variant` | `#C5CAD8` | Diskrete borders |
| `success` | `#08775B` | Gennemført |
| `warning` | `#8A5200` | Kræver opmærksomhed |
| `error` | `#B3261E` | Fejl/destruktiv |

### Blå skal ikke betyde alt

Primary-blå viser handling og selection. Cyan viser signal/progression. Grøn reserveres til gennemført/succes. Orange reserveres til redaktionelt arbejde, der kræver opmærksomhed. Det giver brugeren en stabil semantik.

### Dark surfaces

Mørke flader bruges målrettet:

- kursusafspillerens ramme
- afsluttende CTA
- footer
- særligt stærke feature-momenter

Hele websitet bør ikke være dark mode som standard. Det lyse nordiske canvas giver større læsevenlighed og troværdighed til indhold.

---

## 7. Typografi

### Anbefalet retning

Brug en variabel grotesk med høj læsbarhed og god dansk tegnsætning. To realistiske muligheder:

1. **Inter Variable** som robust, neutral og open-source grundskrift.
2. **Manrope Variable** som lidt mere særpræget display-/brandvalg.

Før endelig implementering skal fontlicens, performance og æ/ø/å-kvalitet verificeres. Prototypen bruger systemfont-stack for at være lokal og afhængighedsfri.

### Skala

| Rolle | Desktop | Mobil | Vægt | Brug |
|---|---:|---:|---:|---|
| Display XL | 118 px | 56–72 px | 760 | Hero |
| Headline L | 72–84 px | 40–56 px | 740 | Sektionstitler |
| Headline M | 48–56 px | 32–40 px | 740 | Features |
| Title L | 28–36 px | 24–30 px | 720 | Kort og panels |
| Body L | 18–20 px | 17–18 px | 450 | Introcopy |
| Body M | 16 px | 16 px | 450 | Brødtekst |
| Label | 12–14 px | 12–14 px | 720 | Chips, meta, overlines |

Displaytekst må have negativ letter-spacing. Brødtekst må ikke. Maksimal linjelængde for læsetekst er 70–75 tegn.

---

## 8. Spacing, grid, elevation og motion

### Spacing

Grundrytmen er 4 px, med primær skala:

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`

Sektioner bruger 96–160 px på desktop og 64–96 px på mobil. Den store rytme er afgørende for premiumoplevelsen.

### Layout

- Maksimal marketingbredde: 1380 px
- Desktopgrid: 12 kolonner
- Tablet: 8 kolonner
- Mobil: 4 kolonner
- Gutter: 16–24 px

M3's adaptive layouts omsættes sådan:

- **Feed:** Lær AI og kurser
- **Supporting pane:** kursuslektion med moduloversigt
- **List-detail:** admin-CMS
- **Custom/bento:** kun marketing og introduktioner

### Elevation

| Niveau | Brug |
|---|---|
| 0 | Primære surfaces |
| 1 | Inaktive kort, inputs |
| 2 | Hover-kort, produktpaneler |
| 3 | Mobile menu, dialog, hero-produktvindue |

### Motion

- Standard: 180–240 ms
- Emphasized: 300–420 ms
- Easing: `cubic-bezier(.2, 0, 0, 1)`
- Spring-lignende microinteraction: kun til CTA, cards og selection
- Reduceret bevægelse skal deaktivere orbit, float og store transitions

Motion forklarer:

- hvilket filter der er valgt
- hvordan et panel åbner
- hvor en lektion fortsætter
- at progression er gemt

Motion bruges ikke som en løbende baggrundseffekt på selve læringsfladen.

---

## 9. Illustrationer og imagery

### Primær stil

Repo-native SVG og UI-baserede illustrationer med:

- orbitlinjer
- læringsnoder
- abstrakte bølger
- typografiske symboler
- realistiske produktudsnit
- tonale 2D/2.5D-flader

### Foto

Hvis foto introduceres senere, skal det vise virkelige danske arbejdssituationer og mangfoldige fagroller. Undgå:

- mennesker, der peger på hologrammer
- robotter og humanoide AI-figurer
- neonhjerner
- generiske “business people around laptop”
- billeder med AI-genererede hænder/tekstfejl

### Ikoner

Brug et konsekvent, afrundet outline-sæt med 1.75–2 px stroke. Ikoner skal understøtte label, ikke erstatte vigtig tekst.

---

## 10. Navigation

### Offentlig topnavigation

- sticky, transparent/blurred top app bar
- fire primære indgange: Lær AI, Kurser, Prompts & værktøjer, Virksomheder
- “Log ind” som teksthandling
- “Kom i gang” som primary CTA
- aktiv route vises med tonal container, ikke kun farve

På mobil bruges én tydelig menuknap med mindst 44 × 44 px target og et tonal surface-menuark.

### Dashboard

Venstre rail på desktop og bundnavigation på mobil:

- Overblik
- Mine kurser
- Mine gemte
- Indstillinger

### Admin

Admin bruger samme brand, men en mere kompakt 16 px shape-rytme og færre dekorative flader. Effektivitet prioriteres over marketingudtryk.

---

## 11. Komponentprincipper

### Buttons

- Filled: én primær handling
- Tonal: vigtig sekundær handling
- Outlined: valg og utility
- Text: navigation og tertiære handlinger
- Icon/FAB: tydelig ikonhandling med label eller accessible name

Alle states: enabled, hover, focus, pressed, disabled og loading.

### Cards

Et helt kort er kun klikbart, hvis det har ét mål. Hvis kortet indeholder flere handlinger, er kun CTA'en klikbar. Hover-elevation suppleres af border-/farveændring.

### Chips

Chips bruges til hurtige filtre og valg — ikke som almindelige informationsbadges. Statusbadges og filterchips er forskellige komponenter.

### Progress

Progression kombinerer mindst to af:

- procent
- “3 af 4”
- visuel ring/bar
- statusord

### Forms

- labels er altid synlige
- hjælpetekst og fejl knyttes programmatisk
- validering vises efter relevant brugerhandling
- destructive actions adskilles visuelt
- touch targets mindst 44 × 44 px

---

## 12. Konkrete sideforslag

### 12.1 Forside — højeste prioritet

**Mål:** Få en ny dansk bruger til at forstå produktet og starte et kursus.

1. Sticky navigation med én klar CTA
2. Hero: “Bliv bedre til AI. Én praktisk sejr ad gangen.”
3. Realistisk læringsdashboard som hero-visual
4. Tre korte trust-signaler
5. Troværdighedsstrip med indhold, tid og dansk fokus
6. Bento-forklaring: Lær → Prøv → Byg videre
7. Filtrérbart kursusudvalg
8. Produktmoment fra kursusafspilleren
9. Personligt dashboard/admin/Lær AI-visning
10. Stor afsluttende CTA på deep-blue surface

Forsiden skal primært konvertere til gratis læring. AI Mentor nævnes først, når funktionen faktisk findes og kan demonstreres.

### 12.2 Lær AI

- søgecentreret hero: “Hvad vil du blive bedre til?”
- emnechips med antal
- redaktionelle “start her”-forløb
- feedkort med type, læsetid, opdateringsdato og næste handling
- prompts får særskilte tool-kort med felter og privacy-markering
- nyheder adskilles visuelt fra evergreen guides

### 12.3 Kursuskatalog

- chips efter mål, rolle, niveau og tidsforbrug
- første filterlag holdes enkelt; avancerede filtre i sheet
- kursuskort viser niveau, tid, pris, antal lektioner og outcome
- “Mest populær” bruges kun med reelt grundlag
- tom, loading og fejltilstand har konkrete næste handlinger

### 12.4 Kursusdetalje

- outcome før pensum
- tydelig tid, niveau, pris/adgang og forudsætninger
- modulstruktur som ekspanderbare sektioner
- sample/preview uden login hvor muligt
- sticky CTA på desktop og bottom CTA på mobil

### 12.5 Lektion

- supporting pane: moduloversigt + fokuseret læseflade
- én primær handling: “Markér som færdig”
- næste lektion først efter gemt progression
- ressourcer og quiz vises i logisk rækkefølge
- ingen marketingnavigation, der konkurrerer med læringen

### 12.6 Dashboard

- “Fortsæt hvor du slap” er største element
- ugemål og progression er sekundære
- anbefalinger skal forklares: “Fordi du har gennemført…”
- kursushistorik og gemte elementer er tilgængelige, men ikke dominerende

### 12.7 Admin

- kompakt list-detail-struktur
- dashboard viser handlinger, ikke vanity metrics
- gennemgangskø fremhæves
- søgning, type og status står samlet
- status kommunikeres med tekst, farve og shape
- save bar er sticky ved lange formularer
- preview er en tydelig separat mode

---

## 13. Tilgængelighed

Designmålet er WCAG 2.2 AA.

- alle targets mindst 44 × 44 px på touch
- synligt 3 px fokus med høj kontrast
- ingen information kommunikeres kun med farve
- semantiske landmarks og korrekt headingstruktur
- `aria-current`, `aria-selected`, `aria-expanded` og live regions hvor relevant
- labels på alle felter
- tekst kan forstørres til 200 %
- responsive reflow uden horisontal læsescroll
- `prefers-reduced-motion` respekteres
- dark surfaces kontrolleres særskilt for kontrast
- diagrammer og progressionsvisualiseringer har tekstalternativer

Prototypen indeholder skip-link, semantiske landmarks, labels, tastaturfokus, mobile targets og reduceret motion.

---

## 14. Før/efter-principper

| Før | Efter |
|---|---|
| “Et pænt grønt kursussite” | Et blåt, produktdrevet læringsbrand |
| Ensartede hvide kort | Tonal dybde og tydelige prioriteringer |
| Artikelarkiv som mental model | Personlig vej fra mål til kompetence |
| Generiske featurekort | Konkrete produktøjeblikke |
| Ét designudtryk overalt | Marketing, læring og admin som tre modaliteter i ét system |
| Progression som procent | Progression som tal, tekst, form og næste handling |
| Global CSS som hovedsystem | Tokens + komponentlag + kontekstuelle layouts |

---

## 15. Teknisk implementeringsplan

### Fase 0 — Beslutning og validering (2–4 dage)

- gennemgå prototypen med ejer og 3–5 målgruppebrugere
- vælg endelig font
- godkend primær blå seed color
- vælg illustrationstilgang
- beslut light/dark scope

**Exit:** Godkendt kreativ retning og låste kernetokens.

### Fase 1 — Designfundament (3–5 dage)

- opret `src/styles/tokens.css`
- opret semantiske color, type, spacing, shape, motion og elevation tokens
- opret grundkomponenter i Astro: Button, IconButton, Chip, Badge, Card, Progress, Notice, EmptyState
- dokumentér states og varianter
- indfør visuel regression på komponentniveau

**Exit:** Komponenter kan bygges uden lokale engangsstyles.

### Fase 2 — Offentlig shell og forside (4–7 dage)

- ny header, mobilmenu og footer
- hero og produktillustration
- Lær/Prøv/Byg videre-bento
- kursusudvalg
- afsluttende CTA
- metadata, performance og accessibility QA

**Exit:** Ny forside kan testes som Vercel preview uden at ændre produktflows.

### Fase 3 — Discovery (4–6 dage)

- Lær AI-søgning og emnechips
- content cards og prompt cards
- kursuskatalog og filtre
- kursusdetalje
- loading/error/empty states

**Exit:** Brugeren kan finde relevant læring hurtigere end i nuværende løsning.

### Fase 4 — Learning experience (4–7 dage)

- lesson supporting pane
- progress, completion og next step
- quizkomponenter
- mobile bottom action
- focus mode

**Exit:** Et komplet kursus kan gennemføres i den nye visuelle ramme.

### Fase 5 — Dashboard og admin (5–8 dage)

- dashboard hierarchy
- responsive rail/bottom navigation
- admin list-detail
- editorial queue
- sticky save actions
- kompakte data- og formularstates

**Exit:** Både learner- og redaktørflow er konsistente og effektive.

### Fase 6 — Hærdning (3–5 dage)

- WCAG 2.2 AA audit
- browser- og viewportmatrix
- Lighthouse/Core Web Vitals
- reduced motion og forced colors
- dansk sproglig QA
- visuelle regressionstests

**Exit:** Produktionsklar releasekandidat.

### Ingen big-bang

Implementér bag et preview/feature flag eller route-for-route. Supabase-schema, RLS, progression og quizlogik ændres ikke af designarbejdet.

---

## 16. Foreslået CSS-/komponentstruktur

```text
src/
  styles/
    tokens.css
    reset.css
    base.css
    utilities.css
  components/
    ui/
      Button.astro
      IconButton.astro
      Chip.astro
      StatusBadge.astro
      Progress.astro
      Notice.astro
      EmptyState.astro
    marketing/
      HeroLearningPreview.astro
      LearningModel.astro
      FeaturedCourses.astro
    learning/
      CourseCard.astro
      LessonRail.astro
      LessonCompleteAction.astro
    admin/
      AdminRail.astro
      EditorialQueue.astro
      FilterBar.astro
```

Undgå at indføre en stor komponentafhængighed alene for at få Material-looket. Astro, CSS custom properties og små React islands er tilstrækkeligt. Material 3 er inspirations- og systemgrundlag, ikke et krav om et bestemt framework.

---

## 17. Performancebudget

- ingen stor UI-runtime til statiske marketingsider
- hero-illustration som optimeret SVG/CSS
- højst én fontfamilie med relevante subsets i første release
- kritisk CSS holdes lille og komponentiseret
- ingen autoplay-video i hero
- interaktivitet hydreres kun, hvor den skaber værdi
- mål: LCP under 2,5 sek., INP under 200 ms, CLS under 0,1 på reelle enheder

---

## 18. Åbne beslutninger

1. Skal “Blue Orbit” også blive eksternt kampagnenavn, eller kun internt designnavn?
2. Inter eller Manrope som endelig brandfont?
3. Skal mørkt tema være brugerindstilling eller kun anvendes på kuraterede surfaces?
4. Hvor meget af hero-dashboardet skal være realistisk live-data versus statisk illustration?
5. Skal AI Mentor være del af første relancering eller først kommunikeres, når den er produktionsklar?
6. Er B2B en primær navigationsindgang ved relancering, eller skal den være sekundær indtil tilbuddet er klar?

Min anbefaling er at låse 1–3 før implementering og lade 4–6 følge produktets faktiske modenhed.

---

## 19. Prototype og verificering

Den isolerede prototype findes her:

- `design-prototypes/m3-blue/index.html`
- `design-prototypes/m3-blue/styles.css`
- `design-prototypes/m3-blue/README.md`

Den indeholder responsive states, mobilmenu, kursusfiltre, dashboard/admin/Lær AI-faner, kursusafspiller, design tokens og reduceret motion.

### Visuel browser-QA

Hovedagenten har efterfølgende gennemført interaktiv browser-QA ved 1280 × 720 px og
390 × 844 px. Følgende flows er verificeret:

- desktop- og mobilhero
- mobilmenu, inkl. Escape-lukning og dynamiske accessible names
- lyst og mørkeblåt tema med korrekte pressed-states
- kursusfiltre og deres tomme/valgte states
- Dashboard, Admin og Lær AI-faner med både klik og piletaster
- mobil kursusafspiller, progression, modulrail og lektionsindhold
- mobil reflow uden dokumentbaseret horisontal scroll
- browserkonsol uden fejl eller advarsler

QA'en førte til fire konkrete forbedringer:

1. Indre grid-elementer i kursusafspilleren og Lær AI-panelet fik korrekte
   `min-width: 0`-regler, så de ikke skaber mobilt overflow.
2. Dekorative orbit- og aurora-elementer klippes på dokumentniveau.
3. Dark-mode bruger nu M3-tilpassede primary/on-primary-roller med læsbar kontrast.
4. Horisontale chips og modulnavigation bevarer swipe-adfærd uden tunge scrollbars.

Prototypen er fortsat bevidst isoleret fra produktion og Vercel.
