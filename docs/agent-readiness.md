# Agent-parathed

Hvordan LearnAI.nu ser ud for en AI-agent, og hvor de enkelte dele bor.
Baggrund: Is Agentic-audit af learnai.nu (score 74/100 før dette arbejde).

## Indhold i Markdown (acceptmarkdown.com)

`src/middleware.ts` forhandler på Accept-headeren:

- `Accept: text/markdown` (eller `text/x-markdown`) på en offentlig side giver
  `Content-Type: text/markdown; charset=utf-8`.
- Samme indhold kan hentes ved at tilføje `.md` til stien (`/laer/<slug>.md`,
  `/index.md` for forsiden).
- Alle forhandlede svar sender `Vary: Accept, Accept-Encoding`, så et CDN ikke
  kan servere HTML-varianten til en agent, der bad om Markdown.
- HTML-svar får desuden `Link`-headere til `/llms.txt` og til sidens
  Markdown-variant, og `<link rel="alternate" type="text/markdown">` i `<head>`.

Markdown-udgaverne bygges i `src/lib/agents/markdown-resources.ts`:
forsiden, `/agenter` og tillidssiderne fra kode, mens `/laer`, `/laer/<slug>`,
`/kurser` og `/kurser/<slug>` hentes fra Supabase. Artikler serveres fra deres
egen Markdown-kilde (`content_items.body.markdown`) — ikke konverteret HTML.

`/api/`, `/auth/`, `/admin`, `/dashboard` og `/login` forhandler aldrig.

### Prærendering

Forsiden, `/om`, `/kontakt`, `/privatliv` og `/agenter` er `prerender = false`.
Prærenderede ruter serveres som statiske filer på Vercel og rammer aldrig
middleware, så de ville ikke kunne forhandle. Til gengæld sætter siderne selv
`Cache-Control: public, s-maxage=600, stale-while-revalidate=86400`, så de
stadig ligger på edge — nu bare med en variant pr. Accept-header.

## 404

`src/pages/404.astro` giver rigtig HTTP 404 med genveje til sitemap, llms.txt,
læringsbiblioteket og kurserne. Klienter, der ikke beder om HTML (fx `curl` med
`*/*`), får i stedet en kort Markdown-krop med de samme links.

## llms.txt og /agenter

`src/pages/llms.txt.ts` følger llmstxt.org-formatet: H1, blockquote-resumé,
prose og `##`-sektioner med Markdown-links. Sektionen «Hvornår du skal bruge
LearnAI.nu» er den vigtigste — den siger, hvilke opgaver siden er den rigtige
kilde til, og «Hvornår du skal bruge en anden kilde» siger, hvor den ikke er.
Teksten bor ét sted, `src/lib/agents/guide.ts`, og bruges også af `/agenter`
(alias: `/developers`, `/agents`) og af Markdown-udgaverne.

## Tillidssider

`/om`, `/kontakt` og `/privatliv` har hver mere end 500 tegn reelt indhold.
Teksten er struktureret data i `src/lib/content/site-pages.ts`, som både
`SitePageContent.astro` og Markdown-udgaven læser, så de aldrig kan skride fra
hinanden.

## Metadata og struktureret data

- Hver side har `canonical`, `html lang`, `og:type` og `og:image`.
  Standardbilledet er `public/og-default.png` (1200×630); det genereres fra
  `scripts/og-default.template.html` med en headless Chromium
  (`chrome --headless --screenshot --window-size=1200,630`).
- `Organization`-noden i `src/lib/seo/schema.ts` har `contactPoint`
  (support og salg) og `address` (`PostalAddress`), plus `email`, `sameAs` og
  `foundingDate`. Værdierne bor i `siteOrganisation` i
  `src/lib/navigation/site-nav.ts`.

## Verifikation

```
curl -s -o /dev/null -w "%{http_code}\n" https://learnai.nu/findes-ikke        # 404
curl -sI -H "Accept: text/markdown" https://learnai.nu/ | grep -i -e content-type -e vary
curl -s https://learnai.nu/llms.txt | head
curl -s -o /dev/null -w "%{http_code}\n" https://learnai.nu/om.md
```

Kontrakterne er dækket af `tests/agent-readiness.test.ts`.
