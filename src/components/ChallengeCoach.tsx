import { useEffect, useRef, useState } from 'react';
import {
	challengeAdviceResponseSchema,
	challengeQuestionsResponseSchema,
	type ChallengeAdviceResponse,
} from '../lib/ai/contracts';

interface Props {
	authenticated: boolean;
}

type Clarification = { question: string; answer: string };

async function readError(response: Response) {
	try {
		const payload = await response.json() as { message?: unknown };
		return typeof payload.message === 'string' ? payload.message : 'AI-sparringen kunne ikke svare lige nu.';
	} catch {
		return 'AI-sparringen kunne ikke svare lige nu.';
	}
}

export default function ChallengeCoach({ authenticated }: Props) {
	const [challenge, setChallenge] = useState('');
	const [questions, setQuestions] = useState<string[]>([]);
	const [clarifications, setClarifications] = useState<Clarification[]>([]);
	const [currentAnswer, setCurrentAnswer] = useState('');
	const [result, setResult] = useState<ChallengeAdviceResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const questionHeading = useRef<HTMLHeadingElement>(null);

	const questionIndex = clarifications.length;
	const currentQuestion = questions[questionIndex];

	useEffect(() => {
		if (currentQuestion) questionHeading.current?.focus();
	}, [currentQuestion]);

	async function start(event: React.SyntheticEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmed = challenge.trim();
		if (trimmed.length < 20) {
			setError('Beskriv udfordringen med mindst 20 tegn. Et par sætninger er nok.');
			return;
		}
		setLoading(true);
		setError('');
		try {
			const response = await fetch('/api/ai/challenge-coach', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ step: 'questions', challenge: trimmed }),
			});
			if (!response.ok) throw new Error(await readError(response));
			const parsed = challengeQuestionsResponseSchema.safeParse(await response.json());
			if (!parsed.success) throw new Error('AI-sparringen returnerede ikke tre brugbare spørgsmål.');
			setChallenge(trimmed);
			setQuestions(parsed.data.questions);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : 'AI-sparringen kunne ikke svare lige nu.');
		} finally {
			setLoading(false);
		}
	}

	async function submitAnswer(answer: string) {
		if (!answer || !currentQuestion) {
			setError('Skriv et kort svar, eller vælg “Det ved jeg ikke endnu”.');
			return;
		}
		const previousClarifications = clarifications;
		const nextClarifications = [...clarifications, { question: currentQuestion, answer }];
		setClarifications(nextClarifications);
		setCurrentAnswer('');
		setError('');

		if (nextClarifications.length < 3) return;

		setLoading(true);
		try {
			const response = await fetch('/api/ai/challenge-coach', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ step: 'advice', challenge, clarifications: nextClarifications }),
			});
			if (!response.ok) throw new Error(await readError(response));
			const parsed = challengeAdviceResponseSchema.safeParse(await response.json());
			if (!parsed.success) throw new Error('AI-sparringen returnerede ikke et brugbart svar.');
			setResult(parsed.data);
		} catch (caught) {
			setClarifications(previousClarifications);
			setCurrentAnswer(answer);
			const message = caught instanceof Error ? caught.message : 'AI-sparringen kunne ikke svare lige nu.';
			setError(`${message} Dit svar er bevaret – prøv igen.`);
		} finally {
			setLoading(false);
		}
	}

	async function answerQuestion(event: React.SyntheticEvent<HTMLFormElement>) {
		event.preventDefault();
		await submitAnswer(currentAnswer.trim());
	}

	function reset() {
		setChallenge('');
		setQuestions([]);
		setClarifications([]);
		setCurrentAnswer('');
		setResult(null);
		setError('');
	}

	return (
		<section className="challenge-coach" aria-labelledby="challenge-coach-title">
			<header className="challenge-coach-head">
				<div>
					<p className="challenge-coach-kicker">Din øvelse</p>
					<h2 id="challenge-coach-title">Fra udfordring til næste skridt</h2>
				</div>
				<span className="challenge-coach-time">Ca. 12 min.</span>
			</header>

			{!authenticated ? (
				<div className="challenge-coach-login">
					<div><strong>Log ind for at prøve øvelsen</strong><p>Samtalen gemmes ikke af LearnAI.</p></div>
					<a className="button" href="/login">Log ind</a>
				</div>
			) : result ? (
				<div className="challenge-coach-result">
					<div className="challenge-coach-result-head">
						<div><p className="challenge-coach-kicker">Din sparring</p><h3>Et svar med en vej videre</h3></div>
						<button type="button" className="challenge-coach-text-button" onClick={reset}>Start forfra</button>
					</div>
					<div className="challenge-coach-answer" dangerouslySetInnerHTML={{ __html: result.answerHtml }} />
					<aside className="challenge-coach-reflection">
						<strong>Læg mærke til forskellen</strong>
						<p>Hvad blev mere præcist, fordi AI stillede spørgsmål, før den svarede?</p>
					</aside>
				</div>
			) : questions.length > 0 ? (
				<div className="challenge-coach-dialogue" aria-busy={loading}>
					<ol className="challenge-coach-steps" aria-label="Tre opklarende spørgsmål">
						{questions.map((_, index) => (
							<li className={index < questionIndex ? 'is-complete' : index === questionIndex ? 'is-current' : ''}>
								<span>{index < questionIndex ? '✓' : index + 1}</span><small>Spørgsmål {index + 1}</small>
							</li>
						))}
					</ol>
					{loading ? (
						<div className="challenge-coach-loading" role="status"><span aria-hidden="true"></span><strong>Samler din sparring…</strong></div>
					) : currentQuestion ? (
						<form onSubmit={answerQuestion}>
							<p className="challenge-coach-kicker">Spørgsmål {questionIndex + 1} af 3</p>
							<h3 ref={questionHeading} tabIndex={-1}>{currentQuestion}</h3>
							<label htmlFor="challenge-answer">Dit svar</label>
							<textarea id="challenge-answer" rows={5} maxLength={1200} value={currentAnswer} onChange={(event) => setCurrentAnswer(event.target.value)} />
							<div className="challenge-coach-actions">
								<button type="button" className="challenge-coach-text-button" onClick={() => void submitAnswer('Det ved jeg ikke endnu.')}>Det ved jeg ikke endnu</button>
								<button className="button" type="submit">{questionIndex === 2 ? 'Få min sparring' : 'Næste spørgsmål →'}</button>
							</div>
						</form>
					) : null}
					{error && <p className="notice notice-error" role="alert">{error}</p>}
				</div>
			) : (
				<form className="challenge-coach-start" onSubmit={start} aria-busy={loading}>
					<label htmlFor="challenge-description">Hvad vil du gerne have sparring på?</label>
					<p id="challenge-help">Beskriv situationen, hvad der gør den vanskelig, og hvad du gerne vil opnå. Et par sætninger er nok.</p>
					<textarea
						id="challenge-description"
						rows={7}
						maxLength={2000}
						value={challenge}
						onChange={(event) => setChallenge(event.target.value)}
						placeholder="Fx: Jeg skal prioritere mellem flere vigtige opgaver, men alle interessenter mener, at deres opgave haster…"
						aria-describedby="challenge-help challenge-privacy"
					/>
					<div className="challenge-coach-actions"><span>{challenge.length}/2.000</span><button className="button" type="submit" disabled={loading}>{loading ? 'Forbereder spørgsmål…' : 'Stil mig tre spørgsmål →'}</button></div>
					<p className="challenge-coach-privacy" id="challenge-privacy"><strong>Del kun det nødvendige.</strong> Undgå personfølsomme, fortrolige og kundespecifikke oplysninger. LearnAI gemmer ikke samtalen i din profil. Teksten behandles hos OpenAI for at danne spørgsmål og sparring.</p>
					{error && <p className="notice notice-error" role="alert">{error}</p>}
				</form>
			)}
		</section>
	);
}
