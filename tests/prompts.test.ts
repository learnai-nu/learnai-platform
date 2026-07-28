import { describe, expect, it } from 'vitest';
import {
	buildPrompt,
	missingRequiredFields,
	parsePromptDefinition,
	promptDefinitionSchema,
} from '../src/lib/prompts/contracts';

const definition = promptDefinitionSchema.parse({
	version: 1,
	template: 'Skriv om [EMNE] til [MÅLGRUPPE]. Tone: [TONE].',
	fields: [
		{
			key: 'emne',
			token: '[EMNE]',
			label: 'Emne',
			placeholder: 'Fx ansvarlig AI',
			input_type: 'text',
			required: true,
			options: [],
		},
		{
			key: 'maalgruppe',
			token: '[MÅLGRUPPE]',
			label: 'Målgruppe',
			placeholder: 'Fx ledere',
			input_type: 'text',
			required: true,
			options: [],
		},
		{
			key: 'tone',
			token: '[TONE]',
			label: 'Tone',
			placeholder: '',
			input_type: 'select',
			required: true,
			options: ['Professionel', 'Uformel'],
		},
	],
	privacy_notice: 'Del ikke fortrolige oplysninger.',
	tool_note: null,
});

describe('promptkontrakt', () => {
	it('læser kun en gyldig promptdefinition fra metadata', () => {
		expect(parsePromptDefinition({ prompt_definition: definition })).toEqual(definition);
		expect(parsePromptDefinition({ prompt_definition: { version: 2 } })).toBeNull();
		expect(parsePromptDefinition(null)).toBeNull();
	});

	it('bygger prompten uden at ændre skabelonen', () => {
		expect(buildPrompt(definition, {
			emne: 'AI-governance',
			maalgruppe: 'ledere',
			tone: 'Professionel',
		})).toBe('Skriv om AI-governance til ledere. Tone: Professionel.');
		expect(definition.template).toContain('[EMNE]');
	});

	it('bevarer tokens for tomme felter og rapporterer de obligatoriske', () => {
		expect(buildPrompt(definition, { emne: 'AI' })).toContain('[MÅLGRUPPE]');
		expect(missingRequiredFields(definition, { emne: 'AI' })).toEqual(['maalgruppe', 'tone']);
	});
});
