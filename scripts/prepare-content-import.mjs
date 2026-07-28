import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const configPath = resolve(projectRoot, 'config', 'content-import.json');

function text(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function clip(value, maximum) {
	const normalized = text(value);
	return normalized.length <= maximum
		? normalized
		: `${normalized.slice(0, Math.max(0, maximum - 1)).trimEnd()}…`;
}

function slugify(value) {
	return text(value)
		.toLocaleLowerCase('da')
		.replaceAll('æ', 'ae')
		.replaceAll('ø', 'oe')
		.replaceAll('å', 'aa')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 160);
}

function difficulty(value) {
	return {
		begynder: 'beginner',
		'øvet': 'intermediate',
		ekspert: 'advanced',
	}[text(value)] ?? null;
}

function categoryForArticle(article) {
	const category = text(article.category).toLocaleLowerCase('da');
	const title = text(article.title).toLocaleLowerCase('da');

	if (
		category.includes('strategi') ||
		category.includes('business') ||
		category.includes('hr') ||
		title.includes('lederskab') ||
		title.includes('virksomhed')
	) return 'ledelse-og-strategi';

	if (category.includes('grundlag') || title.startsWith('hvad er ')) {
		return 'kom-godt-i-gang';
	}

	if (
		category.includes('produkt') ||
		category.includes('launch') ||
		category.includes('deep dive') ||
		category.includes('robot') ||
		title.includes('claude design') ||
		title.includes('ai-assistent')
	) return 'ai-vaerktoejer';

	return 'ai-paa-arbejdet';
}

function safeUrl(value) {
	try {
		const url = new URL(text(value));
		return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
	} catch {
		return null;
	}
}

function sqlString(value) {
	if (value === null || value === undefined) return 'null';
	return `'${String(value).replaceAll("'", "''")}'`;
}

function jsonSql(value) {
	return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function timestampSql(value) {
	const normalized = text(value);
	return normalized ? `${sqlString(normalized)}::timestamptz` : 'null';
}

function normalizedTags(values) {
	const tags = new Map();
	for (const value of values.flat()) {
		const name = text(value);
		const slug = slugify(name);
		if (name && slug && !tags.has(slug)) tags.set(slug, { name, slug });
	}
	return [...tags.values()].slice(0, 12);
}

function articleItem(article, exportedAt) {
	const legacyType = text(article.type);
	const contentType = legacyType === 'guide' ? 'guide' : legacyType === 'nyhed' ? 'news' : 'article';
	const sourceKey = `learnai-backup:article:${text(article.id)}`;
	const tags = normalizedTags([
		Array.isArray(article.tags) ? article.tags : [],
		[article.category, article.difficulty],
	]);

	return {
		sourceKey,
		title: clip(article.title, 200),
		slug: slugify(article.slug),
		type: contentType,
		status: 'draft',
		excerpt: clip(article.intro, 600) || null,
		body: {
			format: 'markdown',
			markdown: text(article.content),
		},
		coverImageUrl: safeUrl(article.featured_image_url),
		categorySlug: categoryForArticle(article),
		difficulty: difficulty(article.difficulty),
		locale: 'da',
		seoTitle: clip(article.title, 200) || null,
		seoDescription: clip(article.intro, 500) || null,
		publishedAt: text(article.published_at) || null,
		sourceMetadata: {
			source_system: 'learnai-backup',
			source_collection: 'articles',
			source_id: text(article.id),
			exported_at: exportedAt,
			legacy_type: legacyType,
			legacy_category: text(article.category) || null,
			legacy_difficulty: text(article.difficulty) || null,
			legacy_author: text(article.author) || null,
			legacy_created_at: text(article.created_at) || null,
			legacy_updated_at: text(article.updated_at) || null,
			image_prompt: text(article.image_prompt) || null,
		},
		tags,
	};
}

function promptItem(prompt, exportedAt) {
	const sourceKey = `learnai-backup:prompt:${text(prompt.id)}`;
	const description = text(prompt.description);
	const promptText = text(prompt.prompt_text).replaceAll('```', 'ˋˋˋ');
	const markdown = [
		description ? `## Formål\n\n${description}` : '',
		`## Prompt\n\n\`\`\`text\n${promptText}\n\`\`\``,
	].filter(Boolean).join('\n\n');
	const tags = normalizedTags([
		[prompt.category_slug, prompt.ai_tool, prompt.difficulty, 'Prompting'],
	]);

	return {
		sourceKey,
		title: clip(prompt.title, 200),
		slug: slugify(prompt.slug),
		type: 'prompt',
		status: 'draft',
		excerpt: clip(description, 600) || null,
		body: { format: 'markdown', markdown },
		coverImageUrl: null,
		categorySlug: 'prompting',
		difficulty: difficulty(prompt.difficulty),
		locale: 'da',
		seoTitle: clip(prompt.title, 200) || null,
		seoDescription: clip(description, 500) || null,
		publishedAt: null,
		sourceMetadata: {
			source_system: 'learnai-backup',
			source_collection: 'prompts',
			source_id: text(prompt.id),
			exported_at: exportedAt,
			ai_tool: text(prompt.ai_tool) || null,
			legacy_category: text(prompt.category_slug) || null,
			legacy_difficulty: text(prompt.difficulty) || null,
			variables: Array.isArray(prompt.variables) ? prompt.variables : [],
			featured: Boolean(prompt.featured),
			legacy_created_at: text(prompt.created_at) || null,
			legacy_updated_at: text(prompt.updated_at) || null,
		},
		tags,
	};
}

function validateItems(items) {
	const sourceKeys = new Set();
	const slugs = new Set();
	for (const item of items) {
		if (!item.sourceKey || !item.title || !item.slug || !item.body.markdown) {
			throw new Error(`Ugyldigt indholdselement: ${item.sourceKey || item.slug || 'ukendt'}`);
		}
		if (sourceKeys.has(item.sourceKey)) throw new Error(`Dubleret source_key: ${item.sourceKey}`);
		if (slugs.has(item.slug)) throw new Error(`Dubleret slug i importen: ${item.slug}`);
		sourceKeys.add(item.sourceKey);
		slugs.add(item.slug);
	}
}

function contentInsertSql(item) {
	return `insert into public.content_items (
  type, status, title, slug, excerpt, body, cover_image_url, category_id,
  seo_title, seo_description, published_at, locale, difficulty, source_key, source_metadata
)
select
  ${sqlString(item.type)}::public.content_type,
  'draft'::public.content_status,
  ${sqlString(item.title)},
  ${sqlString(item.slug)},
  ${sqlString(item.excerpt)},
  ${jsonSql(item.body)},
  ${sqlString(item.coverImageUrl)},
  c.id,
  ${sqlString(item.seoTitle)},
  ${sqlString(item.seoDescription)},
  ${timestampSql(item.publishedAt)},
  ${sqlString(item.locale)},
  ${item.difficulty ? `${sqlString(item.difficulty)}::public.course_level` : 'null'},
  ${sqlString(item.sourceKey)},
  ${jsonSql(item.sourceMetadata)}
from public.categories c
where c.slug = ${sqlString(item.categorySlug)}
on conflict (source_key) where source_key is not null do update
set type = excluded.type,
    status = excluded.status,
    title = excluded.title,
    slug = excluded.slug,
    excerpt = excluded.excerpt,
    body = excluded.body,
    cover_image_url = excluded.cover_image_url,
    category_id = excluded.category_id,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    published_at = excluded.published_at,
    locale = excluded.locale,
    difficulty = excluded.difficulty,
    source_metadata = excluded.source_metadata,
    updated_at = now();`;
}

function tagSql(tag) {
	return `insert into public.tags (name, slug)
values (${sqlString(tag.name)}, ${sqlString(tag.slug)})
on conflict (slug) do update set name = excluded.name;`;
}

function contentTagSql(item, tag) {
	return `insert into public.content_tags (content_id, tag_id)
select ci.id, t.id
from public.content_items ci
join public.tags t on t.slug = ${sqlString(tag.slug)}
where ci.source_key = ${sqlString(item.sourceKey)}
on conflict do nothing;`;
}

function batchSql(items) {
	const tags = [
		...new Map(
			items
				.flatMap((item) => item.tags)
				.map((tag) => [tag.slug, tag]),
		).values(),
	];
	const sourceKeyArray = items.map((item) => sqlString(item.sourceKey)).join(', ');
	return [
		'begin;',
		"set local statement_timeout = '60s';",
		...tags.map(tagSql),
		...items.map(contentInsertSql),
		...items.flatMap((item) => item.tags.map((tag) => contentTagSql(item, tag))),
		'commit;',
		`select count(*)::integer as imported_count
from public.content_items
where source_key = any(array[${sourceKeyArray}]::text[]);`,
		'',
	].join('\n\n');
}

export function buildImportPlan(backup, config) {
	if (!backup || !Array.isArray(backup.articles) || !Array.isArray(backup.prompts)) {
		throw new Error('Backupen mangler arrays for articles eller prompts.');
	}
	if (config.locale !== 'da' || config.status !== 'draft') {
		throw new Error('Denne import kræver dansk indhold og draft-status.');
	}

	const exportedAt = text(backup.exported_at);
	const articles = backup.articles.filter((article) => {
		if (article.locale !== config.locale || !article.published) return false;
		if (config.articles.includeTypes.includes(article.type)) return true;
		return article.type === 'nyhed' &&
			text(article.published_at) >= config.articles.newsPublishedOnOrAfter;
	});
	const prompts = config.prompts.includeAll
		? backup.prompts.filter((prompt) => prompt.locale === config.locale && prompt.published)
		: [];
	const items = [
		...articles.map((article) => articleItem(article, exportedAt)),
		...prompts.map((prompt) => promptItem(prompt, exportedAt)),
	];
	validateItems(items);
	return {
		items,
		selected: {
			articles: articles.length,
			prompts: prompts.length,
			total: items.length,
		},
		skipped: {
			quiz_results: Array.isArray(backup.quiz_results) ? backup.quiz_results.length : 0,
			user_roles: Array.isArray(backup.user_roles) ? backup.user_roles.length : 0,
		},
	};
}

async function main() {
	const backupArgument = process.argv[2];
	if (!backupArgument) {
		throw new Error('Brug: pnpm content:prepare <sti-til-backup.json> [output-mappe]');
	}
	const backupPath = resolve(backupArgument);
	const outputPath = resolve(process.argv[3] || resolve(projectRoot, '.content-import'));
	const [backupSource, configSource] = await Promise.all([
		readFile(backupPath, 'utf8'),
		readFile(configPath, 'utf8'),
	]);
	const backup = JSON.parse(backupSource);
	const config = JSON.parse(configSource);
	const plan = buildImportPlan(backup, config);
	const batches = [];
	let currentBatch = [];
	for (const item of plan.items) {
		const candidate = [...currentBatch, item];
		const exceedsItemLimit = candidate.length > config.batchSize;
		const exceedsCharacterLimit =
			currentBatch.length > 0 &&
			batchSql(candidate).length > config.maxBatchCharacters;
		if (exceedsItemLimit || exceedsCharacterLimit) {
			batches.push(currentBatch);
			currentBatch = [item];
		} else {
			currentBatch = candidate;
		}
	}
	if (currentBatch.length > 0) batches.push(currentBatch);

	await mkdir(outputPath, { recursive: true });
	const previousFiles = await readdir(outputPath);
	await Promise.all(
		previousFiles
			.filter((filename) => /^batch-\d+\.sql$/.test(filename))
			.map((filename) => unlink(resolve(outputPath, filename))),
	);
	const batchFiles = [];
	for (const [index, items] of batches.entries()) {
		const filename = `batch-${String(index + 1).padStart(3, '0')}.sql`;
		await writeFile(resolve(outputPath, filename), batchSql(items), 'utf8');
		batchFiles.push({
			filename,
			items: items.length,
			characters: batchSql(items).length,
		});
	}
	const groups = Map.groupBy(plan.items, (item) => item.type);
	const report = {
		version: 1,
		source_file: basename(backupPath),
		source_sha256: createHash('sha256').update(backupSource).digest('hex'),
		exported_at: text(backup.exported_at),
		generated_at: new Date().toISOString(),
		selection: plan.selected,
		excluded_sensitive_data: plan.skipped,
		content_types: Object.fromEntries(
			[...groups.entries()].map(([type, values]) => [type, values.length]),
		),
		batches: batchFiles,
	};
	await writeFile(resolve(outputPath, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
	process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename);
if (isDirectRun) {
	main().catch((error) => {
		process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
		process.exitCode = 1;
	});
}
