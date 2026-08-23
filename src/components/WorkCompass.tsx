import { useEffect, useRef, useState } from 'react';
import {
	calculateWorkCompass,
	workCompassQuestions,
	type AssessmentDimension,
	type AssessmentLocale,
} from '../lib/assessment/work-compass';

const copy = {
	da: {
		label: 'Dit AI-arbejdskompas',
		introTitle: 'Find dit næste gode AI-træk',
		introBody: '12 konkrete spørgsmål viser, hvor du står i forståelse, praksis og forankring – og giver dig en læringsrute, du kan bruge med det samme.',
		start: 'Start kompasset',
		privacy: '12 spørgsmål · cirka 4 minutter · ingen lagring',
		back: 'Tilbage', next: 'Næste spørgsmål', results: 'Se min læringsrute',
		question: 'Spørgsmål', of: 'af', part: 'Del', choose: 'Vælg ét svar for at fortsætte.',
		resultLabel: 'Dit personlige øjebliksbillede', resultTitle: 'Dit arbejdskompas peger mod',
		strongest: 'Det har du bedst fat i', growth: 'Her får du mest ud af at begynde',
		planTitle: 'Din læringsrute i tre trin', planBody: 'Begynd med dit største udviklingspunkt. Fortsæt derefter rundt i kompasset.',
		takeawayTitle: 'Tag læringsruten med dig', takeawayBody: 'Kopiér en tekstversion til dine noter, eller brug browserens dialog til at gemme resultatet som PDF.',
		copyPlan: 'Kopiér min plan', copied: 'Planen er kopieret', copyError: 'Planen kunne ikke kopieres. Markér teksten manuelt eller prøv igen.', printPlan: 'Gem som PDF / udskriv',
		restart: 'Tag kompasset igen', methodTitle: 'Sådan er resultatet beregnet',
		method: 'Hver af de tre retninger bygger på fire svar. Hvert svar giver 0–3 point, som omregnes til en procent. Den samlede score er gennemsnittet af de tre retninger. Ved ens score vises den første retning som styrke og den sidste som udviklingspunkt, så du altid får to forskellige pejlemærker. Resultatet er en læringsvejviser – ikke en certificering eller personlighedstest.',
		dimensions: { understanding: 'Forståelse', practice: 'Praksis', adoption: 'Forankring' },
		stages: {
			starter: { title: 'Klar til første skridt', body: 'Du har et godt udgangspunkt for at gøre AI konkret: én opgave, én sikker metode og ét lille forsøg ad gangen.' },
			explorer: { title: 'Nysgerrig udforsker', body: 'Du har begyndt at finde de steder, hvor AI hjælper. Næste gevinst kommer fra tydeligere metode og mere bevidst kvalitet.' },
			practitioner: { title: 'Praktisk medspiller', body: 'Du bruger AI aktivt. Nu kan du gøre dine bedste greb gentagelige og bygge dem ind i en stabil arbejdsrytme.' },
			orchestrator: { title: 'Bevidst orkestrator', body: 'Du arbejder systematisk med AI og har blik for ansvar, kvalitet og læring. Dit næste niveau er at dele og forbedre metoden.' },
		},
		strengths: {
			understanding: 'Du ser tydeligt, hvad AI kan bidrage med, og hvor menneskelig vurdering fortsat er afgørende.',
			practice: 'Du kan omsætte en opgave til et brugbart samarbejde med AI og kontrollere resultatet.',
			adoption: 'Du er godt i gang med at gøre AI til en genbrugelig og lærende del af din arbejdsdag.',
		},
		growths: {
			understanding: 'Skab et sikrere beslutningsgrundlag, før du vælger værktøj, data og rollefordeling.',
			practice: 'Gør dine instruktioner, iterationer og kvalitetstjek mere konkrete og gentagelige.',
			adoption: 'Flyt dine bedste enkeltforsøg ind i faste vaner, skabeloner og fælles læring.',
		},
		plans: {
			understanding: { eyebrow: 'Afklar opgaven', title: 'Lav et AI-opgavekort', body: 'Vælg én arbejdsopgave. Notér hvad AI må gøre, hvad du skal kontrollere, og hvad kun et menneske må beslutte.', cta: 'Se LearnAI-guides', href: '/laer' },
			practice: { eyebrow: 'Byg metoden', title: 'Gør én opgave gentagelig', body: 'Beskriv den som input → AI-arbejde → kvalitetstjek → færdigt resultat. Afprøv den to gange og ret skabelonen.', cta: 'Start gratiskurset', href: '/kurser/ai-i-praksis-dit-foerste-kursus' },
			adoption: { eyebrow: 'Forankr vanen', title: 'Planlæg næste gentagelse', body: 'Vælg et fast tidspunkt i næste uge. Gem din metode, og notér bagefter én forbedring til næste gang.', cta: 'Spørg AI Mentor', href: '/mentor' },
		},
	},
	en: {
		label: 'Your AI Work Compass',
		introTitle: 'Find your next good AI move',
		introBody: '12 concrete questions show where you stand in understanding, practice, and adoption—and give you a learning route you can use right away.',
		start: 'Start the compass',
		privacy: '12 questions · about 4 minutes · no storage',
		back: 'Back', next: 'Next question', results: 'See my learning route',
		question: 'Question', of: 'of', part: 'Part', choose: 'Choose one answer to continue.',
		resultLabel: 'Your personal snapshot', resultTitle: 'Your work compass points towards',
		strongest: 'Your strongest direction', growth: 'The best place to begin',
		planTitle: 'Your three-step learning route', planBody: 'Begin with your largest growth area, then continue around the compass.',
		takeawayTitle: 'Take your learning route with you', takeawayBody: 'Copy a text version to your notes, or use your browser’s dialog to save the result as a PDF.',
		copyPlan: 'Copy my plan', copied: 'Plan copied', copyError: 'The plan could not be copied. Select the text manually or try again.', printPlan: 'Save as PDF / print',
		restart: 'Take the compass again', methodTitle: 'How the result is calculated',
		method: 'Each of the three directions is based on four answers. Every answer scores 0–3 points, converted to a percentage. Your overall score is the average of all three directions. For tied scores, the first direction is shown as the strength and the last as the growth area, so you always get two distinct signals. The result is a learning guide—not a certification or personality test.',
		dimensions: { understanding: 'Understanding', practice: 'Practice', adoption: 'Adoption' },
		stages: {
			starter: { title: 'Ready for the first step', body: 'You have a sound starting point for making AI concrete: one task, one safe method, and one small experiment at a time.' },
			explorer: { title: 'Curious explorer', body: 'You are finding the places where AI helps. Your next gain comes from a clearer method and more deliberate quality checks.' },
			practitioner: { title: 'Practical collaborator', body: 'You use AI actively. Now make your strongest moves repeatable and build them into a stable work rhythm.' },
			orchestrator: { title: 'Intentional orchestrator', body: 'You work systematically with AI and consider responsibility, quality, and learning. Your next level is sharing and improving the method.' },
		},
		strengths: {
			understanding: 'You clearly see what AI can contribute and where human judgement remains essential.',
			practice: 'You can turn a task into useful collaboration with AI and check the result.',
			adoption: 'You are making AI a reusable and learning part of your workday.',
		},
		growths: {
			understanding: 'Build a safer basis for deciding on tools, data, and the division of roles.',
			practice: 'Make your instructions, iterations, and quality checks more concrete and repeatable.',
			adoption: 'Move your best individual experiments into habits, templates, and shared learning.',
		},
		plans: {
			understanding: { eyebrow: 'Clarify the task', title: 'Make an AI task card', body: 'Choose one work task. Note what AI may do, what you must check, and what only a person may decide.', cta: 'Explore LearnAI guides', href: '/laer' },
			practice: { eyebrow: 'Build the method', title: 'Make one task repeatable', body: 'Describe it as input → AI work → quality check → finished result. Test it twice and improve the template.', cta: 'Start the free course', href: '/kurser/ai-i-praksis-dit-foerste-kursus' },
			adoption: { eyebrow: 'Anchor the habit', title: 'Schedule the next repeat', body: 'Choose a fixed time next week. Save your method, then note one improvement for next time.', cta: 'Ask AI Mentor', href: '/mentor' },
		},
	},
} as const;

const dimensionOrder: AssessmentDimension[] = ['understanding', 'practice', 'adoption'];

function CompassGraphic({ values, labels }: { values: Record<AssessmentDimension, number>; labels: Record<AssessmentDimension, string> }) {
	const center = 100;
	const radius = 78;
	const points = dimensionOrder.map((dimension, index) => {
		const angle = (-90 + index * 120) * Math.PI / 180;
		const value = values[dimension] / 100;
		return `${center + Math.cos(angle) * radius * value},${center + Math.sin(angle) * radius * value}`;
	}).join(' ');

	return (
		<svg className="work-compass-graphic" viewBox="0 0 200 200" role="img" aria-label={dimensionOrder.map((dimension) => `${labels[dimension]}: ${values[dimension]}%`).join(', ')}>
			<polygon className="work-compass-grid work-compass-grid-outer" points="100,22 167.55,139 32.45,139" />
			<polygon className="work-compass-grid" points="100,61 133.78,119.5 66.22,119.5" />
			<line x1="100" y1="100" x2="100" y2="22" /><line x1="100" y1="100" x2="167.55" y2="139" /><line x1="100" y1="100" x2="32.45" y2="139" />
			<polygon className="work-compass-value" points={points} />
			{points.split(' ').map((point, index) => { const [cx, cy] = point.split(','); return <circle key={dimensionOrder[index]} cx={cx} cy={cy} r="5" />; })}
		</svg>
	);
}

export default function WorkCompass() {
	const [locale, setLocale] = useState<AssessmentLocale>('da');
	const [screen, setScreen] = useState<'intro' | 'questions' | 'result'>('intro');
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [actionStatus, setActionStatus] = useState<'idle' | 'copied' | 'copy-error'>('idle');
	const rootRef = useRef<HTMLElement>(null);
	const headingRef = useRef<HTMLHeadingElement>(null);
	const t = copy[locale];
	const question = workCompassQuestions[currentQuestion];
	const selected = question ? answers[question.id] : undefined;

	useEffect(() => {
		if (screen !== 'intro') {
			rootRef.current?.scrollIntoView({ block: 'start' });
			headingRef.current?.focus({ preventScroll: true });
		}
	}, [screen, currentQuestion]);

	function start() { setCurrentQuestion(0); setScreen('questions'); }
	function continueAssessment() {
		if (!selected) return;
		if (currentQuestion === workCompassQuestions.length - 1) { setScreen('result'); return; }
		setCurrentQuestion((value) => value + 1);
	}
	function restart() { setAnswers({}); setCurrentQuestion(0); setActionStatus('idle'); setScreen('intro'); }

	const result = screen === 'result' ? calculateWorkCompass(answers) : null;
	const previewValues = Object.fromEntries(dimensionOrder.map((dimension) => [dimension, 18])) as Record<AssessmentDimension, number>;
	const questionPart = question ? dimensionOrder.indexOf(question.dimension) + 1 : 1;
	const learningOrder = result
		? [result.growthDimension, ...dimensionOrder.filter((dimension) => dimension !== result.growthDimension)]
		: dimensionOrder;

	async function copyLearningPlan() {
		if (!result) return;
		const lines = [
			t.label,
			`${t.stages[result.stage].title} · ${result.overall}/100`,
			'',
			...dimensionOrder.map((dimension) => `${t.dimensions[dimension]}: ${result.dimensions[dimension]}%`),
			'',
			`${t.strongest}: ${t.dimensions[result.strongestDimension]}`,
			t.strengths[result.strongestDimension],
			'',
			`${t.growth}: ${t.dimensions[result.growthDimension]}`,
			t.growths[result.growthDimension],
			'',
			t.planTitle,
			...learningOrder.flatMap((dimension, index) => {
				const plan = t.plans[dimension];
				return [`${index + 1}. ${plan.title}`, plan.body];
			}),
			'',
			'LearnAI.nu/arbejdskompas',
		];
		try {
			await navigator.clipboard.writeText(lines.join('\n'));
			setActionStatus('copied');
		} catch {
			setActionStatus('copy-error');
		}
	}

	return (
		<section ref={rootRef} className="work-compass" aria-labelledby="work-compass-title" lang={locale === 'da' ? 'da' : 'en'}>
			<div className="work-compass-toolbar">
				<span id="work-compass-title">{t.label}</span>
				<div className="work-compass-locale" aria-label="Language · Sprog">
					<button type="button" aria-pressed={locale === 'da'} onClick={() => setLocale('da')}>DA</button>
					<button type="button" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>EN</button>
				</div>
			</div>

			{screen === 'intro' && (
				<div className="work-compass-intro">
					<div>
						<p className="work-compass-kicker">{t.label}</p><h1>{t.introTitle}</h1><p className="work-compass-lead">{t.introBody}</p>
						<button className="work-compass-primary" type="button" onClick={start}>{t.start}<span aria-hidden="true">→</span></button>
						<p className="work-compass-privacy">{t.privacy}</p>
					</div>
					<div className="work-compass-signature" aria-hidden="true">
						<CompassGraphic values={previewValues} labels={t.dimensions} />
						<span className="compass-label compass-label-understanding">01</span><span className="compass-label compass-label-practice">02</span><span className="compass-label compass-label-adoption">03</span>
					</div>
				</div>
			)}

			{screen === 'questions' && question && (
				<div className="work-compass-question-shell">
					<div className="work-compass-question-meta"><span>{t.part} {questionPart} / 3 · {t.dimensions[question.dimension]}</span><span>{t.question} {currentQuestion + 1} {t.of} {workCompassQuestions.length}</span></div>
					<div className="work-compass-progress" role="progressbar" aria-valuemin={1} aria-valuemax={workCompassQuestions.length} aria-valuenow={currentQuestion + 1}><span style={{ width: `${((currentQuestion + 1) / workCompassQuestions.length) * 100}%` }} /></div>
					<div className="work-compass-question-grid">
						<div><p className="work-compass-kicker">{t.dimensions[question.dimension]}</p><h2 ref={headingRef} tabIndex={-1}>{question.prompt[locale]}</h2><p>{question.context[locale]}</p></div>
						<fieldset className="work-compass-options"><legend className="sr-only">{question.prompt[locale]}</legend>
							{question.options.map((option) => <label key={option.id} className={selected === option.id ? 'is-selected' : ''}><input type="radio" name={question.id} value={option.id} checked={selected === option.id} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))} /><span>{option.label[locale]}</span></label>)}
						</fieldset>
					</div>
					<div className="work-compass-navigation">
						<button type="button" className="work-compass-secondary" onClick={() => currentQuestion === 0 ? setScreen('intro') : setCurrentQuestion((value) => value - 1)}>{t.back}</button>
						{!selected && <span role="status">{t.choose}</span>}
						<button type="button" className="work-compass-primary" disabled={!selected} onClick={continueAssessment}>{currentQuestion === workCompassQuestions.length - 1 ? t.results : t.next}<span aria-hidden="true">→</span></button>
					</div>
				</div>
			)}

			{screen === 'result' && result && (
				<div className="work-compass-result">
					<div className="work-compass-result-heading"><p className="work-compass-kicker">{t.resultLabel}</p><h2 ref={headingRef} tabIndex={-1}>{t.resultTitle} <span>{t.stages[result.stage].title}</span></h2><p>{t.stages[result.stage].body}</p></div>
					<div className="work-compass-result-grid">
						<div className="work-compass-chart-card"><CompassGraphic values={result.dimensions} labels={t.dimensions} /><strong>{result.overall}<small>/100</small></strong><ul>{dimensionOrder.map((dimension) => <li key={dimension}><span>{t.dimensions[dimension]}</span><b>{result.dimensions[dimension]}%</b></li>)}</ul></div>
						<div className="work-compass-insights">
							<article><span>{t.strongest}</span><h3>{t.dimensions[result.strongestDimension]}</h3><p>{t.strengths[result.strongestDimension]}</p></article>
							<article><span>{t.growth}</span><h3>{t.dimensions[result.growthDimension]}</h3><p>{t.growths[result.growthDimension]}</p></article>
						</div>
					</div>
					<section className="work-compass-learning-plan" aria-labelledby="learning-plan-title">
						<div><p className="work-compass-kicker">LearnAI · næste skridt</p><h3 id="learning-plan-title">{t.planTitle}</h3><p>{t.planBody}</p></div>
						<ol>{learningOrder.map((dimension, index) => { const plan = t.plans[dimension]; return <li key={dimension} className={index === 0 ? 'is-priority' : ''}><span className="work-compass-step">0{index + 1}</span><small>{plan.eyebrow}</small><h4>{plan.title}</h4><p>{plan.body}</p><a href={plan.href}>{plan.cta}<b aria-hidden="true">→</b></a></li>; })}</ol>
					</section>
					<section className="work-compass-takeaway" aria-labelledby="takeaway-title">
						<div><p className="work-compass-kicker">LearnAI · dit resultat</p><h3 id="takeaway-title">{t.takeawayTitle}</h3><p>{t.takeawayBody}</p></div>
						<div className="work-compass-takeaway-actions">
							<button type="button" className="work-compass-primary" onClick={copyLearningPlan}>{t.copyPlan}<span aria-hidden="true">{actionStatus === 'copied' ? '✓' : '⧉'}</span></button>
							<button type="button" className="work-compass-secondary" onClick={() => window.print()}>{t.printPlan}<span aria-hidden="true">↗</span></button>
						</div>
						<p className={`work-compass-copy-status${actionStatus === 'copy-error' ? ' is-error' : ''}`} role="status" aria-live="polite">{actionStatus === 'copy-error' ? t.copyError : actionStatus === 'copied' ? t.copied : ''}</p>
					</section>
					<div className="work-compass-result-footer"><details><summary>{t.methodTitle}</summary><p>{t.method}</p></details><button type="button" className="work-compass-secondary" onClick={restart}>{t.restart}</button></div>
				</div>
			)}
		</section>
	);
}
