# Nødbremsen, der kom samtidig med prisfaldet

**Underrubrik:** Nadella bad branchen om at behandle modeller som insidertrusler i samme uge, som agentkørsel blev 75 % billigere. De to ting hænger sammen.

**Periode:** 5.–11. oktober 2026

> **Kort fortalt**
> - Nadellas forslag flytter debatten fra tempo til indeslutning: ikke "bremse kapabiliteten", men "kunne stoppe agenten".
> - Han foreslår bl.a. at adskille modellen fra det lag, der giver den værktøjer og rettigheder.
> - Samme uge gjorde Haiku 5.5 høj-volumen agentkørsel markant billigere — præcis når styringen ikke er på plads.
> - Forslaget er en retning, ikke en standard: ingen specificeret arkitektur, latenstid eller implementering.

## Indhold

- [Hvad Nadella faktisk foreslog](#hvad-nadella-faktisk-foreslog)
- [Fra tempo til indeslutning](#fra-tempo-til-indeslutning)
- [Prisfaldet er den anden halvdel af historien](#prisfaldet-er-den-anden-halvdel-af-historien)
- [Fire ting en dansk organisation kan gøre nu](#fire-ting-en-dansk-organisation-kan-gore-nu)
- [Hvad der stadig mangler](#hvad-der-stadig-mangler)

## Hvad Nadella faktisk foreslog

Lørdag den 10. oktober skrev Microsofts CEO Satya Nadella et opslag, der blev ugens mest citerede: virksomheder bør gå ud fra, at en kraftig model er kompromitteret, og indeslutte den fra starten. "We must assume a model is compromised and contain it from the start."

Konkret peger han på fem ting. Modeller skal behandles som potentielle insidertrusler. Der skal findes en mekanisme, hvor et menneske kan sætte en agentbaseret model på pause midt i en opgave. Modellen skal adskilles fra den software, der tildeler den værktøjer og rettigheder. Der skal føres manipulationssikre optegnelser over, hvad agenter har foretaget sig, og de skal kunne revideres uafhængigt. Og kritiske beslutninger bør ikke hvile på én model alene. Dertil kommer en opfordring til at offentliggøre væsentlige AI-fejl og -brud.

Det er værd at bemærke, hvad forslaget *ikke* er. Det er ikke et Microsoft-produktkrav, ikke en branchestandard, og det specificerer hverken teknisk arkitektur, hvor hurtigt en pause skal virke, eller hvordan den implementeres.

## Fra tempo til indeslutning

Sammenlign med september, hvor Dario Amodeis "We Must Pace the Frontier" satte dagsordenen med et argument om tempo: udskyd kapabilitetsspringene, så sikkerhedsarbejdet kan følge med.

Nadellas argument er et andet. Det accepterer implicit, at modellerne bliver stærkere i det tempo, de nu gør, og flytter spørgsmålet til, hvad der omgiver dem. Hvis du ikke kan styre, hvor dygtig modellen bliver, kan du styre, hvad den har adgang til, og hvornår du kan stoppe den.

Det er en mere praktisk position — og en, der falder meget lettere i tråd med, hvordan en it-sikkerhedsafdeling i forvejen tænker. Insidertrussel, rettighedsadskillelse, manipulationssikker logning og uafhængig revision er ikke nye discipliner. De er velkendte kontroller, som nu bare skal pege på en ny slags aktør.

For en virksomhed er det en betydeligt mere handlingsorienteret ramme end "branchen bør bremse". Du kan ikke sætte tempoet ned hos din leverandør. Du kan godt adskille din agent fra dine rettigheder.

## Prisfaldet er den anden halvdel af historien

Timingen i uge 41 er ikke tilfældig, og den er ubehagelig.

Samme uge satte Anthropic prisen på Claude Haiku 5.5 til 0,10 dollar input og 0,50 dollar output pr. million tokens for prompts under 100k — i gennemsnit omkring 75 % billigere end forgængeren. Modellen markedsføres eksplicit til høj-volumen-opgaver og til at køre som subagent under større modeller.

Det er præcis den slags prissætning, der gør det økonomisk forsvarligt at lade hundredvis af agentkald køre uden nøje overvågning. Og det er præcis den situation, Nadellas opslag advarer imod: en model, der handler, med adgang til værktøjer, i stort antal, uden en pålidelig måde at stoppe den på.

Prisen på at gøre noget dumt i stor skala er med andre ord faldet hurtigere end evnen til at opdage det. Det er den reelle nyhed i uge 41.

## Fire ting en dansk organisation kan gøre nu

**Få en kill-switch, der virker midt i en opgave.** Ikke en, der deaktiverer API-nøglen i morgen, men en der kan afbryde en kørende agent nu. Test den.

**Adskil modellen fra rettighederne.** Agenten skal ikke arve en medarbejders fulde adgang. Giv den et snævert, eksplicit sæt værktøjer og en egen identitet, der kan spærres.

**Log, hvad agenten gjorde — ikke kun hvad den svarede.** Værktøjskald, parametre, resultater. Det er det, der gør en hændelse undersøgbar bagefter.

**Lad ikke én model træffe den kritiske beslutning alene.** Hvor konsekvensen er stor, skal der enten være et menneske eller en uafhængig kontrol i løkken.

Ingen af de fire kræver, at I venter på en standard.

## Hvad der stadig mangler

Forslaget efterlader de svære spørgsmål åbne. Hvem definerer, hvad en "kritisk beslutning" er? Hvor hurtigt skal en pause virke, før den er meningsfuld? Og hvem reviderer de uafhængige revisorer — et spørgsmål, september-ugens Accenture-aftale allerede rejste uden at besvare.

Indtil der kommer svar, er Nadellas opslag mest af alt nyttigt som checkliste. Det er også sådan, det bør bruges.

## Kilder

- [Microsoft CEO Nadella Urges 'Emergency Brake' for Advanced AI Models](https://www.bloomberg.com/news/articles/2026-10-10/microsoft-ceo-nadella-calls-for-emergency-brake-on-advanced-ai) · Uafhængig dækning · 10. oktober 2026
- [Microsoft's Nadella says AI needs an 'emergency brake' that humans control](https://www.cnbc.com/2026/10/10/microsoft-satya-nadella-ai-emergency-brake-safety.html) · Uafhængig dækning · 10. oktober 2026
- [Microsoft calls for AI 'emergency brake'](https://www.taipeitimes.com/News/biz/archives/2026/10/12/2003865788) · Uafhængig dækning · 12. oktober 2026
- [Claude Haiku 5.5](https://www.anthropic.com/news/claude-haiku-5-5) · Primær kilde · 7. oktober 2026 · Priser og positionering som subagent
- [Anthropic reveals Haiku 5.5 model as AI pricing war intensifies](https://finance.yahoo.com/technology/article/anthropic-reveals-haiku-55-model-as-ai-pricing-war-intensifies-180000423.html) · Uafhængig dækning · 7. oktober 2026
- [Security and AI news from the week beginning 5 October 2026](https://www.enterprisetimes.co.uk/2026/10/12/security-and-ai-news-from-the-week-beginning-5-october-2026/) · Uafhængig dækning · 12. oktober 2026

## FAQ

### Er nødbremsen noget, vi skal vente på?

Nej. Der er ingen standard på vej med en kendt dato, og de fire kontroller i artiklen kan implementeres med de værktøjer, I har. Behandl forslaget som en checkliste, ikke som en kommende compliance-forpligtelse.

### Betyder det, at vi skal holde igen med agenter?

Nej, men adskil udrulningstempoet fra styringstempoet. Det er fuldt forsvarligt at køre agenter på opgaver med lav konsekvens, mens I bygger logning og afbrydelse til dem med høj.

### Hvordan hænger det sammen med september-debatten?

De to argumenter er beslægtede, men ikke ens. Amodei ville sænke kapabilitetstempoet; Nadella accepterer tempoet og vil indeslutte resultatet. For en virksomhed er Nadellas version den brugbare, fordi den handler om noget, I selv kontrollerer.
