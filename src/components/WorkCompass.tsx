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
		introTitle: 'Se hvor AI kan flytte dit arbejde næste gang',
		introBody: 'Tre korte spørgsmål giver dig et øjebliksbillede af din forståelse, praksis og forankring. Svarene forlader ikke din browser.',
		start: 'Start kompasset',
		privacy: '3 spørgsmål · cirka 2 minutter · ingen lagring',
		back: 'Tilbage',
		next: 'Næste spørgsmål',
		results: 'Se mit kompas',
		question: 'Spørgsmål',
		of: 'af',
		choose: 'Vælg ét svar for at fortsætte.',
		resultLabel: 'Dit øjebliksbillede',
		resultTitle: 'Dit arbejdskompas peger mod',
		strongest: 'Din stærkeste retning',
		growth: 'Dit næste udviklingspunkt',
		nextStep: 'Prøv dette som næste skridt',
		restart: 'Tag kompasset igen',
		method: 'Resultatet er en læringsvejviser – ikke en certificering eller personlighedstest.',
		dimensions: { understanding: 'Forståelse', practice: 'Praksis', adoption: 'Forankring' },
		stages: {
			explorer: { title: 'Nysgerrig udforsker', body: 'Du er i gang med at finde de opgaver, hvor AI faktisk gør en forskel.' },
			practitioner: { title: 'Praktisk medspiller', body: 'Du bruger AI aktivt og kan få mere ud af at gøre dine bedste arbejdsgange gentagelige.' },
			orchestrator: { title: 'Bevidst orkestrator', body: 'Du arbejder systematisk med AI og har blik for både delegation, kvalitet og ansvar.' },
		},
		actions: {
			understanding: 'Vælg én arbejdsopgave og skriv tre kolonner: hvad AI må gøre, hvad du skal kontrollere, og hvad kun et menneske må beslutte.',
			practice: 'Tag en tilbagevendende opgave og beskriv den som: input → AI-arbejde → kvalitetstjek → færdigt resultat.',
			adoption: 'Vælg ét fast tidspunkt i næste uge, hvor du bruger dit bedste AI-workflow og noterer, hvad der skal forbedres.',
		},
	},
	en: {
		label: 'Your AI Work Compass',
		introTitle: 'See where AI can move your work next',
		introBody: 'Three short questions give you a snapshot of your understanding, practice, and adoption. Your answers never leave the browser.',
		start: 'Start the compass',
		privacy: '3 questions · about 2 minutes · no storage',
		back: 'Back',
		next: 'Next question',
		results: 'See my compass',
		question: 'Question',
		of: 'of',
		choose: 'Choose one answer to continue.',
		resultLabel: 'Your snapshot',
		resultTitle: 'Your work compass points towards',
		strongest: 'Your strongest direction',
		growth: 'Your next growth area',
		nextStep: 'Try this next',
		restart: 'Take the compass again',
		method: 'This result is a learning guide—not a certification or personality test.',
		dimensions: { understanding: 'Understanding', practice: 'Practice', adoption: 'Adoption' },
		stages: {
			explorer: { title: 'Curious explorer', body: 'You are identifying the tasks where AI can make a real difference.' },
			practitioner: { title: 'Practical collaborator', body: 'You use AI actively and can gain more by making your strongest workflows repeatable.' },
			orchestrator: { title: 'Intentional orchestrator', body: 'You work systematically with AI and consider delegation, quality, and responsibility.' },
		},
		actions: {
			understanding: 'Choose one work task and write three columns: what AI may do, what you must check, and what only a person may decide.',
			practice: 'Take one recurring task and describe it as: input → AI work → quality check → finished result.',
			adoption: 'Choose one fixed time next week to use your best AI workflow and note what needs improving.',
		},
	},
} as const;

const dimensionOrder: AssessmentDimension[] = ['understanding', 'practice', 'adoption'];

function CompassGraphic({
	values,
	labels,
}: {
	values: Record<AssessmentDimension, number>;
	labels: Record<AssessmentDimension, string>;
}) {
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
			<line x1="100" y1="100" x2="100" y2="22" />
			<line x1="100" y1="100" x2="167.55" y2="139" />
			<line x1="100" y1="100" x2="32.45" y2="139" />
			<polygon className="work-compass-value" points={points} />
			{points.split(' ').map((point, index) => {
				const [cx, cy] = point.split(',');
				return <circle key={dimensionOrder[index]} cx={cx} cy={cy} r="5" />;
			})}
		</svg>
	);
}

export default function WorkCompass() {
	const [locale, setLocale] = useState<AssessmentLocale>('da');
	const [screen, setScreen] = useState<'intro' | 'questions' | 'result'>('intro');
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string>>({});
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

	function start() {
		setCurrentQuestion(0);
		setScreen('questions');
	}

	function continueAssessment() {
		if (!selected) return;
		if (currentQuestion === workCompassQuestions.length - 1) {
			setScreen('result');
			return;
		}
		setCurrentQuestion((value) => value + 1);
	}

	function restart() {
		setAnswers({});
		setCurrentQuestion(0);
		setScreen('intro');
	}

	const result = screen === 'result' ? calculateWorkCompass(answers) : null;
	const previewValues = Object.fromEntries(dimensionOrder.map((dimension) => [dimension, 18])) as Record<AssessmentDimension, number>;

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
						<p className="work-compass-kicker">{t.label}</p>
						<h1>{t.introTitle}</h1>
						<p className="work-compass-lead">{t.introBody}</p>
						<button className="work-compass-primary" type="button" onClick={start}>{t.start}<span aria-hidden="true">→</span></button>
						<p className="work-compass-privacy">{t.privacy}</p>
					</div>
					<div className="work-compass-signature" aria-hidden="true">
						<CompassGraphic values={previewValues} labels={t.dimensions} />
						<span className="compass-label compass-label-understanding">01</span>
						<span className="compass-label compass-label-practice">02</span>
						<span className="compass-label compass-label-adoption">03</span>
					</div>
				</div>
			)}

			{screen === 'questions' && question && (
				<div className="work-compass-question-shell">
					<div className="work-compass-question-meta">
						<span>{t.question} {currentQuestion + 1} {t.of} {workCompassQuestions.length}</span>
						<span>{Math.round(((currentQuestion + 1) / workCompassQuestions.length) * 100)}%</span>
					</div>
					<div className="work-compass-progress" role="progressbar" aria-valuemin={1} aria-valuemax={workCompassQuestions.length} aria-valuenow={currentQuestion + 1}>
						<span style={{ width: `${((currentQuestion + 1) / workCompassQuestions.length) * 100}%` }} />
					</div>
					<div className="work-compass-question-grid">
						<div>
							<p className="work-compass-kicker">{t.dimensions[question.dimension]}</p>
							<h2 ref={headingRef} tabIndex={-1}>{question.prompt[locale]}</h2>
							<p>{question.context[locale]}</p>
						</div>
						<fieldset className="work-compass-options">
							<legend className="sr-only">{question.prompt[locale]}</legend>
							{question.options.map((option) => (
								<label key={option.id} className={selected === option.id ? 'is-selected' : ''}>
									<input type="radio" name={question.id} value={option.id} checked={selected === option.id} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))} />
									<span>{option.label[locale]}</span>
								</label>
							))}
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
					<div className="work-compass-result-heading">
						<p className="work-compass-kicker">{t.resultLabel}</p>
						<h2 ref={headingRef} tabIndex={-1}>{t.resultTitle} <span>{t.stages[result.stage].title}</span></h2>
						<p>{t.stages[result.stage].body}</p>
					</div>
					<div className="work-compass-result-grid">
						<div className="work-compass-chart-card">
							<CompassGraphic values={result.dimensions} labels={t.dimensions} />
							<strong>{result.overall}<small>/100</small></strong>
							<ul>
								{dimensionOrder.map((dimension) => <li key={dimension}><span>{t.dimensions[dimension]}</span><b>{result.dimensions[dimension]}%</b></li>)}
							</ul>
						</div>
						<div className="work-compass-insights">
							<article><span>{t.strongest}</span><h3>{t.dimensions[result.strongestDimension]}</h3></article>
							<article><span>{t.growth}</span><h3>{t.dimensions[result.growthDimension]}</h3></article>
							<article className="work-compass-next-action"><span>{t.nextStep}</span><p>{t.actions[result.growthDimension]}</p><a href="/kurser/ai-i-praksis-dit-foerste-kursus">LearnAI · {locale === 'da' ? 'Start gratis' : 'Start free'} <b aria-hidden="true">→</b></a></article>
						</div>
					</div>
					<div className="work-compass-result-footer"><p>{t.method}</p><button type="button" className="work-compass-secondary" onClick={restart}>{t.restart}</button></div>
				</div>
			)}
		</section>
	);
}
