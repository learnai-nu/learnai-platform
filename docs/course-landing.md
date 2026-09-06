# Landingsside for det gratis kursus

`/kurser/ai-i-praksis` er salgssiden for introkurset. Den er en videreførelse
af designudkastet fra branchen `feat/course-landing-draft`, re-platformet til
resten af sitet.

## Forholdet til kursussiden

To sider, to formål:

- `/kurser/ai-i-praksis` er for den, der ikke har besluttet sig endnu. Den
  viser opgaven, udbyttet, programmet og en kort øvelse, man kan prøve uden at
  oprette en profil.
- `/kurser/ai-i-praksis-dit-foerste-kursus` er selve kursusoplevelsen med
  moduler, lektioner og progression.

Landingssidens handlinger fører til kursussiden eller direkte til første
lektion. Menupunktet "Gratis AI-kursus" peger på landingssiden; de øvrige
"Start gratis"-knapper på sitet peger stadig direkte på kurset, så en bruger,
der allerede er i gang, ikke bliver sendt til en salgsside.

## Data

Lektioner, moduler og tider hentes fra Supabase for sluggen
`ai-i-praksis-dit-foerste-kursus` — samme kilde som kursussiden, gennem de
samme `course-overrides`. Udkastet havde lektionerne hårdkodet i to arrays;
det ville betyde to steder at rette, hver gang kurset ændrer sig.

Kan indholdet ikke hentes, vises en besked i programafsnittet, mens resten af
siden står. FAQ og de tre læringsudbytter er redaktionel tekst og bliver i
koden.

## Øvelsen

Den korte øvelse i dialogen er en smagsprøve på lektion 1: læs en fiktiv
mailtråd, se en brugbar prompt, kontrollér et forberedt svar. Den sender intet
til en AI-tjeneste, og prompten kan redigeres uden at svaret ændrer sig —
derfor er svaret udtrykkeligt mærket "forberedt eksempel". Dialogen lukkes med
Escape, med lukkeknappen eller ved klik udenfor, og fokus føres tilbage til
den knap, der åbnede den.

Uden JavaScript kan siden læses i sin helhed; kun øvelsen og skiftet mellem
mailtråd og overblik er utilgængelige.

## Konverteringsvalg

Nogle af sidens valg er truffet efter en UX-gennemgang og er værd at kende,
før de bliver lavet om:

- **To synlige handlinger i heroen.** "Prøv første øvelse" er primær, fordi
  barrieren for et gratis kursus er indsats, ikke pris. "Start kurset" er
  sekundær, men en rigtig knap — som tekstlink var den for svær at få øje på.
- **Øvelsen fører videre uanset svar.** Den, der svarer forkert på
  kontrolspørgsmålet, har lige demonstreret, at metoden er ny for hende. Hun
  er den bedst kvalificerede læser og skal ikke stå i en blindgyde. Teksten
  på linket ændrer sig, ikke om det vises.
- **Afsnit 03 beskriver udbytte, ikke tilmelding.** Det beskrev før trinnene
  "opret profil → bekræft e-mail → start", altså friktion præsenteret som
  feature, umiddelbart efter et løfte om at kunne gå i gang med det samme.
- **Fanerne over eksemplet er unummererede.** De hed "01 Mailtråden" og
  "02 Overblikket", men siden åbner på overblikket. Numre lover en
  rækkefølge, som standardvisningen brød.
- **På mobil står niveau, tid og omfang før knapperne**, så de kan læses inden
  beslutningen.

Siden har bevidst ingen social proof: hverken tal, udtalelser eller logoer.
Det følger udkastets princip om ikke at fremsætte udokumenterede påstande.
Konverteringsmæssigt er det et hul, og den billigste ærlige udfyldning er en
afsender — hvem der har lavet kurset.

## Stil

`src/styles/course-landing.css` er scoped til `.course-landing`, så den
redaktionelle workbook-stil ikke påvirker resten af sitet. Udkastets `draft-`
præfiks er omdøbt til `landing-`, og reglerne for dets eget header, footer og
banner er fjernet — den del leverer `SiteLayout` nu.

## Rettet undervejs

Forsiden angav 55 minutter, mens kursusindholdet summerer til 60. Udkastets
dokumentation fangede uoverensstemmelsen; `FeaturedCourses.astro` siger nu 60.
