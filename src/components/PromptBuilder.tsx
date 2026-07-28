import { useMemo, useState } from 'react';
import {
	buildPrompt,
	missingRequiredFields,
	type PromptDefinition,
	type PromptValues,
} from '../lib/prompts/contracts';

interface Props {
	definition: PromptDefinition;
	title: string;
}

export default function PromptBuilder({ definition, title }: Props) {
	const [values, setValues] = useState<PromptValues>({});
	const [attempted, setAttempted] = useState(false);
	const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
	const missing = useMemo(
		() => new Set(missingRequiredFields(definition, values)),
		[definition, values],
	);
	const prompt = useMemo(() => buildPrompt(definition, values), [definition, values]);

	function update(key: string, value: string) {
		setValues((current) => ({ ...current, [key]: value }));
		setCopyState('idle');
	}

	async function copyPrompt() {
		setAttempted(true);
		if (missing.size > 0) return;

		try {
			await navigator.clipboard.writeText(prompt);
			setCopyState('copied');
		} catch {
			setCopyState('error');
		}
	}

	return (
		<section className="prompt-builder" aria-labelledby="prompt-builder-title">
			<div className="prompt-builder-head">
				<div>
					<p className="eyebrow">Promptværksted</p>
					<h2 id="prompt-builder-title">Tilpas {title.toLocaleLowerCase('da-DK')}</h2>
					<p>Udfyld felterne. Din færdige prompt bliver bygget direkte i browseren.</p>
				</div>
				<span className="privacy-badge">Ingen input gemmes</span>
			</div>

			<div className="prompt-builder-grid">
				<form className="prompt-fields" onSubmit={(event) => event.preventDefault()}>
					{definition.fields.map((field) => {
						const invalid = attempted && missing.has(field.key);
						return (
							<label key={field.key}>
								{field.label}
								{field.input_type === 'textarea' ? (
									<textarea
										rows={5}
										value={values[field.key] ?? ''}
										placeholder={field.placeholder}
										aria-invalid={invalid}
										aria-describedby={invalid ? `${field.key}-error` : undefined}
										onChange={(event) => update(field.key, event.target.value)}
									/>
								) : field.input_type === 'select' ? (
									<select
										value={values[field.key] ?? ''}
										aria-invalid={invalid}
										aria-describedby={invalid ? `${field.key}-error` : undefined}
										onChange={(event) => update(field.key, event.target.value)}
									>
										<option value="">Vælg…</option>
										{field.options.map((option) => <option key={option} value={option}>{option}</option>)}
									</select>
								) : (
									<input
										value={values[field.key] ?? ''}
										placeholder={field.placeholder}
										aria-invalid={invalid}
										aria-describedby={invalid ? `${field.key}-error` : undefined}
										onChange={(event) => update(field.key, event.target.value)}
									/>
								)}
								{invalid && <small className="field-error" id={`${field.key}-error`}>Udfyld feltet.</small>}
							</label>
						);
					})}
				</form>

				<div className="prompt-output">
					<div className="prompt-output-head">
						<h3>Din færdige prompt</h3>
						<button className="button button-small" type="button" onClick={copyPrompt}>
							{copyState === 'copied' ? 'Kopieret ✓' : 'Kopiér prompt'}
						</button>
					</div>
					<pre aria-live="polite">{prompt}</pre>
					{attempted && missing.size > 0 && (
						<p className="form-status field-error" role="alert">Udfyld de markerede felter først.</p>
					)}
					{copyState === 'error' && (
						<p className="form-status field-error" role="alert">
							Prompten kunne ikke kopieres automatisk. Markér teksten og kopiér den manuelt.
						</p>
					)}
				</div>
			</div>

			<aside className="prompt-safety">
				<strong>Brug AI ansvarligt</strong>
				<p>{definition.privacy_notice}</p>
				{definition.tool_note && <p>{definition.tool_note}</p>}
			</aside>
		</section>
	);
}
