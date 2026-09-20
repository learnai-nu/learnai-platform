import { describe, expect, it } from 'vitest';
import { courseParticipantsSchema, parseParticipantFilters, participantHref, participantProgress } from '../src/lib/admin/course-participants';

describe('participant drill-down', () => {
	it('builds links that preserve course, status, search and page', () => {
		const id = 'a878735a-8b7f-e43c-cc49-fdd9ef09ab08';
		const url = new URL(participantHref(id, 'in_progress', 'Søren & Co', 2), 'https://learnai.nu');
		expect(parseParticipantFilters(url.searchParams)).toMatchObject({ success: true, data: { course: id, status: 'in_progress', q: 'Søren & Co', page: 2 } });
		expect(participantHref()).toBe('/admin/deltagere');
	});
	it('rejects invalid identifiers, filters and unbounded pagination', () => {
		for (const query of ['course=invalid', 'status=admin', 'page=0', 'page=1.2', 'page=100001', `q=${'a'.repeat(101)}`]) {
			expect(parseParticipantFilters(new URLSearchParams(query)).success).toBe(false);
		}
	});
	it('defaults to all participants and the first page', () => {
		expect(parseParticipantFilters(new URLSearchParams())).toMatchObject({ success: true, data: { course: '', status: 'all', q: '', page: 1 } });
	});
	it('never rounds an unfinished course to 100%', () => {
		expect(participantProgress(0, 0)).toBe(0);
		expect(participantProgress(1, 3)).toBe(33);
		expect(participantProgress(200, 201)).toBe(99);
		expect(participantProgress(3, 3)).toBe(100);
	});
	it('accepts an empty page and fails closed on missing data', () => {
		expect(courseParticipantsSchema.safeParse({ total: 0, pageSize: 50, items: [] }).success).toBe(true);
		expect(courseParticipantsSchema.safeParse(null).success).toBe(false);
	});
});
