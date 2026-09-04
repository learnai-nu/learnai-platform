# Sitets header: sprog, søgning og profil

Tre elementer i headeren er hentet fra det gamle learnai.nu: en sprogvælger,
søgning og en synlig indikation af, at man er logget ind.

## Sprogvælger

`LanguageSwitcher.astro` vises kun, når siden faktisk har en oversættelse.
`SiteLayout` modtager i forvejen `alternates` for at kunne skrive
`hreflang`-tags, og de samme data driver vælgeren. I dag betyder det, at den
optræder på de otte katalogsider (`/tools`, `/use-cases`, `/resources`,
`/events` og deres `/en`-modstykker).

Alternativet — en global vælger på alle sider — ville sende besøgende til
sider, der ikke findes på engelsk. Når mere indhold bliver tosproget, udvides
vælgeren automatisk ved at give de pågældende sider `alternates`.

## Søgning

`/search` søger på tværs af `content_items`, `tools`, `use_cases`, `resources`
og `events` og grupperer resultaterne. Headerens to søgefelter (desktop og
mobil) peger begge herpå.

Siden er en almindelig GET-formular og virker uden JavaScript. Søgestrengen
begrænses til 120 tegn, og `%`, `_` og `\` escapes, før den sendes til
PostgREST — ellers kunne et søgeord udvide sit eget ILIKE-mønster. Siden er
`noindex`, da søgeresultater ikke hører hjemme i indekset.

Bemærk at `/laer?q=` fortsat filtrerer vidensbiblioteket. Det er en
sektionsfiltrering, ikke en søgning på tværs af sitet.

## Logget ind

Headeren vises på både prerenderede og server-renderede sider, så sessionen
kan ikke afgøres på serveren i alle tilfælde. `header-account.ts` løser den
derfor i browseren med `createBrowserSupabaseClient` og udskifter "Log ind"
med brugerens navn plus en menu til dashboard, læringsprofil og log ud.

Navnet er `profiles.display_name`, når det findes, ellers den lokale del af
e-mailen. Uden JavaScript bliver "Log ind"-linket stående — hvilket stadig er
korrekt, fordi `/login` sender en allerede logget ind bruger videre til
dashboardet.
