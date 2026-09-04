/**
 * Converts Supabase table exports from the old Lovable site into idempotent
 * insert-statements for public.tools, public.use_cases, public.resources and
 * public.events.
 *
 *   node scripts/prepare-catalog.mjs <mappe-med-eksporter> [output.sql]
 *
 * The export folder is expected to hold JSON arrays whose file names contain
 * "tools", "use_cases" and "resources" — i.e. the raw table exports. Only
 * published Danish rows are kept; the site is Danish only. Output defaults to
 * stdout, so det kan skrives ind i en ny migration efter gennemlæsning.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const exportDir = resolve(process.cwd(), process.argv[2] ?? '.');
const outputPath = process.argv[3] ? resolve(process.cwd(), process.argv[3]) : null;

function text(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function slugify(value) {
	return text(value)
		.toLocaleLowerCase('da')
		.replaceAll('æ', 'ae')
		.replaceAll('ø', 'oe')
		.replaceAll('å', 'aa')
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/** Imported bullets carry decorative emoji, numbering and truncation stubs, in both languages. */
function cleanBullets(values) {
	return (values ?? [])
		.map((value) => text(value).replace(/^[✅🚀\s]+/u, '').replace(/^(Gevinst|Benefit) \d+:\s*/, '').trim())
		.filter((value) => value.length > 0 && !/^\+ ?\d+ (flere funktioner|more features)$/i.test(value));
}

/**
 * Lovable needed globally unique slugs, so its English rows carry an "-en"
 * suffix. Our unique key is (slug, locale), so the suffix is dropped and the
 * two languages line up on the same slug where the source paired them.
 */
function slug(row) {
	return row.locale === 'en' ? text(row.slug).replace(/-en$/, '') : text(row.slug);
}

function literal(value) {
	if (value === null || value === undefined) return 'null';
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	if (typeof value === 'number') return String(value);
	return `'${String(value).replaceAll("'", "''")}'`;
}

function textArray(values) {
	return values?.length ? `array[${values.map(literal).join(', ')}]::text[]` : "'{}'";
}

function published(rows) {
	return rows.filter((row) => row.published && (row.locale === 'da' || row.locale === 'en'));
}

/** Rows are grouped by locale and numbered from zero within each language. */
function ordered(rows, compare) {
	return ['da', 'en'].flatMap((locale) =>
		rows
			.filter((row) => row.locale === locale)
			.sort(compare)
			.map((row, index) => ({ row, index })),
	);
}

async function readExport(files, needle) {
	const match = files.find((file) => file.includes(needle) && file.endsWith('.json'));
	if (!match) throw new Error(`Fandt ingen eksport for "${needle}" i ${exportDir}`);
	return JSON.parse(await readFile(resolve(exportDir, match), 'utf8'));
}

function insert(table, columns, rows) {
	return [
		`insert into public.${table} (${columns.join(', ')}) values`,
		rows.map((row) => `  (${row.join(', ')})`).join(',\n'),
		'on conflict (slug, locale) do nothing;',
		'',
	].join('\n');
}

const files = await readdir(exportDir);

const tools = ordered(published(await readExport(files, 'tools')), (a, b) => a.name.localeCompare(b.name, 'da'))
	.map(({ row, index }) => [
		literal(slug(row)),
		literal(row.name),
		literal(text(row.tagline)),
		literal(text(row.description)),
		literal(row.icon_url ?? null),
		textArray(row.categories),
		textArray(row.badges),
		textArray(cleanBullets(row.key_features)),
		literal(row.pricing_display ?? null),
		literal(row.external_url ?? null),
		literal(Boolean(row.featured)),
		'true',
		literal(row.locale),
		String(index),
	]);

const useCases = ordered(
	published(await readExport(files, 'use_cases')),
	(a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title, 'da'),
)
	.map(({ row, index }) => [
		literal(slug(row)),
		literal(row.title),
		literal(row.hbr_id ?? null),
		literal(row.department),
		literal(row.complexity),
		literal(row.strategic_value),
		literal(text(row.problem_statement)),
		literal(text(row.the_solution)),
		textArray(cleanBullets(row.business_benefits)),
		textArray(row.recommended_tools),
		literal(Boolean(row.featured)),
		'true',
		literal(row.locale),
		String(index),
	]);

const resources = ordered(
	published(await readExport(files, 'resources')),
	(a, b) => a.type.localeCompare(b.type, 'da') || a.title.localeCompare(b.title, 'da'),
)
	.map(({ row, index }) => [
		literal(slugify(row.title)),
		literal(row.title),
		literal(row.type),
		literal(row.url),
		literal(text(row.description)),
		literal(row.rating ?? null),
		textArray(row.topics),
		literal(row.content_language === 'en' ? 'en' : 'da'),
		'true',
		literal(row.locale),
		String(index),
	]);

const events = ordered(
	published(await readExport(files, 'events')),
	(a, b) => String(a.event_date).localeCompare(String(b.event_date)),
)
	.map(({ row, index }) => [
		literal(slug(row)),
		literal(row.title),
		literal(text(row.description)),
		literal(row.event_date),
		literal(row.time_start ?? null),
		literal(row.time_end ?? null),
		literal(row.location_type),
		literal(row.location_name ?? null),
		literal(row.registration_url ?? null),
		literal(row.organizer ?? null),
		literal(row.price ?? null),
		'true',
		literal(row.locale),
		String(index),
	]);

const sql = [
	'-- Genereret med scripts/prepare-catalog.mjs. Læs igennem før den lægges i en migration.',
	insert('tools', ['slug', 'name', 'tagline', 'description', 'icon_url', 'categories', 'badges', 'key_features', 'pricing_display', 'external_url', 'featured', 'published', 'locale', 'sort_order'], tools),
	insert('use_cases', ['slug', 'title', 'reference', 'department', 'complexity', 'strategic_value', 'problem_statement', 'solution', 'business_benefits', 'recommended_tools', 'featured', 'published', 'locale', 'sort_order'], useCases),
	insert('resources', ['slug', 'title', 'type', 'url', 'description', 'rating', 'topics', 'content_language', 'published', 'locale', 'sort_order'], resources),
	insert('events', ['slug', 'title', 'description', 'event_date', 'time_start', 'time_end', 'location_type', 'location_name', 'registration_url', 'organizer', 'price', 'published', 'locale', 'sort_order'], events),
].join('\n');

if (outputPath) {
	await writeFile(outputPath, sql, 'utf8');
	console.error(`tools: ${tools.length}, use_cases: ${useCases.length}, resources: ${resources.length}, events: ${events.length} → ${outputPath}`);
} else {
	process.stdout.write(sql);
}
