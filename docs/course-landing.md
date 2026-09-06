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

## Stil

`src/styles/course-landing.css` er scoped til `.course-landing`, så den
redaktionelle workbook-stil ikke påvirker resten af sitet. Udkastets `draft-`
præfiks er omdøbt til `landing-`, og reglerne for dets eget header, footer og
banner er fjernet — den del leverer `SiteLayout` nu.

## Rettet undervejs

Forsiden angav 55 minutter, mens kursusindholdet summerer til 60. Udkastets
dokumentation fangede uoverensstemmelsen; `FeaturedCourses.astro` siger nu 60.
