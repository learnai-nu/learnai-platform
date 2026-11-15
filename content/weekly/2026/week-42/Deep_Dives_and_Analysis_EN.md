# "Open" means three different things

**Standfirst:** Week 42 brought two of the largest open models to date and a closed frontier model at a lower price. But open-weight covers very different licences – and it is the licence, not the parameter count, that decides what you may do.

**Period:** 12–18 October 2026

> **In brief**
> - Reflection released Beam under Apache 2.0: free use, including commercial.
> - Meta released Muse Spark Open under its own licence with "limited commercial terms".
> - Google took the opposite route with Gemini 4 Argon: a closed model with broad access and an introductory price.
> - For an organisation, choosing between open and closed is mostly about control, operations and licensing – not performance alone.

## Contents

- [Three models, three access models](#three-models-three-access-models)
- [The licence is the most important number](#the-licence-is-the-most-important-number)
- [What open weights really give you](#what-open-weights-really-give-you)
- [Four questions before you choose](#four-questions-before-you-choose)
- [What is still unclear](#what-is-still-unclear)

## Three models, three access models

Over four days in week 42, three large models arrived, each representing a different strategy.

On 13 October Google made Gemini 4 Argon available to all paying developers at $2 input and $10 output per million tokens. The model is closed: you get access through Google's API and products, not to the model itself.

On 15 October Meta released the weights for Muse Spark Open, 816B parameters, under the Muse Model License. The next day Reflection released Beam, 501B parameters, under Apache 2.0.

Two of the three can be downloaded. But the two downloadable models do not grant the same rights.

## The licence is the most important number

Apache 2.0 is one of the most widely used open source licences. It allows use, modification and redistribution, including commercially, as long as licence and copyright notices are kept. For Beam, that means a company can run it internally, fine-tune it and build products on it without negotiating with Reflection.

Muse Spark Open is under Meta's own licence, which Meta describes as having "limited commercial terms" that let many developers use the model for free. That is a different category: the weights are available, but the right to use them is defined by Meta and may limit commercial use.

The point is not that one is good and the other bad. It is that "open-weight" in a press release does not tell you what your lawyer will say. Nor did it in week 41, when Mistral announced Large 4 as open without naming the licence.

## What open weights really give you

Open weights give three things a closed model cannot: data can stay in your own environment, the model cannot suddenly be changed or retired by the vendor, and it can be fine-tuned to your domain.

But they come with a bill. Meta highlights that Muse Spark Open can run on two Mac Studio machines with M5 Ultra – an impressive demonstration, but still hardware to buy, run and update. In practice most organisations reach open models through a hosting partner, and then the difference from a closed API is smaller than it looks.

## Four questions before you choose

**What data will the model see?** If the answer is sensitive or business-critical data, that argues for a model you can run yourselves, or a vendor with clear data-processing terms.

**What does the licence say about your use?** Read it before the pilot, not after. Apache 2.0 is simple; vendor-specific licences need legal review.

**Who runs it?** An open model nobody owns operationally is a risk, not a saving.

**How will you know it is good enough?** Test on your own tasks, not the vendor's benchmarks. That applies to Argon, Beam and Muse Spark Open alike.

## What is still unclear

None of the three launches says anything about how the models behave over time in your environment. Most performance figures in this week's announcements are the vendors' own. And for open-weight models it remains unclear how quickly security fixes and new versions arrive once the model is downloaded.

## Sources

- [Beam is now available](https://reflection.ai/blog/beam-is-available) · Primary source · 16 October 2026 · Apache 2.0 and partners
- [Introducing Muse Spark Open](https://research.meta.ai/blog/muse-spark-open) · Primary source · 15 October 2026 · Muse Model License
- [Gemini 4 Argon: Built to solve your hardest problems](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/) · Primary source · 13 October 2026 · Price and access
- [AI models released in October 2026](https://www.nocode.mba/ai-release-tracker/2026/10) · Independent coverage · November 2026 · Release tracker

## FAQ

### Is open-weight the same as open source?

No. Open-weight means the model's weights can be downloaded. Open source in the classic sense also means the licence allows free use and modification. Beam under Apache 2.0 comes close; Muse Spark Open under a vendor licence does not.

### Is an open model cheaper than a closed one?

Not necessarily. The licence may be free, but operations, hardware and maintenance are not. Compare the total cost for your specific use.

### When does an open model make most sense?

When data must not leave your environment, when you need to fine-tune for a narrow domain, or when you want independence from one vendor's price changes and retirements.
