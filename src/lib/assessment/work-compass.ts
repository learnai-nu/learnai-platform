export type AssessmentLocale = 'da' | 'en';
export type AssessmentDimension = 'understanding' | 'practice' | 'adoption';

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
	stage: 'explorer' | 'practitioner' | 'orchestrator';
	strongestDimension: AssessmentDimension;
	growthDimension: AssessmentDimension;
}

const score = (understanding: number, practice: number, adoption: number): ScoreVector => ({
	understanding,
	practice,
	adoption,
});

export const workCompassQuestions: AssessmentQuestion[] = [
	{
		id: 'capabilities',
		dimension: 'understanding',
		prompt: {
			da: 'Hvordan vurderer du, hvad AI kan hjælpe dig med?',
			en: 'How do you decide what AI can help you with?',
		},
		context: {
			da: 'Vælg det svar, der bedst beskriver din hverdag lige nu.',
			en: 'Choose the answer that best describes your work today.',
		},
		options: [
			{
				id: 'capabilities-map',
				label: {
					da: 'Jeg matcher opgaven med AI’s styrker, begrænsninger og risici',
					en: 'I match the task with AI’s strengths, limits, and risks',
				},
				scores: score(4, 2, 1),
			},
			{
				id: 'capabilities-experiment',
				label: {
					da: 'Jeg afprøver forskellige værktøjer og vurderer resultatet bagefter',
					en: 'I try different tools and evaluate the result afterwards',
				},
				scores: score(3, 3, 1),
			},
			{
				id: 'capabilities-chat',
				label: {
					da: 'Jeg bruger primært AI til spørgsmål, idéer og tekst',
					en: 'I mainly use AI for questions, ideas, and writing',
				},
				scores: score(2, 1, 0),
			},
			{
				id: 'capabilities-starting',
				label: {
					da: 'Jeg er stadig ved at finde ud af, hvor AI giver mening',
					en: 'I am still figuring out where AI is useful',
				},
				scores: score(0, 0, 0),
			},
		],
	},
	{
		id: 'workflow',
		dimension: 'practice',
		prompt: {
			da: 'Hvad sker der, når du får en opgave, du tidligere løste manuelt?',
			en: 'What happens when you receive a task you used to do manually?',
		},
		context: {
			da: 'Tænk på en reel opgave fra den seneste uge.',
			en: 'Think of a real task from the past week.',
		},
		options: [
			{
				id: 'workflow-system',
				label: {
					da: 'Jeg bruger eller bygger et gentageligt AI-workflow med tydelig QA',
					en: 'I use or build a repeatable AI workflow with a clear QA step',
				},
				scores: score(2, 4, 3),
			},
			{
				id: 'workflow-collaborate',
				label: {
					da: 'Jeg giver AI kontekst, itererer og kontrollerer resultatet',
					en: 'I give AI context, iterate, and check the result',
				},
				scores: score(2, 3, 1),
			},
			{
				id: 'workflow-first-draft',
				label: {
					da: 'Jeg beder AI om et første udkast og arbejder videre selv',
					en: 'I ask AI for a first draft and continue the work myself',
				},
				scores: score(1, 2, 0),
			},
			{
				id: 'workflow-manual',
				label: {
					da: 'Jeg løser som regel opgaven på samme måde som før',
					en: 'I usually solve the task the same way as before',
				},
				scores: score(0, 0, 0),
			},
		],
	},
	{
		id: 'routine',
		dimension: 'adoption',
		prompt: {
			da: 'Hvor tydeligt er AI forankret i din arbejdsdag?',
			en: 'How firmly is AI embedded in your workday?',
		},
		context: {
			da: 'Se på vaner og samarbejde – ikke på hvor mange værktøjer du har prøvet.',
			en: 'Consider habits and collaboration—not how many tools you have tried.',
		},
		options: [
			{
				id: 'routine-operating-model',
				label: {
					da: 'Opgaver, roller og kvalitetstjek er bevidst tilrettelagt omkring AI',
					en: 'Tasks, roles, and quality checks are deliberately designed around AI',
				},
				scores: score(2, 3, 4),
			},
			{
				id: 'routine-default',
				label: {
					da: 'AI er mit naturlige første stop for flere typer vidensarbejde',
					en: 'AI is my natural first stop for several kinds of knowledge work',
				},
				scores: score(2, 2, 3),
			},
			{
				id: 'routine-specific',
				label: {
					da: 'Jeg bruger AI til nogle få tilbagevendende opgaver',
					en: 'I use AI for a few recurring tasks',
				},
				scores: score(1, 2, 2),
			},
			{
				id: 'routine-occasional',
				label: {
					da: 'Jeg åbner AI en gang imellem til enkeltstående spørgsmål',
					en: 'I occasionally open AI for one-off questions',
				},
				scores: score(1, 1, 0),
			},
		],
	},
];

const dimensions: AssessmentDimension[] = ['understanding', 'practice', 'adoption'];

export function calculateWorkCompass(answers: Record<string, string>): AssessmentResult {
	const totals: ScoreVector = score(0, 0, 0);
	const maximums: ScoreVector = score(0, 0, 0);

	for (const question of workCompassQuestions) {
		const selected = question.options.find((option) => option.id === answers[question.id]);
		if (!selected) throw new Error(`Missing answer for ${question.id}`);

		for (const dimension of dimensions) {
			totals[dimension] += selected.scores[dimension];
			maximums[dimension] += Math.max(...question.options.map((option) => option.scores[dimension]));
		}
	}

	const normalized = Object.fromEntries(
		dimensions.map((dimension) => [
			dimension,
			maximums[dimension] === 0 ? 0 : Math.round((totals[dimension] / maximums[dimension]) * 100),
		]),
	) as Record<AssessmentDimension, number>;
	const overall = Math.round(dimensions.reduce((sum, dimension) => sum + normalized[dimension], 0) / dimensions.length);
	const strongestDimension = [...dimensions].sort((a, b) => normalized[b] - normalized[a])[0];
	const growthDimension = [...dimensions].sort((a, b) => normalized[a] - normalized[b])[0];

	return {
		dimensions: normalized,
		overall,
		stage: overall >= 67 ? 'orchestrator' : overall >= 34 ? 'practitioner' : 'explorer',
		strongestDimension,
		growthDimension,
	};
}
