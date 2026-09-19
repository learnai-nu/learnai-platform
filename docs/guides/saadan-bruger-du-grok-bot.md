---
title: "Sådan kommer du i gang med Grok Bot"
seoTitle: "Sådan bruger du Grok Bot: Guide til AI-agenter | LearnAI"
slug: "/laer/saadan-bruger-du-grok-bot"
metaDescription: "Lær at bruge Grok Bot til research, indhold, websites og andre større opgaver. Se hvordan du skriver en god brief, styrer AI-agenter og kontrollerer resultatet."
teaser: "Giv Grok Bot en konkret opgave, og lad AI-agenter arbejde videre på tværs af værktøjer. Her får du en praktisk metode med brief-skabelon og Kursusoversigten som case."
category: "Guide"
level: "Begynder / let øvet"
estimatedReadTime: "10–12 min."
---

# Sådan kommer du i gang med Grok Bot

Jeg har brugt Grok Bot til at bygge **Kursusoversigten.dk**, et website med overblik over AI-kurser i Danmark. Agenterne hjalp med markedsresearch, kursusdata, database, indhold og selve sitet. Jeg satte retningen og godkendte det, der skulle online.

Grok Bot er xAI's løsning med AI-agenter, der kan udføre opgaver på tværs af apps, websites og filer. Arbejdet foregår på en computer i skyen, som dine agenter deler. Du giver dem en opgave gennem en samtale og følger deres arbejde derfra. [Læs xAI's introduktion til Grok Bot](https://docs.x.ai/grok-bot/overview).

Her viser jeg, hvordan du kommer i gang med en afgrænset opgave, skriver en brugbar brief og kontrollerer resultatet. Er du helt ny i generativ AI, så begynd med [Sådan kommer du i gang med generativ AI](https://learnai.nu/laer/saadan-kommer-du-i-gang-med-generativ-ai).

## Det vigtigste på ét minut

- Start med **én konkret opgave**, hvor du selv kan vurdere resultatet.
- Skriv briefen med **opgave, kontekst, materiale, krav og format**.
- Fortæl, hvad agenten må gøre selv, og hvornår den skal stoppe og spørge dig.
- Behandl det første resultat som et arbejdsudkast. Kontrollér fakta, kilder og ændringer.
- Godkend den konkrete leverance, før noget bliver publiceret eller sendt videre.
- Tilføj flere agenter, når der er en tydelig grund til at dele arbejdet op.

## Hvad Grok Bot kan hjælpe med

En AI-agent kan arbejde videre gennem flere trin af en opgave: finde materiale, bearbejde det og aflevere et resultat i et værktøj eller en fil. Med Grok Bot kan flere agenter samarbejde og bevare kontekst mellem opgaver. Ifølge xAI kan arbejdet fortsætte på cloudcomputeren, når du lukker din laptop. [Se produktbeskrivelsen](https://x.ai/bot).

Du kan eksempelvis bruge metoden til at:

- **Gennemgå indhold:** Find uklare formuleringer på fem websider, og saml forslag til rettelser.
- **Undersøge et marked:** Sammenlign udvalgte udbydere med kildelinks og tydelig markering af manglende oplysninger.
- **Strukturere data:** Saml oplysninger fra angivne kilder i en tabel med faste kolonner.
- **Bygge en mindre løsning:** Lav første version af en funktion eller et website, som efterfølgende kan testes.

På Kursusoversigten omfattede arbejdet flere af de opgaver i samme projekt. En fejl i kursusdata kunne derfor ende både i databasen og i teksten på sitet. Kontrol undervejs var nødvendig, så fejlene ikke blev ført videre til næste trin.

## Sådan kommer du i gang rent praktisk

1. Gå til [Grok Bots officielle side](https://x.ai/bot), og hent appen til din computer.
2. Log ind med din Cursor-konto. Hvis adgangen kommer fra et SuperGrok-abonnement, skal det tilknyttes som anvist i appen.
3. Opret én Bot med et kort navn, én hovedopgave og en beskrivelse af, hvordan den skal arbejde.
4. Giv den en lille opgave med offentlige kilder eller en fil, du må dele.
5. Tilslut kun de værktøjer, opgaven kræver, og gennemgå resultatet, før du udvider adgangen.

Adgang kræver et kvalificerende abonnement. Tjek de aktuelle planer og installationsvejledningen i [xAI's kom godt i gang-guide](https://docs.x.ai/grok-bot/get-started). Du behøver ikke forbinde alle dine systemer for at afprøve metoden.

## Start med et resultat, du selv forstår

Vælg en opgave, du normalt selv ville kunne løse eller rette. Så har du et grundlag for at vurdere agentens arbejde.

En konkret første opgave kan være:

> Gennemgå forsiden og om-siden på mit website. Find uklare formuleringer, og foreslå rettelser. Vis den oprindelige tekst sammen med dit forslag. Ændr ikke siderne.

På Kursusoversigten brugte jeg samme tilgang til katalogteksterne. De skulle være neutrale og konkrete, og agenten måtte ikke gætte på priser, datoer eller en kursusudbyders kvalitet. Ukendte priser og datoer skulle stå som **Ukendt**.

Det giver et resultat, du kan kontrollere: Har agenten fundet et reelt problem? Er rettelsen bedre? Holder den sig til de oplysninger, der findes?

## Skriv briefen i fem dele

En god agentbrief gør det tydeligt, hvad et færdigt resultat skal indeholde. Jeg bruger fem dele:

| Del | Det skal du beskrive |
| --- | --- |
| **Opgave** | Hvad skal agenten gøre? |
| **Kontekst** | Hvem er afsenderen, hvem er modtageren, og hvad er formålet? |
| **Materiale** | Hvilke sider, filer eller data må agenten bruge? |
| **Krav** | Hvilke regler gælder, og hvad kræver din godkendelse? |
| **Format** | Hvordan skal resultatet afleveres? |

Her er en brief-skabelon, du kan kopiere. Erstat URL-felterne med de sider, du vil have gennemgået, og tilpas kontekst og krav til dit projekt.

```text
Opgave:
Gennemgå de angivne sider, og foreslå konkrete rettelser.

Kontekst:
Siderne tilhører Kursusoversigten.dk.
Sitet skal give et neutralt overblik over AI-kurser i Danmark.
Teksterne skal hjælpe læseren med at forstå og sammenligne tilbuddene.

Materiale:
- [URL 1]
- [URL 2]
- [URL 3]

Krav:
- Brug kun oplysninger fra det angivne materiale.
- Opfind ikke priser, datoer, tal eller vurderinger af udbydere.
- Markér manglende oplysninger som Ukendt.
- Skriv klart dansk med en neutral afsender.
- Bevar officielle kursustitler.
- Adskil faktuelle fejl fra sproglige forbedringer.
- Angiv URL og placering for hvert fund.
- Hvis du ikke kan åbne en side, skal du skrive det.
- Returnér kun forslag. Ændr eller publicér ikke noget.

Format:
1. Fejl der skal rettes før publicering
2. Tabel: URL | oprindelig tekst | problem | foreslået rettelse
3. Oplysninger der mangler eller skal kontrolleres
4. Anbefalet næste handling
```

Agenten får både et arbejdsgrundlag og en grænse for opgaven. Du får en rettelsesliste, hvor du kan se, hvad hvert forslag bygger på.

## Aftal, hvad AI må gøre selv

Jeg lader gerne agenten undersøge, analysere, strukturere data og skrive udkast inden for den aftalte opgave. Publicering og andre handlinger med konsekvenser kræver et særskilt ja.

Et enkelt godkendelsesprincip kan se sådan ud:

| Agenten må arbejde videre med | Agenten skal bede om godkendelse før |
| --- | --- |
| Research i de aftalte kilder | Udsendelse af mails eller beskeder |
| Udkast og forslag til rettelser | Publicering på et website |
| Bearbejdning af en arbejdskopi | Overskrivning eller sletning af originaldata |
| Kode og test i et aftalt testmiljø | Ændringer i den løsning, brugerne benytter |
| En plan for næste trin | Køb eller ændringer i adgangsrettigheder |

Bed om at se den færdige tekst, ændringsliste eller forhåndsvisning, før du godkender. Et ja til at rette tre tekster skal være afgrænset til de tre tekster.

Grok Bot har også indstillinger for automatisk vurdering af handlinger, kaldet **Auto Review**, hvor du kan angive handlinger, der skal spørges om først. Kombinér dem med begrænset adgang til dine systemer. En instruktion i samtalen er ikke i sig selv en teknisk adgangsbegrænsning. [Se xAI's vejledning om godkendelser og sikkerhed](https://docs.x.ai/grok-bot/approvals-security-and-privacy).

## Hold projekter og materiale adskilt

På LearnAI skriver jeg i min egen stemme. Kursusoversigten har en neutral katalogstemme. Det skal fremgå af briefen, så agenten ikke flytter formuleringer eller antagelser fra ét projekt til et andet.

Adgang til materialet kræver også omtanke. Dine Bots deler filer, browsersessioner og logins på den samme cloudcomputer. To agenter med forskellige navne giver derfor ikke en sikker adskillelse mellem eksempelvis privat materiale og kundedata. Del kun det materiale, opgaven kræver, og som du må bruge i tjenesten. [Læs om den delte computer](https://docs.x.ai/grok-bot/overview).

## Forbedr resultatet med præcis feedback

Når et resultat ikke fungerer, så beskriv fejlen og den ønskede rettelse. Det gør næste forsøg lettere at vurdere.

Hvis teksten er blevet for salgsorienteret:

```text
Omskriv teksten neutralt.
Bevar de dokumenterede fakta og den eksisterende struktur.
Fjern vurderinger af udbydernes kvalitet, som kilderne ikke underbygger.
Vis ændringerne, før du foretager dig andet.
```

Hvis agenten blander alvorlige fejl og smagsspørgsmål:

```text
Opdel dine fund i:
1. Fejl der skal rettes før publicering
2. Anbefalede rettelser
3. Valgfrie sproglige forbedringer

Angiv den konkrete kilde eller tekstplacering for hvert fund.
Skriv tydeligt, hvis du ikke kunne kontrollere noget.
```

På Kursusoversigten fandt en gennemgang tekniske formuleringer, der var blevet synlige for læserne, og engelske udtryk, som ikke passede til sproget på sitet. Efter rettelserne blev siderne gennemgået igen. Den anden gennemgang viste, om ændringerne faktisk var slået igennem.

## Kontrollér resultatet, før du bruger det

Sæt tid af til kontrollen allerede i briefen. Brug denne tjekliste:

- [ ] Stemmer oplysningerne med de oprindelige kilder?
- [ ] Er priser, datoer, tal og vurderinger dokumenteret eller markeret som ukendte?
- [ ] Understøtter de angivne links faktisk påstandene?
- [ ] Er betydning og forbehold bevaret under omskrivningen?
- [ ] Passer sprog og afsender til den side, hvor teksten skal bruges?
- [ ] Er interne noter og tekniske oplysninger fjernet fra det offentlige indhold?
- [ ] Er ændringerne afgrænset til det, jeg bad om?
- [ ] Er eventuelle fejl og ufærdige dele gjort tydelige?
- [ ] Kan jeg forklare og stå inde for resultatet?

Ved research åbner du de vigtigste kilder. Ved ændringer på et website ser du selv siderne og prøver de berørte funktioner. Ved kodeændringer skal løsningen testes af dig eller en person med de nødvendige kompetencer.

Agentens besked om, at arbejdet er færdigt, er et godt tidspunkt at begynde kontrollen.

## Casen: sådan brugte jeg Grok Bot til Kursusoversigten

Med [Kursusoversigten.dk](https://kursusoversigten.dk) ville jeg afprøve, hvor stor en del af arbejdet med et digitalt produkt et agenthold kunne udføre. Målet var et selvstændigt katalog over AI-kurser i Danmark med research, data, indhold og et fungerende website.

Jeg satte retningen, håndterede konti og domæne og beholdt godkendelsen af det, der skulle online. Agenterne arbejdede gennem denne kæde:

**Marked → kursusdata → database → indhold → website → publicering.**

| Del af arbejdet | Det blev der arbejdet med |
| --- | --- |
| Markedsresearch | Overblik over AI-kurser og udbydere i Danmark |
| Data | Indsamling og strukturering af kursusoplysninger fra offentlige kilder |
| Database | Et kursuskatalog i Supabase |
| Website | En første version bygget med Astro |
| Indhold | Katalogtekster, artikler og henvisninger til LearnAI |
| Publicering | Koden i GitHub og sitet udgivet via Vercel |

Da første version var online, fortsatte arbejdet med indholdskontrol, rettelser og synlighed i søgemaskiner. Her blev kvaliteten af briefen afgørende.

Kataloget skulle beskrive, hvad en udbyder **tilbyder**, uden udokumenterede vurderinger af, hvad udbyderen er særligt god til. Priser og datoer måtte ikke opfindes. LearnAI's personlige jeg-stemme skulle heller ikke flytte ind i katalogteksterne.

En redaktionel gennemgang fandt blandt andet intern teknisk tekst i en artikel og engelsk markedsføringssprog i sidefoden. Derudover blev udtryk som *Outcome*, *self-paced* og *use cases* rettet til *Resultat*, *i eget tempo* og *anvendelser*, hvor de indgik i den almindelige brødtekst. Officielle kursustitler skulle bevares.

Efter rettelserne fulgte en ny kontrol af de offentlige sider. Den arbejdsgang gav mig en konkret liste at tage stilling til og mulighed for at se, om problemerne var løst.

Casen viser, hvordan flere opgaver kan hænge sammen i ét forløb. Den siger ikke, hvor hurtigt dit projekt kan bygges. Omfang, adgang til systemer og behovet for rettelser vil variere.

## Hvornår giver flere agenter mening?

Begynd med én ansvarlig agent. Tilføj en specialist, når du kan beskrive en selvstændig opgave og dens leverance.

En researchagent kan eksempelvis aflevere en tabel med kilder og usikre oplysninger. En indholdsagent kan derefter skrive ud fra de kontrollerede data, mens en udviklingsagent arbejder med sitet. Aftal, hvem der samler resultatet, og hvilke beslutninger der fortsat ligger hos dig.

I mit arbejde med Kursusoversigten blev specialister koblet på efter behov, blandt andet til indhold og søgesynlighed. Den opdeling giver først værdi, når ansvaret er tydeligt nok til, at agenterne ikke retter i det samme på modstridende måder.

## Din første øvelse på 20 minutter

Vælg én side eller en kort tekst, du kender godt. Øvelsen forudsætter, at Grok Bot er sat op. De 20 minutter er en ramme for dit eget arbejde; agentens behandling kan tage ekstra tid.

### Minut 0–5: vælg opgaven

Find en forside, om-side eller artikel. Beskriv, hvad læseren skal forstå, og hvilke problemer du vil have agenten til at lede efter. Bed kun om forslag.

### Minut 5–10: skriv briefen

Brug de fem dele: **opgave, kontekst, materiale, krav og format**. Send briefen med et link eller den relevante tekst. Vent på resultatet, før du fortsætter.

### Minut 10–15: kontrollér resultatet

Sammenhold forslagene med originalen. Find mindst ét punkt, du vil kontrollere nærmere eller gøre mere præcist. Det kan være en ændret betydning, en udokumenteret påstand eller en formulering, der ikke passer til modtageren.

### Minut 15–20: giv feedback og gem briefen

Send en præcis opfølgning, og gem den brief, der gav det bedste resultat. Notér, hvor meget du selv måtte rette, og om opgaven samlet set blev lettere.

Gentag på et par lignende sider, hvis forsøget virkede. Du har nu et grundlag for at vurdere, om arbejdsgangen er værd at genbruge.

## En enkel plan for den første uge

Brug den samme opgavetype flere gange, så du kan sammenligne resultaterne.

| Dag | Opgave |
| --- | --- |
| **Mandag** | Lav 20-minuttersøvelsen på én side. |
| **Tirsdag** | Sammenlign agentens forslag med din egen gennemlæsning. |
| **Onsdag** | Tilføj de krav, der manglede, og prøv briefen på en lignende side. |
| **Torsdag** | Vurdér den rettede tekst uden først at læse agentens forklaring. Få gerne en kollega til at gøre det samme. |
| **Fredag** | Beslut, om briefen skal gemmes, ændres eller kasseres. Vurdér tidsforbrug og kvalitet samlet. |

Når resultaterne er stabile, kan du udvide til flere sider eller lade agenten udføre et ekstra trin. Behold de samme kontrolpunkter, så du kan opdage, hvis kvaliteten falder.

## Ofte stillede spørgsmål

### Skal jeg kunne kode for at bruge Grok Bot?

Nej. Du kan begynde med research, analyse og tekst. Hvis agenten bygger en teknisk løsning, skal du eller en anden kunne kontrollere, at den fungerer som ønsket.

### Hvad er forskellen på Grok Bot og almindelig AI-chat?

I en almindelig chat beder du typisk om et svar eller et udkast. Grok Bot er indrettet til at udføre opgaver i værktøjer og arbejde videre gennem flere trin. Andre AI-tjenester har også agentfunktioner; forskellen er derfor især den arbejdsgang og adgang, du vælger at bruge.

### Skal jeg starte med flere agenter?

Nej. Én agent og en tydelig brief er nok til det første forsøg. Tilføj flere, når opgaven kan opdeles i klart forskellige ansvarsområder.

### Kan jeg stole på Grok Bots research?

Brug den som et arbejdsgrundlag. Kontrollér centrale oplysninger i de oprindelige kilder, især når de skal publiceres eller bruges til en beslutning. Et link i svaret er ikke nok; siden skal understøtte påstanden.

### Hvor detaljeret skal min brief være?

Den skal beskrive opgaven, konteksten, materialet, kravene og afleveringen. Start kort, og tilføj de regler, du savner i resultatet. Konkrete eksempler på ønsket sprog kan være mere nyttige end lange rollebeskrivelser.

### Hvornår må agenten publicere?

I metoden her kræver publicering dit udtrykkelige ja til den konkrete ændring. Bed først om et udkast eller en forhåndsvisning, og kontrollér, hvor ændringen skal udgives.

### Hvad koster Grok Bot?

Adgang og forbrug afhænger af abonnementet. Se de [aktuelle planer på Grok Bots officielle side](https://x.ai/bot), og kontrollér både inkluderet forbrug og vilkår for ekstra brug, før du sætter længere opgaver i gang.
