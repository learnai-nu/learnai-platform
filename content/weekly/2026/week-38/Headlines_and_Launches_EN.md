# The week the slowdown got a signature

**Standfirst:** Anthropic put money and people behind Amodei's pacing plan, OpenAI shipped a legal edition of GPT-6 Astra, and DeepSeek moved its API traffic onto an open 552B model.

> **In brief**
> - On 18 September, Anthropic and Accenture each committed at least $1 billion over five years to embedded, independent model evaluators.
> - OpenAI launched Astra for Law on 17 September — a GPT-6 Astra configuration for legal work with its own search index and 26 partner plugins.
> - DeepSeek routed its V4-Pro API traffic onto the open 552-billion-parameter V4.1-Flash on 14 September.
> - Anthropic published a measurement framework on 17 September showing Claude leads 26% of the work that builds the next Claude.
> - OpenAI confirmed on 15 September that the three largest labs have been negotiating a FINRA-style standards body for weeks.

## Contents

- [Anthropic puts Accenture inside the engine room](#anthropic-puts-accenture-inside-the-engine-room)
- [OpenAI opens the legal vertical for Astra](#openai-opens-the-legal-vertical-for-astra)
- [DeepSeek makes the small model the default](#deepseek-makes-the-small-model-the-default)
- [Anthropic quantifies how much AI builds AI](#anthropic-quantifies-how-much-ai-builds-ai)
- [A standards body takes shape behind closed doors](#a-standards-body-takes-shape-behind-closed-doors)

## Anthropic puts Accenture inside the engine room

On 18 September, Anthropic and Accenture announced that each expects to invest at least $1 billion over the next five years in third-party evaluation of AI models. Accenture's specialist AI business, Faculty, will lead the work, and the embedded evaluators get access inside Anthropic comparable to an employee's.

The agreement covers evaluating and red-teaming models, running alignment assessments, and testing the models' built-in safeguards. Anthropic stresses that the arrangement is non-exclusive: the company is also in dialogue with METR and other nonprofit evaluators about piloting the same embedded model.

This is the first time a major model provider has bought its own critic in on a permanent basis and paid for it. The deal is the first concrete step in the three-part plan Anthropic CEO Dario Amodei set out in his 12 September essay, "We Must Pace the Frontier".

## OpenAI opens the legal vertical for Astra

On 17 September, OpenAI launched Astra for Law — not a new model, but a configuration of GPT-6 Astra built for legal analysis and writing. The package pairs the model with instructions for legal work, settings tuned for thoroughness, and a new Legal Search Index.

It rolls out through Trusted Access in ChatGPT and Codex to selected law firms and technology vendors. Twenty-six partner-built plugins shipped on day one, connecting ChatGPT to tools such as Relativity, Clio, iManage and DeepJudge. Thomson Reuters is bringing HighQ matter context into ChatGPT and previewing a connector for CoCounsel Legal. ChatGPT for Word reached general availability the same day.

The pattern is worth noting: vertical competition is no longer about raw model strength but about search indexes, integrations and control of the document workflow.

## DeepSeek makes the small model the default

From 04:00 UTC on 14 September, DeepSeek began routing `deepseek-v4-pro` calls to V4.1-Flash at Flash rates. The model was published on 10 September, but it was the week 38 switch that made it the default for existing integrations. After user pushback, DeepSeek decided to keep serving V4-Pro through the API with unchanged billing.

V4.1-Flash is a mixture-of-experts model with 552 billion parameters — nearly double V4-Flash — with native multimodal support and open weights. DeepSeek points to tests by multiple parties placing it ahead of the far larger V4-Pro on performance, cost, speed and total runtime.

## Anthropic quantifies how much AI builds AI

On 17 September, Anthropic published a measurement framework cataloguing roughly 15,000 research and development tasks into a 542-node hierarchy. The headline: Claude "leads" 26% of the work that builds the next Claude — completing most of a task end to end from a high-level prompt, with a human supervising the result.

In February 2026 the figure was below 1%. On roughly 90% of staff work, the model is at least a collaborator.

Anthropic presents the numbers as a proposed shared standard that AI companies could use to communicate the pace of development. The timing is not incidental: a pacing plan needs a unit of measurement for what is being paced.

## A standards body takes shape behind closed doors

On 15 September, OpenAI Chief Global Affairs Officer Chris Lehane confirmed at a Washington briefing that OpenAI, Anthropic and Google DeepMind have been coordinating on safety protocols for several weeks. The work traces back to 14 July, when Google DeepMind's Demis Hassabis publicly proposed a US-led standards body for frontier AI modelled in part on the finance industry's FINRA.

The working group is focused on shared technical evaluations, pre-release audits of advanced models, independent testing frameworks and standardised safety protocols. Neither a timeline nor a legal structure has been published.

## Sources

- [Partnering with Accenture on embedded evaluation](https://www.anthropic.com/news/accenture-embedded-evaluation) · Primary source · 18 September 2026 · Anthropic's own announcement
- [Accenture and Anthropic Partner to Build Team of Embedded Evaluators](https://newsroom.accenture.com/news/2026/accenture-and-anthropic-partner-to-build-team-of-embedded-evaluators-at-anthropic) · Primary source · 18 September 2026
- [Anthropic selects Accenture as first embedded evaluator](https://www.cnbc.com/2026/09/18/anthropic-accenture-ai-safety.html) · Independent coverage · 18 September 2026
- [GPT-6 Astra](https://openai.com/index/gpt-6-astra/) · Primary source · 17 September 2026 · Model family product page
- [OpenAI launches Astra for Law, a GPT-6 configuration for legal research](https://siliconangle.com/2026/09/17/openai-launches-astra-for-law-a-gpt-6-configuration-for-legal-research/) · Independent coverage · 17 September 2026
- [Introducing DeepSeek-V4.1-Flash](https://www.deepseek.com/en/news/deepseek-v4-1-flash/) · Primary source · 10 September 2026
- [DeepSeek API Change Log](https://api-docs.deepseek.com/updates/) · Primary source · 14 September 2026 · Documents the traffic switch
- [Anthropic Says Claude Drives 26% of Its Research and Development](https://www.bloomberg.com/news/articles/2026-09-17/anthropic-says-claude-drives-26-of-its-research-and-development) · Independent coverage · 17 September 2026
- [OpenAI, Anthropic, Google have been in talks on AI safety for weeks](https://techcrunch.com/2026/09/15/openai-anthropic-google-have-been-in-talks-on-ai-safety-for-weeks/) · Independent coverage · 15 September 2026

## FAQ

### Does the Accenture deal amount to genuine independent oversight?

Partly. The evaluators get employee-level access and a mandate for red-teaming and alignment testing, which is more than external audit usually allows. But Anthropic pays for the work and picked the supplier, so the independence is contractual rather than institutional.

### Should we switch to DeepSeek V4.1-Flash?

Only if you are already on DeepSeek. The switch affects existing V4-Pro integrations, and V4-Pro continues unchanged. For new projects, what matters about the model is the open weights and the price, not that it made this week's news.

### What does the 26% figure mean for ordinary companies?

Not that a quarter of your work can be automated. The number covers an AI company's own R&D tasks, which are unusually well suited to the model. The value is in the method: a task taxonomy separating assistance, collaboration and leadership is a usable template for measuring your own AI maturity.
