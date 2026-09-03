# Kursuslandingpage – UX og kildegrundlag

Lokalt designudkast, 3. september 2026. Route: `/udkast/ai-i-praksis`.
Ved første udkast samarbejdede UX-rollen og frontenddesign-rollen som faglige arbejdsroller; der var endnu ikke fundet personlige agentprofiler. Revision 02 er senere udført med den nyoprettede personlige `frontend-designer`-skill.

## Hvad vi ved

| Oplysning | Grundlag og beslutning |
| --- | --- |
| Kursus | Sluggen `ai-i-praksis-dit-foerste-kursus` identificerer det gratis introduktionskursus. Seneste lokale migration navngiver det **AI i praksis – din første AI-gevinst på 60 minutter**. Udkastet bruger det korte **AI i praksis** som kursusnavn og en redaktionel overskrift. |
| Varighed | **Ca. 60 minutter**, ikke 55. Seneste migration angiver 60, og lektionerne summerer til 60. Øvelsestid kan variere. `FeaturedCourses.astro` angiver stadig 55 minutter; `HeroLearningPreview.astro` siger under én time. Disse marketingtekster er ældre og er ikke ændret som del af udkastet. |
| Omfang | **6 lektioner i 3 moduler**, verificeret i seneste migration. |
| Pris | **Gratis minikursus**, verificeret i begge indholdsmigrationers beskrivelse og marketingkomponenten. Ingen databasepris er aflæst. |
| Niveau | **Begynder**, angivet i marketingkomponenten og understøttet af introduktionsindholdet. Målgruppen nedenfor er et UX-forslag. |
| Format | Korte tekstblokke, eksempler, tjeklister og øvelser. Sidste lektion har en quiz. Ingen verificerede video-, certifikat- eller underviserløfter. |
| AI-værktøj | Første lektion nævner ChatGPT, Claude eller Copilot. Kursusmaterialet kræver valg af et værktøj, som passer til arbejdspladsens regler. Ingen påstand om bestemte gratis abonnementers muligheder. |

Kilder i prioriteret rækkefølge:

1. `docs/free-course-source-map.md`: redaktionel retning og adskillelse mellem gratis introduktion og betalt flagskib. Den henviser til Rettelsespakke v2, men selve rettelsespakken blev ikke fundet lokalt.
2. `supabase/migrations/20260731231349_align_free_course_with_rettelsespakke_v2.sql`: nyeste lokale, konkrete kursustitel, tidsestimater, moduler, lektionstekster og quiz. Bekræfter indholdets tiltænkte tilstand; migrationens anvendelse i produktion er ikke kontrolleret.
3. `supabase/migrations/20260731205148_enrich_free_course_level_1.sql`: tidligere version, også med 60 minutter. Dens seks promptdele er erstattet af **fire byggesten** i den nyere migration.
4. `src/components/marketing/FeaturedCourses.astro` og `HeroLearningPreview.astro`: nuværende marketing og den identificerede uoverensstemmelse om titel/varighed.
5. `src/pages/login.astro`, `src/pages/auth/sign-up.ts`, `src/pages/auth/sign-in.ts`, `src/pages/auth/callback.ts` og `src/pages/kurser/[slug].astro`: eksisterende konto- og kursusflow, læst som tekst.

Flagskibets fireugers forløb, workshops, digitale kolleger og løfte om 2–5 sparede timer om ugen skal ikke overføres til gratiskurset. Udkastet bruger ingen testimonials, deltagerantal eller udokumenterede resultatgarantier.

## Målgruppe og opgave

Forslag: dansktalende medarbejdere og selvstændige med tilbagevendende skrive- og overbliksopgaver. De er nye i AI eller har prøvet det uden en fast metode. De skal kunne afgøre, om kurset passer til deres arbejdsdag, forstå tidsforbruget og prøve én konkret øvelse.

Det centrale spørgsmål er: “Kan jeg bruge det her på en opgave, jeg allerede har?” Derfor kommer en fiktiv mailtråd og dens struktur før længere forklaringer om teknologi.

## Læringsudbytte og rækkefølge

Formulér udbyttet som noget deltageren øver, ikke et garanteret resultat:

- **Skab overblik i en mailtråd.** Find beslutninger, åbne spørgsmål og dine næste handlinger.
- **Byg en skabelon, du kan genbruge.** Brug rolle, kontekst, opgave og format; forbedr derefter svaret og tonen.
- **Kontrollér data og svar.** Vælg, hvad du må dele, og brug tre kontrolvaner, før indhold sendes videre.

Anbefalet informationsrækkefølge:

1. Kursusnavn, konkret overskrift, målgruppe, gratis/begynder/ca. 60 minutter/6 lektioner og primær handling.
2. Et synligt fiktivt mail→overblik-eksempel, der gør opgaven håndgribelig.
3. Tre læringsudbytter med en kort forklaring hver.
4. De seks lektioner med individuelle estimater og fold-ud-beskrivelser.
5. Et kort, tydeligt markeret forslag til adgangsforløb.
6. FAQ og gentaget primær handling.

Hero-forslag: **“Få AI til at hjælpe med din næste arbejdsopgave.”** Undertekst: “Få overblik over en mailtråd, byg en prompt du kan genbruge, og lær at kontrollere svaret. Seks praktiske lektioner på dansk.”

| Modul | Lektion | Tid |
| --- | --- | --- |
| Få dit første resultat | Quick win: Få styr på en lang mailtråd | 10 min. |
| Få dit første resultat | Sådan “tænker” en sprogmodel | 8 min. |
| Byg en skabelon, du kan genbruge | De fire byggesten i en brugbar prompt | 12 min. |
| Byg en skabelon, du kan genbruge | Fra første udkast til noget, du vil bruge | 10 min. |
| Brug AI sikkert og troværdigt | Datasikkerhed, GDPR og sund fornuft | 9 min. |
| Brug AI sikkert og troværdigt | De tre kontrolvaner – og dit næste skridt | 11 min. |

## CTA og adgang

Udkastets primære CTA er **“Prøv første øvelse”**, sekundært **“Se de 6 lektioner”**. Den første åbner en lokal, interaktiv smagsprøve; den anden springer til programmet. Smagsprøven er en redaktionel forkortelse, ikke hele den 10 minutter lange lektion, og mærkes derfor **“Kort smagsprøve på lektion 1”** i dialogen. Placér “Lokal demo” tæt på første CTA. Demoen bruger en fiktiv mailtråd, en prompt, et forberedt eksempel på et svar og kontrolspørgsmål. Der sendes ikke materiale til en AI-tjeneste, og der oprettes ingen konto.

Hvis prompten kan redigeres, skal svaret kaldes **“et forberedt eksempel”**. En knap som **“Se et eksempel på et svar”** må ikke antyde, at demoen genererer et nyt svar ud fra den redigerede tekst.

**Forslag til senere adgangsflow, ikke implementeret:** “Start gratis” → opret profil med e-mail og adgangskode eller log ind → bekræft e-mail ved ny profil → åbn første lektion. Returnér deltagere til den næste uafsluttede lektion. Bevar kursuskonteksten gennem login og vis tydeligt e-mailbekræftelsens næste skridt. Det nuværende kodeflow sender til dashboardet efter login; direkte retur til kurset er derfor et fremtidigt forbedringsforslag, ikke eksisterende funktionalitet.

En kontoskærm i udkastet skal være mærket “Forslag til forløb” og må ikke indsamle oplysninger eller kvittere for en virkelig tilmelding. Det konkrete udkast kan vise forløbet som tre teksttrin uden en formular.

## FAQ-tekster

- **Hvem er kurset til?** Til dig, der er ny i AI eller har prøvet det uden at få en fast metode til dit arbejde.
- **Hvor lang tid tager det?** Ca. 60 minutter fordelt på 6 lektioner. Du kan bruge mere tid på øvelserne.
- **Hvilket AI-værktøj skal jeg bruge?** Øvelserne kan afprøves i ChatGPT, Claude eller Copilot. Brug et værktøj, din arbejdsplads har godkendt.
- **Er kurset gratis?** Minikurset er gratis. Det fulde forløb “AI som dit daglige værktøj” er et separat tilbud.
- **Hvordan foregår undervisningen?** Gennem korte tekster, eksempler og øvelser. Sidste lektion har en quiz.
- **Kan jeg bruge en rigtig arbejdsopgave?** Start med et fiktivt eksempel, eller fjern de oplysninger, du ikke må dele. Kurset indeholder en lektion om datasikkerhed og ansvarlig brug.

## Review med frontenddesigneren

Frontenddesigneren foreslog en redaktionel workbook-retning med papirhvid baggrund, blå handlinger, gule markeringer og et mail→overblik-ark. Det passer til den aktive workbook-del i `src/styles/blue-orbit.css`, som udtrykkeligt erstatter den gamle Blue Orbit-marketingstil. UX har godkendt retningen og sendt disse konkrete forbedringer:

- Bevar “AI i praksis” før den nye hero-overskrift, så kurset genkendes.
- Saml kursusfakta tæt ved CTA og hold demo-mærkningen læselig.
- Skeln tydeligt mellem redigerbar prompt og forberedt svar.
- Placér CTA før det visuelle kort på mobil; brug mindst 44 px trykflader.
- Lad en øvelsesdialog kunne lukkes med Escape og en synlig lukkeknap, med fokus tilbage til startknappen.
- Forklar foreslået tilmelding med teksttrin, så der ikke opstår falsk succes eller tvivl om, hvad der er aktivt.

Frontenddesignerens review af UX-forslaget: behold rækkefølgen og den konkrete mailopgave; vis de seks lektioner uden tre ekstra moduloverskrifter for at gøre programmet lettere at skimme. De seks titler og tidsestimater er bevaret. Designeren tilføjede præciseringen om, at demoen kun er en kort smagsprøve, og bekræftede adskillelsen mellem eksisterende login og foreslået kursusretur.

UX gennemgik derefter sidens endelige tekst og flow. Tider, titler, quiz, værktøjer og gratis minikursus stemte med kilderne. Én lektionsparafrase blev rettet fra “rammer” til **rolle**, så den nu nævner de fire faktiske byggesten: rolle, kontekst, opgave og format. UX anbefalede også at skelne tydeligere mellem de tre læringsudbytter og kursets tre kontrolvaner samt at undgå formuleringen “når kurset er klar”, da produktionsstatus er ukendt. Alle tre rettelser og smagsprøve-mærkningen er bekræftet i den opdaterede kildefil.

Root står for browser- og mobilkontrol. Dette dokument registrerer kildekontrol og fagligt indholdsreview; det dokumenterer ikke en produktionsgodkendelse.
