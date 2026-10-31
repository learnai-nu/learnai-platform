# The price fell, and the weights opened

**Standfirst:** Anthropic cut its small model's price by up to 90%, OpenAI gave every ChatGPT user GPT-6, and two large open models landed within two days of each other.

**Period:** 5–11 October 2026

> **In brief**
> - Claude Haiku 5.5 arrived on 7 October at $0.10 input and $0.50 output per million tokens below 100k.
> - OpenAI rolled GPT-6 out to every ChatGPT tier on 7–8 October, free users included.
> - Mistral Large 4 "Le Chonk" opened as an API preview on 6 October at roughly 1 trillion parameters.
> - Reflection announced Beam on 5 October, a 501-billion-parameter MoE model with Apache 2.0 weights promised.
> - Satya Nadella proposed a human-controlled "emergency brake" for agentic models on 10 October.

## Contents

- [Anthropic starts a price war](#anthropic-starts-a-price-war)
- [GPT-6 for everyone, free tier included](#gpt-6-for-everyone-free-tier-included)
- [Two large open models in two days](#two-large-open-models-in-two-days)
- [Nadella asks for an emergency brake](#nadella-asks-for-an-emergency-brake)
- [Also this week](#also-this-week)

## Anthropic starts a price war

On 7 October, Anthropic released Claude Haiku 5.5 with pricing that changes the arithmetic for high-volume work: $0.10 per million input tokens and $0.50 per million output tokens for prompts up to 100,000 tokens. Above that threshold it rises to $0.50 and $2.50. Cache reads cost $0.01.

Anthropic states that the model costs roughly 75% less to run on average than Haiku 4.5 — and 90% less for requests up to 100k. Sonnet 5.5's cache-read price was halved at the same time.

The performance figures in Anthropic's own announcement are unusually large jumps for a small model. On OSWorld 2.1 (offline subset), Haiku 5.5 scores 72.4% against Haiku 4.5's 15.7%. On Terminal-Bench 4.0 the figures are 39.2% against 0.0%. On Humanity's Last Exam it reaches 45.9% without tools and 57.4% with.

The model is available as `claude-haiku-5-5` on Anthropic's API and through AWS, Google Cloud and Microsoft Azure. Note that several roundups during the week reported a 1-million-token context window; that figure does not appear in Anthropic's own announcement.

## GPT-6 for everyone, free tier included

OpenAI began rolling GPT-6 out in ChatGPT to paid tiers on 7 October, with Free and Go following on 8 October. The rollout comes with a capability several outlets describe as Intelligent UI. The model family is reported as Sol for paid plans and Luna for free users, while enterprise access depends on administrator settings.

The notable part is not the model but the distribution. A frontier model on the free tier changes the premise for any organisation that built its AI policy on the assumption that the good models sat behind a paywall.

## Two large open models in two days

On 5 October, Reflection announced Beam: a mixture-of-experts model with 501 billion parameters, with the company taking early-access registrations and promising weights under Apache 2.0 later in the month.

The next day, 6 October, Mistral Large 4 — internally "Le Chonk" — opened as a public API preview. The model is natively multimodal and a mixture-of-experts with roughly 1 trillion total parameters and around 50 billion active. Mistral has said downloadable weights should arrive by the end of October, but it has not named the licence. Large 3 was Apache 2.0; that cannot be assumed to carry over.

For European organisations the Mistral launch is the more relevant of the two, but "open" here still means "announced as open".

## Nadella asks for an emergency brake

On Saturday 10 October, Microsoft CEO Satya Nadella posted on X arguing that companies should treat powerful AI models as potential insider threats and build a mechanism letting a human pause agentic models mid-task. "We must assume a model is compromised and contain it from the start," he wrote.

The proposal is covered in this week's Deep Dives piece.

## Also this week

Anthropic expanded its Cyber Verification Program on 6 October, giving qualifying security professionals access to advanced cyber capabilities and reduced blocking classifiers. Google updated its Nano Banana image model to version 2.1, rolling out gradually across Google's products.

## Sources

- [Claude Haiku 5.5](https://www.anthropic.com/news/claude-haiku-5-5) · Primary source · 7 October 2026 · Pricing and benchmarks
- [Anthropic News](https://www.anthropic.com/news) · Primary source · October 2026 · Cyber Verification Program, 6 October
- [Anthropic has released Claude Haiku 5.5](https://artificialanalysis.ai/articles/claude-haiku-5-5) · Independent coverage · 7 October 2026
- [Anthropic Cuts Small-Model Pricing 90% With Claude Haiku 5.5](https://www.vktr.com/ai-platforms/anthropic-cuts-smallmodel-pricing-90-with-claude-haiku-55/) · Independent coverage · October 2026
- [OpenAI Brings GPT-6 With Intelligent UI to All ChatGPT Tiers](https://www.unite.ai/openai-brings-gpt-6-with-intelligent-ui-to-all-chatgpt-tiers/) · Independent coverage · October 2026
- [OpenAI Is Finally Bringing GPT-6 to ChatGPT for Everyone](https://www.androidheadlines.com/2026/10/openai-bringing-gpt-6-ai-models-chatgpt-everyone.html) · Independent coverage · October 2026
- [Mistral's Large 4 'Le Chonk' joins the West's open model push](https://www.therundown.ai/news/mistral-large-4-le-chonk-open-models) · Independent coverage · October 2026
- [Microsoft's Nadella says AI needs an 'emergency brake' that humans control](https://www.cnbc.com/2026/10/10/microsoft-satya-nadella-ai-emergency-brake-safety.html) · Independent coverage · 10 October 2026
- [Security and AI news from the week beginning 5 October 2026](https://www.enterprisetimes.co.uk/2026/10/12/security-and-ai-news-from-the-week-beginning-5-october-2026/) · Independent coverage · 12 October 2026 · Weekly overview

## FAQ

### Should we switch to Haiku 5.5 to save money?

Run the numbers before moving anything. The large saving applies to prompts under 100,000 tokens; above that the price multiplies by five. If your workflows send long documents on every call, the gain is far smaller than the headlines suggest.

### What does GPT-6 on the free tier mean for our AI policy?

That the assumption that staff must pay to reach a strong model no longer holds. If your policy governs access rather than use and data handling, it needs rewriting.

### Is Mistral Large 4 genuinely an open model?

Not yet. It arrived as an API preview, and Mistral has neither released the weights nor named the licence. Do not plan self-hosting on it until both exist.
