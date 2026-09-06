import { z } from 'zod';

/** Virksomhedsstørrelser skal matche enum'en public.business_lead_size. */
export const companySizes = ['1-9', '10-49', '50-249', '250+'] as const;
export type CompanySize = (typeof companySizes)[number];

export const companySizeLabels: Record<CompanySize, string> = {
	'1-9': '1-9 medarbejdere',
	'10-49': '10-49 medarbejdere',
	'50-249': '50-249 medarbejdere',
	'250+': '250+ medarbejdere',
};

export const businessLeadSource = 'virksomheder';

/** Feltet "website" er en honeypot: kun bots udfylder det. */
export const businessLeadSchema = z.object({
	name: z.string().trim().min(2).max(120),
	email: z.string().trim().max(254).pipe(z.email()).transform((value) => value.toLowerCase()),
	company: z.string().trim().min(2).max(160),
	roleTitle: z.string().trim().max(120).optional().transform((value) => value || null),
	companySize: z.enum(companySizes).optional().nullable().catch(null),
	goal: z.string().trim().max(2000).optional().transform((value) => value || ''),
	consent: z.literal('yes'),
	website: z.string().max(0).optional(),
});

export type BusinessLeadInput = z.input<typeof businessLeadSchema>;

export function toBusinessLeadRow(input: z.output<typeof businessLeadSchema>) {
	return {
		name: input.name,
		work_email: input.email,
		company: input.company,
		role_title: input.roleTitle,
		company_size: input.companySize ?? null,
		goal: input.goal,
		source: businessLeadSource,
	};
}

/** Statusværdier skal matche enum'en public.business_lead_status. */
export const leadStatuses = ['new', 'contacted', 'qualified', 'won', 'lost'] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export const leadStatusLabels: Record<LeadStatus, string> = {
	new: 'Ny',
	contacted: 'Kontaktet',
	qualified: 'Kvalificeret',
	won: 'Vundet',
	lost: 'Tabt',
};

export const leadStatusSchema = z.object({
	id: z.uuid(),
	status: z.enum(leadStatuses),
});
