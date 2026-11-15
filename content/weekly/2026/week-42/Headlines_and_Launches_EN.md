# Google opens access, Meta and Reflection open weights

**Standfirst:** Gemini 4 Argon became available to every paying developer, while Meta and Reflection released the weights for two of the largest open models to date. The same week brought a new kind of model that answers with probabilities instead of text.

**Period:** 12–18 October 2026

> **In brief**
> - On 13 October Google made Gemini 4 Argon broadly available at an introductory price of $2 input and $10 output per million tokens.
> - On 15 October Meta released Muse Spark Open: 816B parameters, 42B active and a 1M-token context window.
> - On 16 October Reflection released Beam's weights under Apache 2.0 – 501B parameters, 23B active.
> - Perplexity, Liquid AI and Sqwish Labs launched "decision models" that return structured decisions with probabilities.
> - OpenAI and xAI updated their voice models: GPT-Live-1.1 in ChatGPT Voice and Grok Voice 3.0 in xAI's API.

## Contents

- [Gemini 4 Argon for every paying user](#gemini-4-argon-for-every-paying-user)
- [Two large open models in two days](#two-large-open-models-in-two-days)
- [Models that answer with probabilities](#models-that-answer-with-probabilities)
- [Voice gets an update at OpenAI and xAI](#voice-gets-an-update-at-openai-and-xai)
- [Also this week](#also-this-week)

## Gemini 4 Argon for every paying user

On 13 October Google made Gemini 4 Argon globally available to developers and enterprises through the API in AI Studio and the Gemini platform, and to Google AI Ultra and Pro subscribers in the Gemini app and AI Mode in Search.

Google positions Argon for deep work on complex tasks in code, finance, law, cybersecurity and science, and says it ranks first on the Vals Index of economically important sectors. The introductory price is $2 per million input tokens and $10 per million output tokens, with cached input tokens 95% off.

Google's own examples are internal: it says Argon increased agent-submitted code changes by more than 35% and cut rollbacks by nearly a third. Those are company figures, not independent measurements.

## Two large open models in two days

On 15 October Meta released the weights for Muse Spark Open, which it calls the most capable US open-weight model to date. It is natively multimodal with 816B total parameters, 42B active and a 1M-token context window, built for coding and agentic work. Meta highlights that it can run on two Mac Studio machines with M5 Ultra.

The next day, 16 October, Reflection released Beam's weights on Hugging Face under Apache 2.0. Beam is a sparse mixture-of-experts model with 501B parameters and 23B active, launched with more than 40 partners for inference, fine-tuning and deployment.

The licences differ. Beam is Apache 2.0, which allows free commercial use. Muse Spark Open is under Meta's own Muse Model License "with limited commercial terms". This week's Deep Dives article explains why that matters.

## Models that answer with probabilities

A less discussed trend this week was "decision models": models that do not write text but return a structured decision with a probability.

Sqwish Labs launched the kettei family for routing and evidence checks on 14 October. Liquid AI launched d1-ultra on 15 October, taking text and images and returning probabilities for yes/no, choice and scoring questions. Perplexity released pplx-decider-v1.2 and a flash version as open-weight models on 16 October, answering several questions about the same input in one pass.

This matters because many AI tasks are classification in practice: which team should handle a request, is the document complete, does the text follow the guidelines? A model that answers "yes, 0.92" instead of a paragraph is easier to check, log and set thresholds for.

## Voice gets an update at OpenAI and xAI

On 15 October OpenAI began rolling out GPT-Live-1.1 and the smaller GPT-Live-1.1 Quip in ChatGPT Voice, with more natural accents and more language-specific voices. The rollout covers ChatGPT Voice, not general API access. The day before, xAI launched Grok Voice 3.0, a speech-to-speech model in its Voice Agent API.

## Also this week

Meta introduced Muse Wonder and Muse Wonder Full for personal and professional agentic tasks on 12 October. The Institute of Foundation Models and Inception42 released Jais 3 on 15 October, six open Arabic language models from 900M to 375B parameters. NVIDIA released Nemotron 3.5 Super VL and Bolt for multimodal agent workflows the same day.

## Sources

- [Gemini 4 Argon: Built to solve your hardest problems](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/) · Primary source · 13 October 2026 · Availability and introductory price
- [Introducing Muse Spark Open](https://research.meta.ai/blog/muse-spark-open) · Primary source · 15 October 2026 · Parameters, context and licence
- [Beam is now available](https://reflection.ai/blog/beam-is-available) · Primary source · 16 October 2026 · Weights under Apache 2.0
- [pplx-decider-v1.2](https://huggingface.co/perplexity-ai/pplx-decider-v1.2) · Primary source · 16 October 2026
- [Liquid AI d1-ultra](https://www.liquid.ai/blog/d1-ultra) · Primary source · 15 October 2026
- [Grok Voice 3](https://x.ai/news/grok-voice-3) · Primary source · 14 October 2026
- [AI models released in October 2026](https://www.nocode.mba/ai-release-tracker/2026/10) · Independent coverage · November 2026 · Release tracker

## FAQ

### Should we switch to Gemini 4 Argon?

Not on the strength of the headlines. Test it on one concrete, longer task from your own work and measure quality and review time. Note that the price is introductory.

### Can we use Muse Spark Open commercially?

Possibly. The licence has "limited commercial terms", so read the Muse Model License before building on it. Beam is Apache 2.0 and has no such restriction.

### What is a decision model for?

Tasks with fixed answers: routing requests, checking completeness or scoring against a checklist. The probability makes it easy to send uncertain cases to a person.
