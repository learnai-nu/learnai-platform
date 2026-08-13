import { useState } from 'react';
import { mentorResponseSchema, type MentorResponse } from '../lib/ai/contracts';

interface Props {
	profileComplete: boolean;
}

const suggestions = [
	'Hvordan kommer jeg bedst i gang med AI i mit arbejde?',
	'Hvilken prompt-teknik bør jeg lære som den næste?',
	'Lav en enkel læringsplan for mine næste 30 dage.',
];

export default function AIMentor({ profileComplete }: Props) {
	const [question, setQuestion] = useState('');
	const [result, setResult] = useState<MentorResponse | null>(null);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmed = question.trim();
		if (trimmed.length < 3) {
			setError('Skriv et lidt mere konkret spørgsmål.');
			return;
		}
		setLoading(true);
		setError('');
		setResult(null);
		try {
			const response = await fetch('/api/ai/mentor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question: trimmed }),
			});
			const payload: unknown = await response.json();
			if (!response.ok) {
				const message = payload && typeof payload === 'object' && 'message' in payload
					? String(payload.message)
					: 'AI Mentor kunne ikke svare lige nu.';
				throw new Error(message);
			}
			const parsed = mentorResponseSchema.safeParse(payload);
			if (!parsed.success) throw new Error('AI Mentor returnerede et ugyldigt svar.');
			setResult(parsed.data);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : 'AI Mentor kunne ikke svare lige nu.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mentor-workspace">
			{!profileComplete && (
				<aside className="mentor-profile-nudge">
					<div>
						<strong>Få mere personlige anbefalinger</strong>
						<p>Fortæl kort om din rolle, branche og dine læringsmål.</p>
					</div>
					<a className="button button-ghost button-small" href="/dashboard/profil">Udfyld profil</a>
				</aside>
			)}

			<div className="mentor-grid">
				<section className="mentor-composer" aria-labelledby="mentor-question-title">
					<div>
						<p className="eyebrow">Dit spørgsmål</p>
						<h2 id="mentor-question-title">Hvad vil du lære eller løse?</h2>
					</div>
					<form onSubmit={submit}>
						<label htmlFor="mentor-question">Spørg AI Mentor</label>
						<textarea
							id="mentor-question"
							maxLength={1200}
							rows={7}
							value={question}
							onChange={(event) => setQuestion(event.target.value)}
							placeholder="Fx: Jeg er marketingchef. Hvilke tre AI-kompetencer bør jeg prioritere først?"
							aria-describedby="mentor-privacy"
						/>
						<div className="mentor-submit-row">
							<span>{question.length}/1.200</span>
							<button className="button" type="submit" disabled={loading}>
								{loading ? 'Finder svar…' : 'Spørg AI Mentor'}
							</button>
						</div>
					</form>
					<div className="mentor-suggestions" aria-label="Forslag til spørgsmål">
						{suggestions.map((suggestion) => (
							<button type="button" key={suggestion} onClick={() => setQuestion(suggestion)}>{suggestion}</button>
						))}
					</div>
					<p className="mentor-privacy" id="mentor-privacy">Din samtale gemmes ikke af LearnAI. Del ikke fortrolige oplysninger.</p>
				</section>

				<section className="mentor-answer" aria-live="polite" aria-busy={loading}>
					{loading ? (
						<div className="mentor-loading">
							<span aria-hidden="true"></span>
							<div><strong>Finder den bedste vej…</strong><p>Jeg gennemgår godkendt LearnAI-indhold.</p></div>
						</div>
					) : error ? (
						<div className="notice notice-error" role="alert"><strong>Det lykkedes ikke</strong><p>{error}</p></div>
					) : result ? (
						<>
							<div className="mentor-answer-head">
								<div><p className="eyebrow">AI-genereret svar</p><h2>Mit forslag</h2></div>
								<span>{result.remaining} spørgsmål tilbage i dag</span>
							</div>
							<div
								className="mentor-answer-copy"
								dangerouslySetInnerHTML={{ __html: result.answerHtml }}
							/>
							<div className="mentor-sources">
								<h3>Kilder fra LearnAI</h3>
								<ul>{result.sources.map((source, index) => (
									<li key={`${source.type}:${source.url ?? source.title}`}>
										{source.url ? (
											<a href={source.url}><span>[{index + 1}] {source.type}</span><strong>{source.title}</strong></a>
										) : (
											<div className="mentor-source-card"><span>Dokumentkilde</span><strong>{source.title}</strong></div>
										)}
									</li>
								))}</ul>
							</div>
						</>
					) : (
						<div className="mentor-empty">
							<div className="mentor-orbit" aria-hidden="true"><span>AI</span></div>
							<h2>Et svar med en vej videre</h2>
							<p>Du får et konkret svar, næste skridt og links til det LearnAI-indhold, svaret bygger på.</p>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
