# When AI should decide, not write

**Standfirst:** For the second week running, new decision models arrived – models that answer with a probability instead of text. It sounds like a technical detail, but it solves one of the most overlooked problems with AI in production: how to control it.

**Period:** 19–25 October 2026

> **In brief**
> - On 21 October Base Labs released mammoth-1 and elephant-1, following decision models from Perplexity, Liquid AI and Sqwish Labs in week 42.
> - A decision model returns a probability distribution over the possible answers – not free text.
> - It fits three types of question: choosing between categories, scoring on a scale, and yes/no.
> - The probability makes it possible to set a threshold and send uncertain cases to a person.

## Contents

- [What a decision model is](#what-a-decision-model-is)
- [Why text is a poor answer format](#why-text-is-a-poor-answer-format)
- [Where it fits in an organisation](#where-it-fits-in-an-organisation)
- [How to get started](#how-to-get-started)
- [Caveats](#caveats)

## What a decision model is

A regular language model writes text. A decision model does something else: given an input and a question, it returns a probability for each possible answer, summing to 1.

Baseten describes three question types. Choice: which team owns this ticket – infrastructure, billing, security or support? Score: how urgent is it, low or high? And boolean: is this email a phishing attempt?

In week 42 Perplexity, Liquid AI and Sqwish Labs launched models in the category. In week 43 Base Labs followed with mammoth-1 and elephant-1, which Baseten says top the Jev Decision Index among 208 decision models.

## Why text is a poor answer format

Many organisations use generative models today for tasks that are really classification. They ask the model to "answer with one of the following categories" and hope it does. It often works, but it has three weaknesses.

The answer may be phrased differently than expected and need interpreting. You do not know how sure the model is. And you cannot set a limit for when a person should take over.

A decision model instead answers: "billing, 0.87". That is an answer a system can use directly, and a number an organisation can manage by.

## Where it fits in an organisation

The tasks are rarely the most visible, but they are many.

**Routing requests.** Which department should an email or case go to?

**Completeness checks.** Does the application, invoice or documentation contain what it should?

**Checklist assessment.** Does the text follow tone, legal or brand guidelines?

**Prioritisation.** Which cases are urgent?

What they share is a known set of answers, and a wrong judgment can be caught if you know when the model is unsure.

## How to get started

**Pick one decision with a fixed set of answers.** For example, routing incoming emails to four teams.

**Collect 100 examples where a person gave the right answer.** That is your benchmark.

**Set a threshold.** Cases above, say, 0.9 are handled automatically; the rest go to a person.

**Measure continuously.** How often was the model right when it was sure? How many cases ended up with a person?

## Caveats

The category is new and most figures are the vendors' own. Rankings on indices such as the Jev Decision Index say something about general performance, not about your specific decision. And a probability is only useful if it is calibrated – if 0.9 really means the model is right nine times out of ten. That must be tested on your own data.

## Sources

- [The top ranked decision models in the world: mammoth-1 and elephant-1](https://www.baseten.co/blog/the-best-decision-models-in-the-world-mammoth-1-and-elephant-1/) · Primary source · 21 October 2026 · Definition and question types
- [AI models released in October 2026](https://www.nocode.mba/ai-release-tracker/2026/10) · Independent coverage · November 2026 · pplx-decider, d1-ultra and kettei in week 42

## FAQ

### Should we replace our language model with a decision model?

No. They solve different tasks. Use the language model to write or explain, and a decision model to choose between known answers.

### How sure should the model be before it decides alone?

It depends on what an error costs. Start high, say 0.9, and only lower the threshold once you have measured how often it is wrong above it.

### Does using a decision model require special skills?

Less than you might think. The hard part is not the technology but defining the decision and collecting good examples.
