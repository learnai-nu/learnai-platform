# /virksomheder som leadmotor

Siden er bygget til ét formål: at få en virksomhed til at skrive. Alt andet på
siden findes for at fjerne tvivl inden det klik.

## Sådan hænger det sammen

| Del | Fil |
| --- | --- |
| Landingsside | `src/pages/virksomheder.astro` |
| Styling | `src/styles/business-landing.css` |
| Formularkontrakt | `src/lib/leads/business.ts` |
| Modtager | `src/pages/api/leads/virksomheder.ts` |
| Database | `supabase/migrations/20260906090000_business_leads.sql` |
| Administration | `src/pages/admin/leads/index.astro`, `src/pages/api/admin/leads/status.ts` |

Siden lå tidligere som en tom placeholder i `src/pages/[slug].astro`. Den er
fjernet derfra, så `/virksomheder` nu er sin egen rute.

## Sidens opbygning

1. **Hero** — påstanden, to veje videre (skriv nu, eller prøv det gratis kursus først).
2. **Problem** — tre genkendelige situationer, så læseren kan se sig selv.
3. **Forløb** — afklaring, kompetenceløft, forankring.
4. **Leverancer** — hvad der bliver tilbage i organisationen.
5. **Afsender** — Jesper Schneider, plus tal på det publicerede indhold i LearnAI.
6. **FAQ** — de indvendinger, der ellers stopper en henvendelse (pris, GDPR, værktøjer).
7. **Formular** — den eneste konvertering på siden.

Tallene i afsender-sektionen tælles ved hvert kald fra `tools`, `use_cases` og
`resources` (kun publicerede, danske rækker). Fejler forespørgslen, skjules
tallene i stedet for at vise nuller.

## Formularen

Påkrævet: navn, arbejdsmail, virksomhed og samtykke. Valgfrit: rolle, antal
medarbejdere og en fritekst om, hvad de vil opnå. `website` er en honeypot —
udfyldt felt afviser indsendelsen.

Endpointet kræver samme origin, validerer med zod og redirecter tilbage til
`/virksomheder?status=…#kontakt`. Statusserne er `success`, `invalid` og
`save-error`.

Der sendes **ingen mail** ved en ny henvendelse. Leads skal aflæses i
administrationen. Vil du have notifikationer, er `RESEND_API_KEY` allerede
afsat i `.env.example`, men afsendelsen er ikke bygget.

## Autorisation

Leads er persondata, og RLS er grænsen:

- `anon` og `authenticated` må **kun** indsætte, og kun i de kolonner formularen udfylder.
- Læsning kræver `private.is_admin()` — altså rollen `admin`. Redaktører ser
  ikke leads, selv om de har adgang til resten af CMS'et.
- `status` og `internal_note` kan kun ændres af administratorer.

Både siden `/admin/leads` og endpointet til statusskift afviser rollen `editor`
eksplicit, så adgangen fejler ens i databasen og i applikationen.

Migrationen opretter selv `private`-skemaet. Ingen tidligere migration gør det
— de antog, at det fandtes — så et projekt, der ikke har kørt dem alle, fejler
ellers med `3F000: schema "private" does not exist`. `anon` har ingen adgang til
skemaet; `authenticated` har kun `usage`, så politikkerne kan kalde funktionen.

## Indholdet er et udkast

Teksten om Jesper bygger på det, han selv har oplyst: rollen i TEKNIQ
Arbejdsgiverne, ansvaret for AI-strategi, tale-til-tekst, chatbots og
AI-ambassadørkorpset, samt 16+ år i digitalt salg og marketing. Der er
bevidst **ingen** kundenavne, tal på resultater eller udtalelser på siden —
de skal tilføjes, når der findes referencer, der må nævnes ved navn.
