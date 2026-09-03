# SEO-schema på LearnAI.nu

LearnAI bruger ét server-renderet JSON-LD-graph pr. indekserbar side. Grafen bygges i
`src/lib/seo/schema.ts` og gengives af `src/components/seo/JsonLd.astro` gennem
`SiteLayout.astro`.

## Sidetyper

| Side | Schema |
| --- | --- |
| Alle offentlige sider | `Organization`, `WebSite`, `WebPage` eller en mere specifik sidevariant |
| Underliggende offentlige sider | `BreadcrumbList` |
| `/laer` og `/kurser` | `CollectionPage`, `ItemList` |
| Artikler og guides | `Article` |
| Nyheder | `NewsArticle` |
| Kursussider | `Course` og dokumenteret `Offer` når en pris findes |
| Lektioner | `LearningResource` med reference til kurset |
| Arbejdskompasset | `LearningResource` med typen `self-assessment` |
| Login, dashboard, mentor og admin | `noindex`; ingen JSON-LD |

Prompts og værktøjsartikler får med vilje ikke `Article`, `SoftwareApplication`, rating-
eller review-schema uden data, der dokumenterer den type på den synlige side. FAQ-schema
må først tilføjes, når de samme spørgsmål og svar er synlige for besøgende.

## Datakvalitet

- Canonical-URL'er er absolutte, fri for query-parametre og uden afsluttende skråstreg,
  bortset fra forsiden.
- Faste `@id`-værdier forbinder organisation, website, side, brødkrummer og hovedindhold.
- JSON-LD serialiseres med neutralisering af HTML-kontroltegn, så CMS-indhold ikke kan
  afslutte script-elementet.
- Organisationen bruger kun det synlige navn `LearnAI.nu` og domænet. Juridisk navn,
  logo og sociale profiler er udeladt, indtil de kan dokumenteres med autoritative data.

## Validering efter preview-deploy

Kontrollér mindst én URL fra hver dynamisk sidetype i både
[Schema.org Validator](https://validator.schema.org/) og
[Google Rich Results Test](https://search.google.com/test/rich-results). Bekræft også,
at JSON-LD-værdierne svarer til det synlige indhold og den aktuelle pris.
