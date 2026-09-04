/**
 * Converts Supabase table exports from the old Lovable site into idempotent
 * insert-statements for public.tools, public.use_cases and public.resources.
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

/** Imported bullets carry decorative emoji, numbering and "+ N flere funktioner" stubs. */
function cleanBullets(values) {
	return (values ?? [])
		.map((value) => text(value).replace(/^[✅🚀\s]+/u, '').replace(/^Gevinst \d+:\s*/, '').trim())
		.filter((value) => value.length > 0 && !/^\+ ?\d+ flere funktioner$/i.test(value));
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
	return rows.filter((row) => row.locale === 'da' && row.published);
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

const tools = published(await readExport(files, 'tools'))
	.sort((a, b) => a.name.localeCompare(b.name, 'da'))
	.map((row, index) => [
		literal(row.slug),
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
		"'da'",
		String(index),
	]);

const useCases = published(await readExport(files, 'use_cases'))
	.sort((a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title, 'da'))
	.map((row, index) => [
		literal(row.slug),
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
		"'da'",
		String(index),
	]);

const resources = published(await readExport(files, 'resources'))
	.sort((a, b) => a.type.localeCompare(b.type, 'da') || a.title.localeCompare(b.title, 'da'))
	.map((row, index) => [
		literal(slugify(row.title)),
		literal(row.title),
		literal(row.type),
		literal(row.url),
		literal(text(row.description)),
		literal(row.rating ?? null),
		textArray(row.topics),
		'true',
		"'da'",
		String(index),
	]);

const sql = [
	'-- Genereret med scripts/prepare-catalog.mjs. Læs igennem før den lægges i en migration.',
	insert('tools', ['slug', 'name', 'tagline', 'description', 'icon_url', 'categories', 'badges', 'key_features', 'pricing_display', 'external_url', 'featured', 'published', 'locale', 'sort_order'], tools),
	insert('use_cases', ['slug', 'title', 'reference', 'department', 'complexity', 'strategic_value', 'problem_statement', 'solution', 'business_benefits', 'recommended_tools', 'featured', 'published', 'locale', 'sort_order'], useCases),
	insert('resources', ['slug', 'title', 'type', 'url', 'description', 'rating', 'topics', 'published', 'locale', 'sort_order'], resources),
].join('\n');

if (outputPath) {
	await writeFile(outputPath, sql, 'utf8');
	console.error(`tools: ${tools.length}, use_cases: ${useCases.length}, resources: ${resources.length} → ${outputPath}`);
} else {
	process.stdout.write(sql);
}
