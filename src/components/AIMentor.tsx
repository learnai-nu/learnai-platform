import { useState } from 'react';
import { mentorResponseSchema, type MentorResponse } from '../lib/ai/contracts';

interface Props {
	profileComplete: boolean;
}

const suggestions = [
	'Hvordan kommer jeg bedst i gang med AI i mit arbejde?',
	'Hvilken prompt-teknik bÃ¸r jeg lÃ¦re som den nÃ¦ste?',
	'Lav en enkel lÃ¦ringsplan for mine nÃ¦ste 30 dage.',
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
			setError('Skriv et lidt mere konkret spÃ¸rgsmÃ¥l.');
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
						<strong>FÃ¥ mere personlige anbefalinger</strong>
						<p>FortÃ¦l kort om din rolle, branche og dine lÃ¦ringsmÃ¥l.</p>
					</div>
					<a className="button button-ghost button-small" href="/dashboard/profil">Udfyld profil</a>
				</aside>
			)}

			<div className="mentor-grid">
				<section className="mentor-composer" aria-labelledby="mentor-question-title">
					<div>
						<p className="eyebrow">Dit spÃ¸rgsmÃ¥l</p>
						<h2 id="mentor-question-title">Hvad vil du lÃ¦re eller lÃ¸se?</h2>
					</div>
					<form onSubmit={submit}>
						<label htmlFor="mentor-question">SpÃ¸rg AI Mentor</label>
						<textarea
							id="mentor-question"
							maxLength={1200}
							rows={7}
							value={question}
							onChange={(event) => setQuestion(event.target.value)}
							placeholder="Fx: Jeg er marketingchef. Hvilke tre AI-kompetencer bÃ¸r jeg prioritere fÃ¸rst?"
							aria-describedby="mentor-privacy"
						/>
						<div className="mentor-submit-row">
							<span>{question.length}/1.200</span>
							<button className="button" type="submit" disabled={loading}>
								{loading ? 'Finder svarâ€¦' : 'SpÃ¸rg AI Mentor'}
							</button>
						</div>
					</form>
					<div className="mentor-suggestions" aria-label="Forslag til spÃ¸rgsmÃ¥l">
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
							<div><strong>Finder den bedste vejâ€¦</strong><p>Jeg gennemgÃ¥r godkendt LearnAI-indhold.</p></div>
						</div>
					) : error ? (
						<div className="notice notice-error" role="alert"><strong>Det lykkedes ikke</strong><p>{error}</p></div>
					) : result ? (
						<>
							<div className="mentor-answer-head">
								<div><p className="eyebrow">AI-genereret svar</p><h2>Mit forslag</h2></div>
								<span>{result.remaining} spÃ¸rgsmÃ¥l tilbage i dag</span>
							</div>
							<div className="mentor-answer-copy">{result.answer}</div>
							<div className="mentor-sources">
								<h3>Kilder fra LearnAI</h3>
								<ul>{result.sources.map((source, index) => (
									<li key={source.url}><a href={source.url}><span>[{index + 1}] {source.type}</span><strong>{source.title}</strong></a></li>
								))}</ul>
							</div>
						</>
					) : (
						<div className="mentor-empty">
							<div className="mentor-orbit" aria-hidden="true"><span>AI</span></div>
							<h2>Et svar med en vej videre</h2>
							<p>Du fÃ¥r et konkret svar, nÃ¦ste skridt og links til det LearnAI-indhold, svaret bygger pÃ¥.</p>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
