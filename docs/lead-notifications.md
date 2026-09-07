# Notifikationer om virksomhedsleads

Når formularen på `/virksomheder` er valideret og leadet er gemt i Supabase,
sender serveren en intern notifikation gennem Resend. Mailfejl ændrer ikke
formularens successvar: leadet findes stadig i `/admin/leads`, og fejlen kan ses
i Vercels serverlogs.

## Opsætning i Vercel

1. Installér Resend-integrationen på LearnAI-projektet i Vercel Marketplace.
2. Verificér afsenderdomænet i Resend med de viste SPF- og DKIM-poster.
3. Opret følgende miljøvariabler for Production og Preview efter behov:

| Variabel | Eksempel | Formål |
| --- | --- | --- |
| `RESEND_API_KEY` | Oprettes af integrationen | Servernøgle til Resend |
| `LEAD_NOTIFICATION_FROM` | `LearnAI.nu <leads@learnai.nu>` | Verificeret afsender |
| `LEAD_NOTIFICATION_TO` | Den interne modtagermail | En eller flere kommaseparerede modtagere |
| `PUBLIC_SITE_URL` | `https://learnai.nu` | Link til `/admin/leads` i mailen |

Variablerne uden `PUBLIC_` må kun anvendes på serveren. API-nøglen må aldrig
skrives ind i kodebasen eller eksponeres i browseren.

## Drift og fejlhåndtering

- Notifikationen sendes først, når Supabase-insert er lykkedes.
- Resend-fejl logges uden navn, mailadresse eller anden leadtekst.
- Hvert normaliseret formularindhold hashes til en idempotency key, så den samme
  notifikation ikke sendes flere gange inden for Resends deduplikeringsvindue.
- Mailen indeholder et tekstformat og et HTML-format. Alt brugerindhold escapes.
- `Reply-To` sættes til leadets validerede arbejdsmail.

Efter opsætning testes flowet med en tydeligt markeret intern testhenvendelse.
Kontrollér både maillevering, `/admin/leads` og Vercels serverlogs.
