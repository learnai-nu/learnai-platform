import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const prioritiesPath = resolve(projectRoot, 'config', 'editorial-priorities.json');

function text(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function sqlString(value) {
	return `'${String(value).replaceAll("'", "''")}'`;
}

function jsonSql(value) {
	return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function keyForToken(token) {
	return token
		.toLocaleLowerCase('da')
		.replaceAll('æ', 'ae')
		.replaceAll('ø', 'oe')
		.replaceAll('å', 'aa')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
}

const labels = new Map(Object.entries({
	'EMNE': 'Emne',
	'MÅLGRUPPE': 'Målgruppe',
	'PROFESSIONEL/UFORMEL/ENGAGERENDE': 'Tone',
	'ANTAL': 'Ønsket antal ord',
	'EMNE/ERFARING': 'Emne eller erfaring',
	'INDSÆT TEKST': 'Tekst',
	'INDSÆT E-MAIL': 'E-mailen, du vil besvare',
	'DIN ROLLE': 'Din rolle',
	'ACCEPTERE/AFVISE/BEDE OM MERE INFO/FORHANDLE': 'Formål med svaret',
	'FORMEL/VENLIG/DIREKTE': 'Tone',
	'PUNKTER': 'Vigtige punkter',
	'NAVNE/ROLLER': 'Deltagere',
	'BESLUTNINGER': 'Beslutninger',
	'HANDLINGER': 'Næste handlinger',
	'DATOER': 'Deadlines',
	'INDSÆT DOKUMENT ELLER UPLOAD FIL': 'Dokument',
	'ROLLER/NAVNE': 'Deltagere',
	'TID': 'Mødets varighed',
	'MÅL': 'Mødets mål',
	'INDSÆT NOTER': 'Mødenoter',
	'DELTAGER/ROLLE': 'Deltager og rolle',
	'BESKRIVELSE': 'Kort beskrivelse',
	'MINUTTER': 'Varighed i minutter',
	'INFORMERE/OVERTALE/UNDERVISE': 'Præsentationens formål',
	'VIRKSOMHED/PRODUKT/PROJEKT': 'Virksomhed, produkt eller projekt',
	'BRANCHE': 'Branche',
	'NAVNE': 'Vigtigste konkurrenter',
	'VIRKSOMHED/AFDELING': 'Virksomhed eller afdeling',
	'INGEN/BEGYNDER/MODERAT/AVANCERET': 'Nuværende AI-niveau',
	'ANTAL MEDARBEJDERE': 'Antal medarbejdere',
	'UDFORDRINGER': 'Vigtigste udfordringer',
	'NIVEAU': 'Niveau',
	'EMNE/UDFORDRING': 'Emne eller udfordring',
	'BEGRÆNSNINGER': 'Begrænsninger',
	'KONCEPT': 'Koncept',
	'BEGYNDER/MELLEM/EKSPERT': 'Dit niveau',
	'RELEVANT BAGGRUND': 'Relevant baggrund',
	'EMNE/SKILL': 'Emne eller færdighed',
	'TIMER PR. UGE': 'Timer pr. uge',
	'SPECIFIKT MÅL': 'Dit konkrete mål',
	'DATO': 'Måldato',
	'INDSÆT LANG TEKST ELLER UPLOAD DOKUMENT': 'Tekst eller dokument',
	'LIST OPGAVER': 'Dine opgaver',
	'BESLUTNING': 'Beslutningen',
	'LIST MULIGHEDER': 'Muligheder',
	'LIST FAKTORER': 'Vigtige faktorer',
	'PROJEKT': 'Projekt',
	'HVAD SKAL OPNÅS': 'Ønsket resultat',
	'TEAM/BUDGET': 'Team og budget',
}));

const selectOptions = new Map(Object.entries({
	'PROFESSIONEL/UFORMEL/ENGAGERENDE': ['Professionel', 'Uformel', 'Engagerende'],
	'ACCEPTERE/AFVISE/BEDE OM MERE INFO/FORHANDLE': ['Acceptere', 'Afvise', 'Bede om mere information', 'Forhandle'],
	'FORMEL/VENLIG/DIREKTE': ['Formel', 'Venlig', 'Direkte'],
	'INFORMERE/OVERTALE/UNDERVISE': ['Informere', 'Overtale', 'Undervise'],
	'INGEN/BEGYNDER/MODERAT/AVANCERET': ['Ingen erfaring', 'Begynder', 'Moderat', 'Avanceret'],
	'BEGYNDER/MELLEM/EKSPERT': ['Begynder', 'Mellem', 'Ekspert'],
}));

const multilineTokens = /INDSÆT|LIST |PUNKTER|BESLUTNINGER|HANDLINGER|UDFORDRINGER|BEGRÆNSNINGER|BESKRIVELSE|NOTER/i;

function fieldsForTemplate(template) {
	const tokens = [...new Set(
		[...template.matchAll(/\[([^\]\n]{1,100})\]/g)].map((match) => match[1]),
	)];

	return tokens.map((token) => {
		const options = selectOptions.get(token) ?? [];
		const inputType = options.length
			? 'select'
			: multilineTokens.test(token)
				? 'textarea'
				: 'text';
		return {
			key: keyForToken(token),
			token: `[${token}]`,
			label: labels.get(token) ?? token.toLocaleLowerCase('da'),
			placeholder: inputType === 'textarea'
				? 'Indsæt eller beskriv det relevante indhold…'
				: `Skriv ${labels.get(token)?.toLocaleLowerCase('da') ?? 'dit svar'}…`,
			input_type: inputType,
			required: true,
			options,
		};
	});
}

const privacySensitive = new Set([
	'svar-paa-email',
	'follow-up-efter-moede',
	'moedereferat',
	'moedeforberedelse',
	'analyser-langt-dokument',
	'opsummer-lang-tekst',
	'ai-strategi-for-ledere',
]);

const documentPrompts = new Set([
	'analyser-langt-dokument',
	'opsummer-lang-tekst',
]);

function promptDefinition(prompt) {
	const sensitive = privacySensitive.has(prompt.slug);
	return {
		version: 1,
		template: text(prompt.prompt_text),
		fields: fieldsForTemplate(text(prompt.prompt_text)),
		privacy_notice: sensitive
			? 'Fjern personoplysninger, fortrolige virksomhedsdata og andre følsomme oplysninger, medmindre din organisation har godkendt værktøjet og databehandlingen.'
			: 'Kontrollér altid resultatet, før du bruger det. Del ikke fortrolige oplysninger i en AI-tjeneste, som din organisation ikke har godkendt.',
		tool_note: documentPrompts.has(prompt.slug)
			? 'Prompten fungerer bedst i en AI-assistent med filupload. Bed modellen henvise til afsnit eller sidetal, og kontrollér citaterne i originalen.'
			: null,
	};
}

const articleTitles = {
	'ai-guide-mus-samtaler': 'Praktisk guide: Brug AI ansvarligt som sparringspartner i MUS-samtaler',
	'saadan-skill-engineering-med-ai': 'Skill engineering: Fra prompt til genanvendelig AI-færdighed',
	'ai-first-lederskab-fremtidens-arbejde': 'AI-first-ledelse: En praktisk 30-dages plan',
	'den-agentiske-virksomhed-ai-agenter-guide': 'AI-agenter i virksomheden: Fra chatbot til kontrolleret handling',
	'saadan-vaelger-du-den-rigtige-ai-assistent': 'Sådan vælger du den rigtige AI-assistent i 2026',
};

const articleExcerpts = {
	'ai-guide-mus-samtaler': 'En praktisk og ansvarlig metode til at bruge AI til forberedelse, struktur og opfølgning på MUS-samtaler – med menneskelig kontrol og fokus på persondata.',
	'saadan-skill-engineering-med-ai': 'Lær forskellen på prompts, skills og agenter, og byg en genanvendelig AI-færdighed med trigger, input, beslutningslogik, outputkrav og tests.',
	'ai-first-lederskab-fremtidens-arbejde': 'En konkret 30-dages plan til ledere, der vil omsætte AI fra løse forsøg til ansvarlige arbejdsgange med klare mål og menneskeligt ejerskab.',
	'den-agentiske-virksomhed-ai-agenter-guide': 'Forstå hvornår en AI-agent er den rigtige løsning, hvordan den adskiller sig fra chat og automatisering, og hvilke kontrolmekanismer virksomheden skal etablere.',
	'saadan-vaelger-du-den-rigtige-ai-assistent': 'Vælg AI-assistent ud fra arbejdsopgaver, økosystem, data, kontrol og pris – med en neutral sammenligningsmetode, der kan gentages.',
};

function reviseMus(content) {
	return [
		'> **Vigtigt:** En MUS-samtale kan indeholde følsomme personoplysninger. Brug kun optagelse, transskribering og AI, når formål, hjemmel, samtykke, adgang og sletning er afklaret efter organisationens politik. AI må aldrig træffe personaleafgørelser.',
		'',
		content
			.replace('så du kan være 100% til stede', 'så du kan være mere til stede')
			.replace(
				'Når alle MUS-samtaler er gennemført, kan du bede AI\'en om at:',
				'Når alle MUS-samtaler er gennemført, kan du – hvis organisationens regler tillader det – arbejde med anonymiserede eller aggregerede temaer. Undlad at samle identificerbare medarbejderoplysninger i et ikke-godkendt AI-værktøj.',
			),
		'',
		'## Menneskelig kontrol før referatet deles',
		'',
		'- Kontrollér alle citater mod transskriberingen.',
		'- Adskil observationer, aftaler og fortolkninger.',
		'- Lad medarbejderen gennemgå og korrigere referatet.',
		'- Registrér kun oplysninger, der er nødvendige for det aftalte formål.',
		'- Slet rå transskribering og midlertidige filer efter den fastlagte frist.',
		'',
		'AI kan hjælpe med struktur og formulering. Lederen og medarbejderen ejer fortsat samtalen, vurderingerne og de endelige aftaler.',
	].join('\n');
}

function reviseSkill(content) {
	const normalized = content
		.replaceAll('Skill-engineering', 'skill engineering')
		.replaceAll('Skill Engineering', 'skill engineering')
		.replaceAll('AI-skills', 'AI-skills');
	return [
		'En prompt løser typisk én opgave. En skill beskriver en genanvendelig arbejdsmetode. En agent kan bruge skills og værktøjer til at gennemføre flere trin. Denne guide fokuserer på den midterste del: at gøre din metode tydelig, testbar og nem at genbruge.',
		'',
		'| Begreb | Formål | Eksempel |',
		'| --- | --- | --- |',
		'| Prompt | Én instruktion | Skriv et udkast til en mail |',
		'| Skill | Genanvendelig metode med regler og outputkrav | Udarbejd altid kundesvar efter virksomhedens servicemodel |',
		'| Agent | Planlægger og udfører flere trin med værktøjer | Find sagen, udarbejd svar og opret et godkendelsesudkast |',
		'',
		normalized,
		'',
		'## Et komplet skill-eksempel',
		'',
		'```text',
		'Navn: Mødebrief',
		'',
		'Brug denne skill, når brugeren skal forberede et møde og har angivet formål, deltagere og ønsket resultat.',
		'',
		'Input:',
		'- Mødets formål',
		'- Deltagere og roller',
		'- Kendte beslutninger eller konflikter',
		'',
		'Proces:',
		'1. Identificér de tre vigtigste beslutninger.',
		'2. Markér antagelser og manglende information.',
		'3. Udarbejd spørgsmål i prioriteret rækkefølge.',
		'',
		'Output:',
		'- Kort briefing',
		'- Beslutningspunkter',
		'- Fem spørgsmål',
		'- Risici og opfølgning',
		'',
		'Grænser:',
		'- Opfind ikke fakta om deltagerne.',
		'- Markér oplysninger, der kræver bekræftelse.',
		'```',
		'',
		'Test skillen med mindst tre forskellige inputs, herunder et mangelfuldt input. En robust skill skal bede om manglende oplysninger frem for at gætte.',
	].join('\n');
}

function reviseLeadership(content) {
	const normalized = content.replace(
		"Harvard Business Publishing introducerer konceptet 'AI-First Leadership' som den nødvendige evolution for moderne beslutningstagere.",
		'AI-first-ledelse kan bruges som en praktisk arbejdshypotese: ledelsen undersøger systematisk, hvor AI kan forbedre en proces, uden at give afkald på menneskeligt ansvar.',
	);
	return [
		normalized,
		'',
		'## En praktisk 30-dages plan',
		'',
		'### Uge 1: Vælg problemet',
		'',
		'- Kortlæg tre tidskrævende arbejdsgange.',
		'- Vælg én proces med tydelig ejer, lav risiko og målbart resultat.',
		'- Beskriv baseline: tid, kvalitet, fejl og medarbejderoplevelse.',
		'',
		'### Uge 2: Sæt rammerne',
		'',
		'- Afklar data, adgang, leverandør og menneskelig godkendelse.',
		'- Definér hvad AI må foreslå, og hvad et menneske skal beslutte.',
		'- Aftal stopkriterier ved fejl eller uventet adfærd.',
		'',
		'### Uge 3: Test med rigtige cases',
		'',
		'- Test på et lille, repræsentativt udvalg.',
		'- Registrér både gevinster og fejl.',
		'- Inddrag de medarbejdere, der udfører processen i dag.',
		'',
		'### Uge 4: Beslut næste skridt',
		'',
		'- Sammenlign resultatet med baseline.',
		'- Beslut om løsningen skal stoppes, justeres eller skaleres.',
		'- Dokumentér ansvar, instruktioner, kontrol og næste reviewdato.',
		'',
		'## Ledelsens minimumstjek',
		'',
		'En AI-first-indsats er først klar til drift, når der er en navngiven procesejer, et tydeligt formål, godkendte data, menneskelig kontrol, målepunkter og en plan for hændelser. Hastighed er en gevinst; ansvarlighed er et krav.',
	].join('\n');
}

function reviseAgentic(content) {
	const normalized = content
		.replace(
			'Ifølge nyere data fra Anthropic er AI-agenter nu rykket forbi teststadiet. Over halvdelen (57%) af organisationer kører i dag arbejdsflow med agenter, der strækker sig over flere trin. Det er slut med at se agenter som simple automatiseringer; de er ved at blive virksomhedens rygrad.',
			'En Anthropic-rapport beskriver, at flere af de adspurgte organisationer anvender flertrins-workflows med agenter. Tallene viser udvikling blandt rapportens deltagere, men dokumenterer ikke, at alle virksomheder er forbi pilotstadiet.',
		)
		.replace(
			'Det største benspænd for AI-agenter er ikke længere selve intelligensen (modellerne er nu kloge nok), men derimod **organisatorisk parathed**.',
			'Begrænsningerne handler både om modellernes pålidelighed og om **organisatorisk parathed**.',
		)
		.replace(
			'**Reducerede fejl:** Agenter følger processer konsistent og kan køre 24/7 uden træthed.',
			'**Mere ensartet proces:** Agenter kan følge faste trin, men output skal stadig overvåges og kontrolleres.',
		);
	return [
		normalized,
		'',
		'## Skal opgaven løses med chat, automation eller agent?',
		'',
		'| Vælg | Når opgaven… |',
		'| --- | --- |',
		'| Chat | kræver et forslag eller en analyse, som et menneske bruger videre |',
		'| Fast automation | følger stabile regler og kendte systemtrin |',
		'| Agent | kræver planlægning, værktøjsbrug og tilpasning mellem flere trin |',
		'',
		'Start ikke med en agent, hvis en simpel integration eller tjekliste kan løse opgaven mere sikkert.',
		'',
		'## Kontrol før en agent får adgang',
		'',
		'- Brug mindst mulige rettigheder.',
		'- Kræv menneskelig godkendelse før betalinger, publicering, sletning og andre irreversible handlinger.',
		'- Log værktøjskald og beslutningsgrundlag.',
		'- Test fejlscenarier, prompt injection og mangelfulde data.',
		'- Definér ejer, stopknap og procedure for hændelser.',
	].join('\n');
}

function assistantGuide() {
	return `AI-assistenter ændrer sig hurtigt. Derfor bør du ikke vælge ud fra én benchmark eller en generel rangliste. Vælg ud fra dine opgaver, dit arbejdsmiljø, dine datakrav og den kontrol, organisationen har brug for.

> **Opdateret 28. juli 2026:** Produktnavne, priser og funktioner kan ændre sig. Kontrollér altid leverandørens aktuelle vilkår før køb.

## Kort svar

- **ChatGPT** er et bredt valg til analyse, skrivning, research, kodning og komplekse opgaver. GPT-5.6 Sol er tilgængelig på kvalificerede betalte planer, mens GPT-5.5 Instant fortsat bruges til hurtige hverdagssvar.
- **Claude** er stærkt orienteret mod længerevarende vidensarbejde, agentiske opgaver, kode og dokumentarbejde. Claude Sonnet 5 blev lanceret 30. juni 2026.
- **Gemini** er særligt relevant, hvis arbejdet allerede foregår i Googles økosystem. Gemini 3.5 er Googles aktuelle modelserie til komplekse agentiske og multimodale opgaver.
- **Microsoft 365 Copilot** er oplagt, når Word, Excel, PowerPoint, Outlook og virksomhedens Microsoft 365-data er centrum for arbejdet.

Ingen assistent er bedst til alt.

## Trin 1: Vælg tre konkrete opgaver

Skriv de tre opgaver, du vil forbedre. Eksempel:

1. analysere lange dokumenter;
2. skrive beslutningsoplæg;
3. udarbejde præsentationer fra virksomhedens materiale.

Beskriv derefter et godt resultat. “Hurtigere” er ikke nok; brug fx tidsforbrug, kvalitet, antal rettelser eller dokumenterede fejl.

## Trin 2: Vurdér arbejdsmiljø og data

| Hvis dit vigtigste behov er… | Start testen med… |
| --- | --- |
| Bred, selvstændig AI-assistent til mange opgavetyper | ChatGPT |
| Længere dokumenter, kode og struktureret vidensarbejde | Claude |
| Gmail, Docs, Drive og øvrige Google-tjenester | Gemini |
| Word, Excel, PowerPoint, Outlook og Microsoft 365-kontekst | Microsoft 365 Copilot |

Tabellen er et startpunkt – ikke en facitliste. Virksomheder bør også vurdere databehandling, administratorstyring, logning, opbevaring, integrationer og geografiske krav.

## Trin 3: Kør den samme test

Brug samme repræsentative opgave i de værktøjer, du overvejer:

\`\`\`text
Analysér dette materiale og udarbejd et beslutningsoplæg.

Krav:
- Skeln mellem fakta, antagelser og anbefalinger.
- Henvis til de relevante afsnit i materialet.
- Markér manglende information.
- Foreslå tre realistiske handlemuligheder med fordele og risici.
\`\`\`

Bedøm resultatet på:

- faglig korrekthed;
- dokumentation og sporbarhed;
- evne til at følge formatet;
- antal nødvendige rettelser;
- samlet tidsbesparelse.

## Trin 4: Test handlinger med lav risiko

Hvis du har brug for agentfunktioner, så test først en reversibel opgave. Lad fx assistenten udarbejde et mail- eller kalenderudkast, men ikke sende eller booke automatisk. Kontrollér hvilke systemer den får adgang til, og om der findes godkendelse før handling.

## Trin 5: Vælg én primær og én reserve

Vælg den assistent, der løser dine vigtigste opgaver bedst inden for organisationens rammer. En reserve kan være nyttig til kvalitetstjek, men undgå abonnementer uden et klart formål.

Planlæg en ny vurdering hvert kvartal. Markedet bevæger sig for hurtigt til, at en sammenligning fra januar nødvendigvis er dækkende i juli.

## Beslutningstjekliste

- [ ] Tre konkrete opgaver er testet
- [ ] Resultater er vurderet efter samme kriterier
- [ ] Databehandling og administratorstyring er godkendt
- [ ] Integrationer passer til arbejdsmiljøet
- [ ] Menneskelig godkendelse er placeret før vigtige handlinger
- [ ] Pris og vilkår er kontrolleret hos leverandøren
- [ ] Næste reviewdato er aftalt

## Primære kilder

- [OpenAI: GPT-5.6 i ChatGPT](https://help.openai.com/en/articles/20001354-gpt-56-in-chatgpt)
- [Anthropic: Claude Sonnet 5](https://www.anthropic.com/news/claude-sonnet-5)
- [Google: Gemini 3.5](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/)
- [Microsoft: Agentiske funktioner i Word, Excel og PowerPoint](https://www.microsoft.com/en-us/microsoft-365/blog/2026/04/22/copilots-agentic-capabilities-in-word-excel-and-powerpoint-are-generally-available/)`;
}

function revisedArticle(article) {
	const revisions = {
		'ai-guide-mus-samtaler': reviseMus,
		'saadan-skill-engineering-med-ai': reviseSkill,
		'ai-first-lederskab-fremtidens-arbejde': reviseLeadership,
		'den-agentiske-virksomhed-ai-agenter-guide': reviseAgentic,
		'saadan-vaelger-du-den-rigtige-ai-assistent': () => assistantGuide(),
	};
	return revisions[article.slug](text(article.content));
}

function promptUpdateSql(prompt) {
	const definition = promptDefinition(prompt);
	const editorial = {
		wave: 1,
		reviewed_at: '2026-07-28',
		review_status: 'ready_for_human_review',
	};
	return `update public.content_items
set status = 'review'::public.content_status,
    source_metadata = source_metadata || ${jsonSql({
		prompt_definition: definition,
		editorial,
	})},
    updated_at = now()
where source_key = ${sqlString(`learnai-backup:prompt:${prompt.id}`)}
  and type = 'prompt'::public.content_type;`;
}

function articleUpdateSql(article) {
	const editorial = {
		wave: 1,
		reviewed_at: '2026-07-28',
		review_status: 'ready_for_human_review',
	};
	return `update public.content_items
set title = ${sqlString(articleTitles[article.slug])},
    excerpt = ${sqlString(articleExcerpts[article.slug])},
    body = ${jsonSql({ format: 'markdown', markdown: revisedArticle(article) })},
    seo_title = ${sqlString(articleTitles[article.slug])},
    seo_description = ${sqlString(articleExcerpts[article.slug])},
    status = 'review'::public.content_status,
    source_metadata = source_metadata || ${jsonSql({ editorial })},
    updated_at = now()
where source_key = ${sqlString(`learnai-backup:article:${article.id}`)};`;
}

function batchSql(statements, expectedCount) {
	return [
		'begin;',
		"set local statement_timeout = '60s';",
		...statements,
		'commit;',
		`select count(*)::integer as reviewed_count
from public.content_items
where source_metadata->'editorial'->>'wave' = '1'
  and source_metadata->'editorial'->>'review_status' = 'ready_for_human_review';`,
		`-- Expected cumulative reviewed count after all batches: ${expectedCount}`,
		'',
	].join('\n\n');
}

async function main() {
	const backupArgument = process.argv[2];
	if (!backupArgument) {
		throw new Error('Brug: pnpm editorial:prepare <sti-til-backup.json> [output-mappe]');
	}
	const backupPath = resolve(backupArgument);
	const outputPath = resolve(process.argv[3] || resolve(projectRoot, '.content-import'));
	const [backupSource, prioritiesSource] = await Promise.all([
		readFile(backupPath, 'utf8'),
		readFile(prioritiesPath, 'utf8'),
	]);
	const backup = JSON.parse(backupSource);
	const priorities = JSON.parse(prioritiesSource);
	const prompts = backup.prompts.filter(
		(prompt) => prompt.locale === 'da' && priorities.first_wave.prompts.includes(prompt.slug),
	);
	const articles = backup.articles.filter(
		(article) => article.locale === 'da' && priorities.first_wave.articles.includes(article.slug),
	);

	if (prompts.length !== 20 || articles.length !== 5) {
		throw new Error(`Forventede 20 prompts og 5 artikler, fandt ${prompts.length} og ${articles.length}.`);
	}
	for (const prompt of prompts) {
		const definition = promptDefinition(prompt);
		if (!definition.template || definition.fields.length === 0) {
			throw new Error(`Prompten ${prompt.slug} mangler skabelon eller felter.`);
		}
	}

	await mkdir(outputPath, { recursive: true });
	const oldFiles = await readdir(outputPath);
	await Promise.all(
		oldFiles
			.filter((filename) => /^editorial-wave-\d+\.sql$/.test(filename))
			.map((filename) => unlink(resolve(outputPath, filename))),
	);

	const batches = [
		...Array.from({ length: 4 }, (_, index) =>
			prompts.slice(index * 5, index * 5 + 5).map(promptUpdateSql)),
		...articles.map((article) => [articleUpdateSql(article)]),
	];
	for (const [index, statements] of batches.entries()) {
		const filename = `editorial-wave-${String(index + 1).padStart(3, '0')}.sql`;
		await writeFile(resolve(outputPath, filename), batchSql(statements, 25), 'utf8');
	}

	const report = {
		version: 1,
		generated_at: new Date().toISOString(),
		status: 'review',
		prompts: prompts.length,
		articles: articles.length,
		batches: batches.length,
		prompt_fields: prompts.reduce(
			(total, prompt) => total + promptDefinition(prompt).fields.length,
			0,
		),
	};
	await writeFile(
		resolve(outputPath, 'editorial-wave-report.json'),
		`${JSON.stringify(report, null, 2)}\n`,
		'utf8',
	);
	process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename);
if (isDirectRun) {
	main().catch((error) => {
		process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
		process.exitCode = 1;
	});
}
