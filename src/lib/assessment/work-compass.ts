export type AssessmentLocale = 'da' | 'en';
export type AssessmentDimension = 'understanding' | 'practice' | 'adoption';
export type AssessmentStage = 'starter' | 'explorer' | 'practitioner' | 'orchestrator';

export interface ScoreVector {
	understanding: number;
	practice: number;
	adoption: number;
}

export interface AssessmentOption {
	id: string;
	label: Record<AssessmentLocale, string>;
	scores: ScoreVector;
}

export interface AssessmentQuestion {
	id: string;
	dimension: AssessmentDimension;
	prompt: Record<AssessmentLocale, string>;
	context: Record<AssessmentLocale, string>;
	options: AssessmentOption[];
}

export interface AssessmentResult {
	dimensions: Record<AssessmentDimension, number>;
	overall: number;
	stage: AssessmentStage;
	strongestDimension: AssessmentDimension;
	growthDimension: AssessmentDimension;
}

const dimensions: AssessmentDimension[] = ['understanding', 'practice', 'adoption'];
const emptyScore = (): ScoreVector => ({ understanding: 0, practice: 0, adoption: 0 });
const dimensionScore = (dimension: AssessmentDimension, value: number): ScoreVector => ({
	...emptyScore(),
	[dimension]: value,
});

function options(
	dimension: AssessmentDimension,
	id: string,
	labels: Array<[string, string]>,
): AssessmentOption[] {
	return labels.map(([da, en], index) => ({
		id: `${id}-${3 - index}`,
		label: { da, en },
		scores: dimensionScore(dimension, 3 - index),
	}));
}

export const workCompassQuestions: AssessmentQuestion[] = [
	{
		id: 'capabilities', dimension: 'understanding',
		prompt: { da: 'Hvordan vurderer du, om AI passer til en opgave?', en: 'How do you decide whether AI fits a task?' },
		context: { da: 'Tænk på den beslutning, du faktisk tager – ikke den ideelle.', en: 'Think about the decision you actually make—not the ideal one.' },
		options: options('understanding', 'capabilities', [
			['Jeg vurderer opgaven ud fra AI’s styrker, begrænsninger og risici', 'I assess the task against AI’s strengths, limits, and risks'],
			['Jeg afprøver AI og vurderer resultatet bagefter', 'I try AI and evaluate the result afterwards'],
			['Jeg bruger AI til de opgaver, jeg allerede kender det fra', 'I use AI for tasks where I already know it'],
			['Jeg er ofte i tvivl om, hvor AI giver mening', 'I am often unsure where AI is useful'],
		]),
	},
	{
		id: 'limitations', dimension: 'understanding',
		prompt: { da: 'Hvordan forholder du dig til fejl og usikkerhed i AI-svar?', en: 'How do you handle errors and uncertainty in AI responses?' },
		context: { da: 'Vælg det svar, der bedst beskriver din normale kontrol.', en: 'Choose the answer that best describes your usual checks.' },
		options: options('understanding', 'limitations', [
			['Jeg tilpasser kontrollen efter konsekvens, datakvalitet og opgavetype', 'I adapt my checks to impact, data quality, and task type'],
			['Jeg kontrollerer centrale påstande og kilder', 'I verify key claims and sources'],
			['Jeg læser svaret igennem og retter det, der virker forkert', 'I read the response and correct what seems wrong'],
			['Jeg bruger som regel svaret, hvis det lyder overbevisende', 'I usually use the response if it sounds convincing'],
		]),
	},
	{
		id: 'responsibility', dimension: 'understanding',
		prompt: { da: 'Hvor tydeligt skelner du mellem AI’s rolle og dit ansvar?', en: 'How clearly do you separate AI’s role from your responsibility?' },
		context: { da: 'Særligt når resultatet påvirker andre mennesker.', en: 'Especially when the result affects other people.' },
		options: options('understanding', 'responsibility', [
			['Jeg definerer på forhånd, hvad AI må foreslå, og hvad et menneske skal beslutte', 'I define what AI may suggest and what a person must decide'],
			['Jeg beholder altid den endelige vurdering og godkendelse', 'I always retain final judgement and approval'],
			['Jeg vurderer ansvaret undervejs fra opgave til opgave', 'I judge responsibility case by case as I work'],
			['Jeg har ikke tænkt meget over rollefordelingen endnu', 'I have not thought much about the division of roles yet'],
		]),
	},
	{
		id: 'data', dimension: 'understanding',
		prompt: { da: 'Hvordan beslutter du, hvilke oplysninger du kan dele med AI?', en: 'How do you decide what information you can share with AI?' },
		context: { da: 'Tænk på persondata, fortrolighed og virksomhedens regler.', en: 'Consider personal data, confidentiality, and workplace policies.' },
		options: options('understanding', 'data', [
			['Jeg følger klare regler og minimerer eller anonymiserer data før brug', 'I follow clear rules and minimise or anonymise data before use'],
			['Jeg stopper op og vurderer følsomhed, før jeg deler noget', 'I pause and assess sensitivity before sharing anything'],
			['Jeg undgår åbenlyst fortrolige oplysninger', 'I avoid obviously confidential information'],
			['Jeg er usikker på, hvilke data der er forsvarlige at dele', 'I am unsure which data is safe to share'],
		]),
	},
	{
		id: 'briefing', dimension: 'practice',
		prompt: { da: 'Hvordan sætter du AI ind i en konkret arbejdsopgave?', en: 'How do you brief AI for a specific work task?' },
		context: { da: 'Se på den kontekst og retning, du giver fra start.', en: 'Consider the context and direction you provide at the start.' },
		options: options('practice', 'briefing', [
			['Jeg giver mål, modtager, kontekst, krav og eksempel på et godt resultat', 'I provide goal, audience, context, constraints, and an example of a good result'],
			['Jeg beskriver opgaven, formatet og de vigtigste krav', 'I describe the task, format, and key requirements'],
			['Jeg skriver kort, hvad jeg vil have hjælp til', 'I briefly state what I want help with'],
			['Jeg starter ofte med et meget bredt spørgsmål', 'I often begin with a very broad question'],
		]),
	},
	{
		id: 'iteration', dimension: 'practice',
		prompt: { da: 'Hvad gør du, når AI’s første svar ikke er godt nok?', en: 'What do you do when AI’s first response is not good enough?' },
		context: { da: 'Tænk på din seneste opgave med flere runder.', en: 'Think of your latest task that needed several rounds.' },
		options: options('practice', 'iteration', [
			['Jeg giver præcis feedback, tilføjer manglende kontekst og sammenligner versioner', 'I give precise feedback, add missing context, and compare versions'],
			['Jeg forklarer, hvad der skal ændres, og prøver igen', 'I explain what needs changing and try again'],
			['Jeg omskriver selv de dele, der ikke fungerer', 'I rewrite the parts that do not work myself'],
			['Jeg opgiver ofte AI og løser opgaven som før', 'I often give up on AI and solve the task as before'],
		]),
	},
	{
		id: 'workflow', dimension: 'practice',
		prompt: { da: 'Hvordan bruger du AI i tilbagevendende opgaver?', en: 'How do you use AI in recurring tasks?' },
		context: { da: 'Et workflow har et kendt input, arbejdstrin og kvalitetstjek.', en: 'A workflow has a known input, steps, and quality check.' },
		options: options('practice', 'workflow', [
			['Jeg bruger et dokumenteret workflow med skabelon og fast kvalitetstjek', 'I use a documented workflow with a template and fixed quality check'],
			['Jeg genbruger en god fremgangsmåde og tilpasser den til opgaven', 'I reuse a good approach and adapt it to the task'],
			['Jeg starter som regel en ny chat og finder fremgangsmåden igen', 'I usually start a new chat and rediscover the approach'],
			['Jeg bruger sjældent AI til tilbagevendende opgaver', 'I rarely use AI for recurring tasks'],
		]),
	},
	{
		id: 'quality', dimension: 'practice',
		prompt: { da: 'Hvordan afgør du, om et AI-resultat er klar til brug?', en: 'How do you decide whether an AI result is ready to use?' },
		context: { da: 'Vælg din normale afslutning på opgaven.', en: 'Choose how you normally finish the task.' },
		options: options('practice', 'quality', [
			['Jeg kontrollerer resultatet mod tydelige kriterier, kilder og modtagerens behov', 'I check the result against clear criteria, sources, and audience needs'],
			['Jeg gennemgår fakta, tone og om opgaven er løst', 'I review facts, tone, and whether the task is solved'],
			['Jeg retter sprog og de mest synlige fejl', 'I correct language and the most visible errors'],
			['Jeg har ikke et fast kvalitetstjek', 'I do not have a consistent quality check'],
		]),
	},
	{
		id: 'routine', dimension: 'adoption',
		prompt: { da: 'Hvor fast en del af din arbejdsdag er AI?', en: 'How established is AI in your workday?' },
		context: { da: 'Se på vaner – ikke på hvor mange værktøjer du har prøvet.', en: 'Consider habits—not how many tools you have tried.' },
		options: options('adoption', 'routine', [
			['AI indgår bevidst i flere faste arbejdsgange hver uge', 'AI is deliberately part of several regular workflows each week'],
			['AI er et naturligt første stop for nogle typer opgaver', 'AI is a natural first stop for some types of work'],
			['Jeg bruger AI til enkelte opgaver, når jeg kommer i tanke om det', 'I use AI for individual tasks when I remember it'],
			['Jeg bruger kun AI lejlighedsvis', 'I only use AI occasionally'],
		]),
	},
	{
		id: 'reuse', dimension: 'adoption',
		prompt: { da: 'Hvad sker der med dine bedste prompts og arbejdsgange?', en: 'What happens to your best prompts and workflows?' },
		context: { da: 'Tænk på, om din læring kan findes og bruges igen.', en: 'Consider whether your learning can be found and reused.' },
		options: options('adoption', 'reuse', [
			['De er samlet, navngivet, løbende forbedret og nemme at genbruge', 'They are collected, named, improved, and easy to reuse'],
			['Jeg gemmer de bedste i et system, jeg kan finde igen', 'I save the best ones in a system I can find again'],
			['Jeg gemmer nogle chats eller kopierer enkelte prompts', 'I save some chats or copy individual prompts'],
			['De fleste forsvinder, når opgaven er slut', 'Most disappear when the task is finished'],
		]),
	},
	{
		id: 'sharing', dimension: 'adoption',
		prompt: { da: 'Hvordan deler du AI-erfaringer med andre?', en: 'How do you share AI experience with others?' },
		context: { da: 'Hvis du arbejder alene, så tænk på dokumentation til dit fremtidige jeg.', en: 'If you work alone, think of documentation for your future self.' },
		options: options('adoption', 'sharing', [
			['Vi deler afprøvede metoder, fejl og kvalitetskriterier systematisk', 'We systematically share tested methods, failures, and quality criteria'],
			['Jeg viser jævnligt andre det, der har virket', 'I regularly show others what has worked'],
			['Jeg deler enkelte tips, når det er relevant', 'I share individual tips when relevant'],
			['Min brug af AI er mest individuel og udokumenteret', 'My AI use is mostly individual and undocumented'],
		]),
	},
	{
		id: 'improvement', dimension: 'adoption',
		prompt: { da: 'Hvordan forbedrer du din brug af AI over tid?', en: 'How do you improve your use of AI over time?' },
		context: { da: 'Tænk på, hvordan du opdager, hvad der bør ændres.', en: 'Think about how you notice what should change.' },
		options: options('adoption', 'improvement', [
			['Jeg følger kvalitet og tidsforbrug og justerer arbejdsgangen bevidst', 'I track quality and time, then deliberately adjust the workflow'],
			['Jeg evaluerer jævnligt, hvad der virker, og ændrer min tilgang', 'I regularly evaluate what works and change my approach'],
			['Jeg forbedrer min tilgang, når noget tydeligt går galt', 'I improve my approach when something clearly goes wrong'],
			['Jeg gentager ofte samme brug uden at evaluere den', 'I often repeat the same use without evaluating it'],
		]),
	},
];

export function calculateWorkCompass(answers: Record<string, string>): AssessmentResult {
	const totals = emptyScore();
	const maximums = emptyScore();

	for (const question of workCompassQuestions) {
		const selected = question.options.find((option) => option.id === answers[question.id]);
		if (!selected) throw new Error(`Missing answer for ${question.id}`);

		for (const dimension of dimensions) {
			totals[dimension] += selected.scores[dimension];
			maximums[dimension] += Math.max(...question.options.map((option) => option.scores[dimension]));
		}
	}

	const normalized = Object.fromEntries(dimensions.map((dimension) => [
		dimension,
		maximums[dimension] === 0 ? 0 : Math.round((totals[dimension] / maximums[dimension]) * 100),
	])) as Record<AssessmentDimension, number>;
	const overall = Math.round(dimensions.reduce((sum, dimension) => sum + normalized[dimension], 0) / dimensions.length);
	const strongestDimension = [...dimensions].sort((a, b) => normalized[b] - normalized[a])[0];
	const growthDimension = [...dimensions].sort((a, b) => normalized[a] - normalized[b] || dimensions.indexOf(b) - dimensions.indexOf(a))[0];
	const stage: AssessmentStage = overall >= 75
		? 'orchestrator'
		: overall >= 50
			? 'practitioner'
			: overall >= 25
				? 'explorer'
				: 'starter';

	return { dimensions: normalized, overall, stage, strongestDimension, growthDimension };
}
