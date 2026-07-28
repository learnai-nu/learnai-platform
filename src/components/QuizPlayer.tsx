import { useMemo, useState, type SyntheticEvent } from 'react';
import type {
	QuizQuestionView,
	QuizResult,
	QuizSubmission,
	QuizView,
} from '../lib/quiz/contracts';

interface Props {
	quiz: QuizView;
}

type DraftAnswer = {
	selectedOptionIds: string[];
	freeTextAnswer: string;
};

function emptyAnswers(questions: QuizQuestionView[]) {
	return Object.fromEntries(
		questions.map((question) => [
			question.id,
			{ selectedOptionIds: [], freeTextAnswer: '' } satisfies DraftAnswer,
		]),
	);
}

export default function QuizPlayer({ quiz }: Props) {
	const [answers, setAnswers] = useState<Record<string, DraftAnswer>>(() => emptyAnswers(quiz.questions));
	const [state, setState] = useState<'idle' | 'submitting' | 'error' | 'result'>('idle');
	const [errorMessage, setErrorMessage] = useState('');
	const [result, setResult] = useState<QuizResult | null>(null);
	const resultByQuestion = useMemo(
		() => new Map(result?.questions.map((question) => [question.question_id, question]) ?? []),
		[result],
	);

	function selectSingle(questionId: string, optionId: string) {
		setAnswers((current) => ({
			...current,
			[questionId]: { ...current[questionId], selectedOptionIds: [optionId] },
		}));
	}

	function toggleMultiple(questionId: string, optionId: string) {
		setAnswers((current) => {
			const answer = current[questionId];
			const selected = answer.selectedOptionIds.includes(optionId)
				? answer.selectedOptionIds.filter((id) => id !== optionId)
				: [...answer.selectedOptionIds, optionId];
			return { ...current, [questionId]: { ...answer, selectedOptionIds: selected } };
		});
	}

	function updateFreeText(questionId: string, value: string) {
		setAnswers((current) => ({
			...current,
			[questionId]: { ...current[questionId], freeTextAnswer: value },
		}));
	}

	function allQuestionsAnswered() {
		return quiz.questions.every((question) => {
			const answer = answers[question.id];
			return question.type === 'free_text'
				? answer.freeTextAnswer.trim().length > 0
				: answer.selectedOptionIds.length > 0;
		});
	}

	async function submitQuiz(event: SyntheticEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!allQuestionsAnswered()) {
			setState('error');
			setErrorMessage('Besvar alle spørgsmål, før du afleverer quizzen.');
			return;
		}

		setState('submitting');
		setErrorMessage('');

		const submission: QuizSubmission = {
			quizId: quiz.id,
			answers: quiz.questions.map((question) => ({
				questionId: question.id,
				selectedOptionIds: answers[question.id].selectedOptionIds,
				freeTextAnswer: answers[question.id].freeTextAnswer.trim() || null,
			})),
		};

		try {
			const response = await fetch('/api/quizzes/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(submission),
			});
			const body = await response.json() as QuizResult | { message?: string };
			if (!response.ok) {
				throw new Error('message' in body && body.message ? body.message : 'Quizzen kunne ikke afleveres.');
			}
			setResult(body as QuizResult);
			setState('result');
		} catch (error) {
			setState('error');
			setErrorMessage(error instanceof Error ? error.message : 'Quizzen kunne ikke afleveres.');
		}
	}

	function tryAgain() {
		setAnswers(emptyAnswers(quiz.questions));
		setResult(null);
		setErrorMessage('');
		setState('idle');
	}

	if (quiz.questions.length === 0) {
		return (
			<section className="quiz-panel empty-state">
				<h2>Quizzen er ved at blive gjort klar</h2>
				<p>Der er endnu ingen spørgsmål.</p>
			</section>
		);
	}

	return (
		<section className="quiz-panel" aria-labelledby="quiz-title">
			<div className="quiz-heading">
				<p className="eyebrow">Afsluttende quiz</p>
				<h2 id="quiz-title">{quiz.title}</h2>
				{quiz.description && <p>{quiz.description}</p>}
				<p className="quiz-rules">
					Beståelseskrav: {quiz.passingScore}%
					{quiz.maxAttempts ? ` · Maks. ${quiz.maxAttempts} forsøg` : ' · Ubegrænsede forsøg'}
				</p>
			</div>

			{state === 'result' && result ? (
				<div className="quiz-result" aria-live="polite">
					<div className={result.passed ? 'result-score passed' : 'result-score not-passed'}>
						<span>{result.passed ? 'Bestået' : 'Ikke bestået endnu'}</span>
						<strong>{result.score}%</strong>
						<small>Krav: {result.passing_score}%</small>
					</div>
					<div className="quiz-feedback-list">
						{quiz.questions.map((question, index) => {
							const feedback = resultByQuestion.get(question.id);
							return (
								<article className="quiz-feedback" key={question.id}>
									<h3>
										{feedback?.is_correct ? '✓' : feedback?.is_correct === false ? '×' : '–'}{' '}
										{index + 1}. {question.question}
									</h3>
									<p>{feedback?.explanation ?? 'Der er ingen forklaring til spørgsmålet endnu.'}</p>
								</article>
							);
						})}
					</div>
					{result.attempts_remaining !== 0 && (
						<button className="button button-ghost" type="button" onClick={tryAgain}>
							Prøv quizzen igen
						</button>
					)}
				</div>
			) : (
				<form className="quiz-form" onSubmit={submitQuiz}>
					{quiz.questions.map((question, index) => (
						<fieldset className="quiz-question" key={question.id} disabled={state === 'submitting'}>
							<legend>{index + 1}. {question.question}</legend>
							{question.type === 'free_text' ? (
								<textarea
									value={answers[question.id].freeTextAnswer}
									onChange={(event) => updateFreeText(question.id, event.target.value)}
									maxLength={5000}
									rows={5}
								/>
							) : (
								<div className="quiz-options">
									{question.options.map((option) => {
										const multiple = question.type === 'multiple_choice';
										const checked = answers[question.id].selectedOptionIds.includes(option.id);
										return (
											<label className="quiz-option" key={option.id}>
												<input
													type={multiple ? 'checkbox' : 'radio'}
													name={`question-${question.id}`}
													value={option.id}
													checked={checked}
													onChange={() => multiple
														? toggleMultiple(question.id, option.id)
														: selectSingle(question.id, option.id)}
												/>
												<span>{option.optionText}</span>
											</label>
										);
									})}
								</div>
							)}
						</fieldset>
					))}

					{state === 'error' && <p className="notice notice-error" role="alert">{errorMessage}</p>}
					<button className="button" type="submit" disabled={state === 'submitting'}>
						{state === 'submitting' ? 'Bedømmer sikkert…' : 'Aflever quiz'}
					</button>
					<p className="form-status" aria-live="polite">
						{state === 'submitting' ? 'Svarene gemmes og bedømmes på serveren.' : ''}
					</p>
				</form>
			)}
		</section>
	);
}
