export interface AdminContentFilterItem {
	title: string;
	type: string;
	status: string;
}

export interface AdminContentFilters {
	query: string;
	type: string;
	status: string;
}

function normalize(value: string) {
	return value.trim().toLocaleLowerCase('da-DK');
}

export function matchesAdminContentFilters(
	item: AdminContentFilterItem,
	filters: AdminContentFilters,
) {
	const query = normalize(filters.query);
	const matchesQuery = !query || normalize(item.title).includes(query);
	const matchesType = !filters.type || item.type === filters.type;
	const matchesStatus = !filters.status || item.status === filters.status;

	return matchesQuery && matchesType && matchesStatus;
}
