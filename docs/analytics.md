# Analytics på LearnAI.nu

LearnAI bruger Vercel Web Analytics til trafik og anonyme produkthændelser,
Vercel Speed Insights til Core Web Vitals og Microsoft Clarity til heatmaps og
sessionsoptagelser. Alle tre indlæses fra `SiteLayout.astro` og styres af
`analytics`-propen, så adminområdet slår dem eksplicit fra.

## Microsoft Clarity

Clarity initialiseres i `src/scripts/clarity.ts` via pakken `@microsoft/clarity`.
Scriptet kører kun, når `PUBLIC_CLARITY_PROJECT_ID` er sat, så lokal udvikling og
previews er uden måling, medmindre variablen tilføjes bevidst. Projekt-id'et er
ikke en hemmelighed og må gerne ligge i en `PUBLIC_`-variabel — sæt den i Vercel
for de miljøer, der skal måles.

Til forskel fra Vercel Analytics sætter Clarity cookies og optager anonymiserede
sessioner. Masking af indtastet tekst styres i Clarity-dashboardet — hold den på
standardniveau eller strammere. Brug `Clarity.event()` og `Clarity.setTag()` med
samme privacy-regler som nedenfor, hvis der senere skal sendes signaler til Clarity.

## Cookiesamtykke

Clarity kører kun med cookies efter et aktivt ja. Logikken ligger i
`src/lib/analytics/consent.ts`, banneret i
`src/components/marketing/CookieConsent.astro`:

- Uden gemt valg starter Clarity med `consentV2({ ad_Storage: 'denied', analytics_Storage: 'denied' })`.
- Banneret vises kun, når der ikke findes et valg i `localStorage`
  (`learnai:consent:clarity:v1`). Valget gemmes lokalt og sendes aldrig til serveren.
- Et klik udsender `learnai:consent-change`, som `src/scripts/clarity.ts` lytter på,
  så samtykket slår igennem uden genindlæsning.
- `ad_Storage` er altid `denied` — LearnAI bruger ikke Clarity til annoncering.
- Samtykket kan trækkes tilbage fra footerens "Cookieindstillinger" og fra
  `/privatliv`; begge bruger `data-consent-reopen`.

Vercel Analytics og Speed Insights er cookie-fri og kører derfor uanset valget.

## Aktivering i Vercel

Efter deploy skal **Web Analytics** og **Speed Insights** aktiveres for projektet
i Vercel-dashboardet. Pageviews og performance-data virker på alle Vercel-planer
inden for planens kvoter. Custom events kræver Pro eller Enterprise.

## Eventkontrakt

| Event | Udløses når | Tilladte properties |
| --- | --- | --- |
| `course_cta_clicked` | En central kursusknap aktiveres | `source`, `detail` |
| `course_exercise_started` | Prøveøvelsen åbnes | `source` |
| `course_exercise_completed` | Kontrolspørgsmålet besvares | `result` |
| `work_compass_completed` | Alle 12 spørgsmål er besvaret | `locale` |
| `ai_mentor_answered` | Et valideret mentorsvar vises | `has_sources` |
| `lesson_completed` | En lektion er gemt som gennemført | `source` |
| `business_contact_opened` | Kontaktsektionen åbnes fra heroen | `source` |
| `business_lead_submitted` | Et lead er gemt og successiden vises | `source` |

Eventnavne defineres centralt i `src/lib/analytics/events.ts`. Almindelige klik
måles via `data-analytics-*` og `src/scripts/analytics.ts`. Bekræftede events efter
redirect måles kun én gang pr. browsersession for at undgå dobbeltregistrering
ved genindlæsning.

## Privacy-regler

- Send aldrig navn, e-mail, virksomhed, fritekst, mentor-spørgsmål eller svar.
- Send aldrig bruger-id, kursist-id eller andre persistente identifikatorer.
- Properties må kun beskrive placering, funktion eller et groft anonymt udfald.
- Hold events på højst to properties, så kontrakten også passer til Vercel Pro.
- Nye events skal tilføjes i kontrakten og dækkes af tests før deploy.

Arbejdskompasset gemmer fortsat hverken svar eller resultat. Analytics registrerer
kun, at kompasset blev gennemført, og hvilket sprog brugerfladen stod på.

## Første målepunkter

1. Trafik til `/`, `/kurser/ai-i-praksis` og `/virksomheder`.
2. Andel kursusklik pr. placering på siden.
3. Andel startede prøveøvelser, der gennemføres.
4. Antal gennemførte lektioner, arbejdskompasser og mentorsvar.
5. Antal åbninger af kontaktsektionen og bekræftede leads.
6. LCP, INP og CLS på de vigtigste offentlige landingssider.
