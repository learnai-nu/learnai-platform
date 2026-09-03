# AI i praksis – lokalt landingpage-udkast

Dansk kursuslandingpage udarbejdet 3. september 2026 med samarbejdende UX- og frontenddesign-roller. Ingen personlige agentprofiler blev fundet i projektets tilgængelige instruktioner eller agentfiler.

Revision 02 er efterfølgende forbedret med brugerens nye personlige `frontend-designer`-skill. Den bruger en mere kompakt hero, et interaktivt skift mellem fiktiv mail og forberedt overblik, større brødtekst, mobilmenu og en synlig inddeling i tre kursusmoduler. Den tidligere svævende gule note er erstattet af en fast note under eksemplet, så dekoration ikke konkurrerer med indholdet. [Før, desktop](before-desktop.png) og [før, mobil](before-mobile.png) er bevaret til sammenligning.

## Åbn og vurder

- [Samlet review med desktop-/mobilskift](http://localhost:4321/udkast/)
- [Landingpage i fuld bredde](http://localhost:4321/udkast/ai-i-praksis)

Den eksisterende Astro-server på port 4321 kan bruges. Hvis den senere er stoppet, køres `pnpm dev --background` fra repositoryets rod, som angivet i `AGENTS.md`.

Prøv den første øvelse, åbn lektionerne og FAQ, og skift reviewvisningen til mobil. Prøveøvelsen viser lokalt eksempelindhold; den sender ikke data til AI eller opretter en konto.

## Designvalg

1. **Vis opgaven.** Mailtråd, prompt og overblik gør kursusindholdet konkret fra første skærm. Læringsudbytter og et program med tider gør tilbuddet let at vurdere.
2. **Byg videre på LearnAI.** Aktuelle workbook-styles, lokal Inter, lyse papirflader, mørk typografi, blå knapper og gule noter danner retningen.
3. **Giv et tydeligt næste skridt.** Den primære handling åbner en lille øvelse. Tilmeldingsforløbet beskrives som et forslag; fungerende login er ikke en forudsætning for at vurdere udkastet.
4. **Tilpas indholdet til mobil.** Den primære handling kommer tidligt, programmet kan foldes ud, og demoen skal kunne bruges i en smal visning og med tastatur.

## Kilder og antagelser

Udgangspunktet er det gratis begynderkursus med sluggen `ai-i-praksis-dit-foerste-kursus`. Det er en antagelse om, hvilket kursus der ønskes en landingpage til.

Den nyeste lokale kursusmigration angiver **60 minutter, 6 lektioner og 3 moduler**. Forsidens 55 minutter er ældre og bruges derfor ikke i udkastet. Seneste lange titel er “AI i praksis – din første AI-gevinst på 60 minutter”; udkastet bruger det korte kursusnavn og en redaktionel overskrift.

Se [UX og kildegrundlag](../../docs/course-landing-ux.md) for præcise kilder, målgruppe, læringsudbytter, foreslået tilmelding, FAQ og agenternes review. Kilderne er repositoryets indhold; produktionsdatabasen er ikke aflæst.

## Omfang

Prototyperne ligger på isolerede `/udkast/`-ruter og har `noindex, nofollow`. De kræver ikke databaseadgang. Forsiden, login, betaling, miljøvariabler og produktionsdata er ikke ændret. Udkastet er ikke publiceret. Ruterne er almindelige Astro-filer og vil indgå i et fremtidigt build, hvis de beholdes; `noindex` er en søgemaskineinstruks og ikke en adgangsbegrænsning.

## Kontrolleret

- `pnpm check`: 90 filer, 0 fejl, 0 advarsler og 0 hints.
- Lokal browserkontrol med Playwright og installeret Edge: HTTP 200, ingen JavaScript-fejl eller fejlede requests.
- Layout ved 1440, 768, 390 og 320 px: ingen vandret scroll eller elementer uden for viewporten. Desktop- og mobilbillederne er visuelt gennemgået.
- Øvelsens tre trin, redigering/kopiering af prompt, manglende/forkert/korrekt quizsvar, afslutning, Escape og fokusretur kontrolleret. Lukkeknappen forbliver synlig ved scroll i dialogen.
- Kursusprogram, FAQ, interne links og desktop-/mobilskift i reviewvisningen afprøvet. Øvelsen virker også inde i mobilpreviewet.
- Revision 02: skift mellem mail og overblik, mobilmenuens links, lukning, start af øvelse fra menuen og fokus til den valgte sektion er kontrolleret. Browserens standardadfærd ved fragmentlinks overtog først fokus; mobilmenuen håndterer nu fragment, scrolling og fokus samlet, mens modificerede klik bevarer standardadfærden.
- Ingen ikke-GET-netværkskald under demoens forløb. Ingen konto, e-mail eller AI-generering udføres.

Visuelle filer: [desktop](desktop.png), [mobil](mobile.png), [hele desktopsiden](desktop-full.png) og [hele mobilsiden](mobile-full.png). Agenternes gensidige indholds- og designreview er dokumenteret i UX-noten.
