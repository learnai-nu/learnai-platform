/**
 * Converts Supabase table exports from the old Lovable site into the JSON files
 * that /tools, /use-cases and /resources are built from.
 *
 *   node scripts/prepare-catalog.mjs <mappe-med-eksporter>
 *
 * The export folder is expected to hold JSON arrays whose file names contain
 * "tools", "use_cases" and "resources" — i.e. the raw table exports. Only
 * published Danish rows are kept; the site itself is Danish only.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const dataDir = resolve(projectRoot, 'src', 'data');
const exportDir = resolve(process.cwd(), process.argv[2] ?? '.');

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
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/** Imported bullets carry decorative emoji, numbering and "+ N flere funktioner" stubs. */
function cleanBullets(values) {
	return (values ?? [])
		.map((value) => text(value).replace(/^[✅🚀\s]+/, '').replace(/^Gevinst \d+:\s*/, '').trim())
		.filter((value) => value.length > 0 && !/^\+ ?\d+ flere funktioner$/i.test(value));
}

function published(rows) {
	return rows.filter((row) => row.locale === 'da' && row.published);
}

async function readExport(files, needle) {
	const match = files.find((file) => file.includes(needle) && file.endsWith('.json'));
	if (!match) throw new Error(`Fandt ingen eksport for "${needle}" i ${exportDir}`);
	return JSON.parse(await readFile(resolve(exportDir, match), 'utf8'));
}

async function write(name, rows) {
	await writeFile(resolve(dataDir, `${name}.json`), `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`${name}: ${rows.length} rækker`);
}

const files = await readdir(exportDir);

const tools = published(await readExport(files, 'tools'))
	.sort((a, b) => a.name.localeCompare(b.name, 'da'))
	.map((row) => ({
		slug: row.slug,
		name: row.name,
		tagline: text(row.tagline),
		description: text(row.description),
		iconUrl: row.icon_url ?? null,
		categories: row.categories ?? [],
		badges: row.badges ?? [],
		keyFeatures: cleanBullets(row.key_features),
		pricing: row.pricing_display ?? null,
		url: row.external_url ?? null,
		featured: Boolean(row.featured),
	}));

const useCases = published(await readExport(files, 'use_cases'))
	.sort((a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title, 'da'))
	.map((row) => ({
		slug: row.slug,
		title: row.title,
		reference: row.hbr_id ?? null,
		department: row.department,
		complexity: row.complexity,
		strategicValue: row.strategic_value,
		problem: text(row.problem_statement),
		solution: text(row.the_solution),
		benefits: cleanBullets(row.business_benefits),
		recommendedTools: row.recommended_tools ?? [],
		featured: Boolean(row.featured),
	}));

const resources = published(await readExport(files, 'resources'))
	.sort((a, b) => a.type.localeCompare(b.type, 'da') || a.title.localeCompare(b.title, 'da'))
	.map((row) => ({
		slug: slugify(row.title),
		title: row.title,
		type: row.type,
		url: row.url,
		description: text(row.description),
		rating: row.rating ?? null,
		topics: row.topics ?? [],
		language: row.content_language ?? 'da',
	}));

await write('tools', tools);
await write('use-cases', useCases);
await write('resources', resources);
