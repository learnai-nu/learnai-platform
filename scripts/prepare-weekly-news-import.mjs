import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const packageDir = resolve(process.argv[2] ?? '');
const year = Number(process.argv[3]);
const week = Number(process.argv[4]);
const outputDir = resolve(process.argv[5] ?? resolve('.content-import', `week-${week}`));

if (!packageDir || !Number.isInteger(year) || !Number.isInteger(week)) {
	throw new Error('Usage: node scripts/prepare-weekly-news-import.mjs <package-dir> <year> <week> [output-dir]');
}

const categories = [
	{
		key: 'headlines-and-launches',
		name: 'Headlines & Launches',
		file: 'Headlines_and_Launches',
		image: 'modelnyheder',
		fallback: '/images/news/2026/week-36/modelnyheder-v2.jpg',
	},
	{
		key: 'deep-dives-and-analysis',
		name: 'Deep Dives & Analysis',
		file: 'Deep_Dives_and_Analysis',
		image: 'deep-dives',
		fallback: '/images/news/2026/week-36/deep-dives-v2.jpg',
	},
	{
		key: 'marketing',
		name: 'Marketing',
		file: 'Marketing',
		image: 'marketing',
		fallback: '/images/news/2026/week-36/marketing-v2.jpg',
	},
	{
		key: 'business',
		name: 'Business',
		file: 'Business',
		image: 'business',
		fallback: '/images/news/2026/week-36/business-v2.jpg',
	},
];

const danishMonths = [
	'januar', 'februar', 'marts', 'april', 'maj', 'juni',
	'juli', 'august', 'september', 'oktober', 'november', 'december',
];

function isoWeekStart(isoYear, isoWeek) {
	const jan4 = new Date(Date.UTC(isoYear, 0, 4));
	const mondayOffset = (jan4.getUTCDay() + 6) % 7;
	const firstMonday = new Date(jan4.getTime() - mondayOffset * 86400000);
	return new Date(firstMonday.getTime() + (isoWeek - 1) * 7 * 86400000);
}

function copenhagenMidnightUtc(date) {
	const hourIn = (candidate) =>
		new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Copenhagen', hour: '2-digit', hour12: false }).format(candidate);
	for (const offsetHours of [1, 2]) {
		const candidate = new Date(date.getTime() - offsetHours * 3600000);
		if (hourIn(candidate) === '00') return candidate;
	}
	return new Date(date.getTime() - 2 * 3600000);
}

function sqlTimestamp(date) {
	return `${date.toISOString().slice(0, 19).replace('T', ' ')}+00`;
}

function weekPeriod(isoYear, isoWeek) {
	const start = isoWeekStart(isoYear, isoWeek);
	const end = new Date(start.getTime() + 6 * 86400000);
	const startDay = start.getUTCDate();
	const endDay = end.getUTCDate();
	const startMonth = start.getUTCMonth();
	const endMonth = end.getUTCMonth();
	const endYear = end.getUTCFullYear();
	const englishMonth = (index) =>
		new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', month: 'long' }).format(new Date(Date.UTC(endYear, index, 1)));
	const da = startMonth === endMonth
		? `${startDay}.–${endDay}. ${danishMonths[endMonth]} ${endYear}`
		: `${startDay}. ${danishMonths[startMonth]} – ${endDay}. ${danishMonths[endMonth]} ${endYear}`;
	const en = startMonth === endMonth
		? `${startDay}–${endDay} ${englishMonth(endMonth)} ${endYear}`
		: `${startDay} ${englishMonth(startMonth)} – ${endDay} ${englishMonth(endMonth)} ${endYear}`;
	// The week is published at the start of the following Monday, Copenhagen time.
	const publishAt = copenhagenMidnightUtc(new Date(start.getTime() + 7 * 86400000));
	return { da, en, publishAt };
}

const period = weekPeriod(year, week);
const importedAt = new Date().toISOString();

function weekVisual(category) {
	const path = `/images/news/${year}/week-${week}/${category.image}.jpg`;
	if (existsSync(resolve('public', `.${path}`))) {
		return { path, status: 'original', fallbackFrom: undefined };
	}
	return { path: category.fallback, status: 'fallback', fallbackFrom: '2026-week-36' };
}

const visuals = new Map(categories.map((category) => [category.key, weekVisual(category)]));

const sqlString = (value) => `'${String(value).replaceAll("'", "''")}'`;
const jsonSql = (value) => `${sqlString(JSON.stringify(value))}::jsonb`;

function field(markdown, label) {
	const match = markdown.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`));
	return match?.[1]?.replace(/\\s{2}$/, '').trim() ?? '';
}

function summary(markdown) {
	const block = markdown.match(/^> \*\*(?:Kort fortalt|In brief)\*\*\n((?:^> - .+\n?)+)/m)?.[1] ?? '';
	return [...block.matchAll(/^> - (.+)$/gm)].map((match) => match[1].trim());
}

function body(markdown) {
	const withoutPreamble = markdown.replace(/[\s\S]*?^## (?:Indhold|Contents)\n(?:[\s\S]*?)(?=^## )/m, '');
	return withoutPreamble
		.replace(/^## (?:Kilder|Sources)[\s\S]*$/m, '')
		.trim();
}

function parseSources(markdown) {
	const block = markdown.split(/^## (?:Kilder|Sources)\n/m)[1]?.split(/^## /m)[0] ?? '';
	return [...block.matchAll(/^- \[([^\]]+)\]\((https?:\/\/[^)]+)\) · ([^\n]+)$/gm)].map((match) => {
		const parts = match[3].split(' · ').map((part) => part.trim());
		const kind = parts.shift() ?? '';
		const publishedDate = parts.shift();
		const note = parts.join(' · ') || undefined;
		const sourceType = /newsletter|nyhedsbrev/i.test(kind)
			? 'newsletter'
			: /independent|uafhængig/i.test(kind)
				? 'independent'
				: 'primary';
		return { name: match[1], url: match[2], sourceType, publishedDate, note };
	});
}

function parseFaq(markdown) {
	const block = markdown.split(/^## FAQ\n/m)[1]?.split(/^## /m)[0] ?? '';
	return block.split(/^### /m).slice(1).map((entry) => {
		const [question, ...answer] = entry.trim().split(/\n+/);
		return { question: question.trim(), answer: answer.join(' ').trim() };
	});
}

function storyHeadings(markdown) {
	return [...body(markdown).matchAll(/^## (.+)$/gm)].map((match) => match[1].trim());
}

function makeItem(category, locale, markdown, fileName) {
	const english = locale === 'en';
	const title = markdown.match(/^# (.+)$/m)?.[1]?.trim();
	const excerpt = field(markdown, english ? 'Standfirst' : 'Underrubrik');
	if (!title || !excerpt) throw new Error(`Missing title/standfirst in ${fileName}`);
	const slug = `${english ? 'week' : 'uge'}-${week}-${category.key}`;
	const sources = parseSources(markdown);
	const faq = parseFaq(markdown);
	const headings = storyHeadings(markdown);
	const visual = visuals.get(category.key);
	const imageCaption = visual.status === 'original'
		? english
			? `Editorial graphic produced for LearnAI's week ${week} ${category.name} roundup.`
			: `Redaktionel grafik produceret til LearnAI's uge ${week}-opsamling for ${category.name}.`
		: english
			? `Visual fallback from LearnAI's week 36 archive for ${category.name}; it was not generated for week ${week}.`
			: `Visuel fallback fra LearnAI's uge 36-arkiv til ${category.name}; billedet er ikke genereret til uge ${week}.`;
	const sourceMetadata = {
		year,
		week,
		period: english ? period.en : period.da,
		locale,
		category: category.name,
		source_file: fileName,
		source_system: 'learnai-weekly-agents',
		source_collection: 'weekly-package',
		imported_at: importedAt,
		visual_status: visual.status,
		visual_fallback_from: visual.fallbackFrom,
		image: visual.path,
		imageAlt: visual.status === 'original'
			? english
				? `Editorial graphic for ${category.name} in LearnAI's week ${week} roundup`
				: `Redaktionel grafik til ${category.name} i LearnAI's uge ${week}-opsamling`
			: english
				? `Editorial illustration for ${category.name}, reused as a documented visual fallback`
				: `Redaktionelt kategoribillede til ${category.name}, genbrugt som dokumenteret visuel fallback`,
		imageCaption,
		summary: summary(markdown),
		sources,
		faq,
		keywords: [category.name, `week ${week}`, 'AI news', ...headings.slice(0, 4)].slice(0, 10),
		about: [category.name, 'Artificial intelligence'],
		language_pair_key: `learnai-weekly:${year}:${week}:${category.key}`,
	};
	return {
		sourceKey: `learnai-weekly:${year}:${week}:${locale}:${category.key}`,
		slug,
		title,
		excerpt,
		locale,
		body: { format: 'markdown', markdown: body(markdown) },
		coverImageUrl: visual.path,
		sourceMetadata,
	};
}

const items = [];
for (const category of categories) {
	for (const locale of ['da', 'en']) {
		const fileName = `${category.file}_${locale.toUpperCase()}.md`;
		const markdown = await readFile(resolve(packageDir, fileName), 'utf8');
		items.push(makeItem(category, locale, markdown, fileName));
	}
}

const values = items.map((item) => `(
  'news'::content_type, 'draft'::content_status, ${sqlString(item.title)}, ${sqlString(item.slug)},
  ${sqlString(item.excerpt)}, ${jsonSql(item.body)}, ${sqlString(item.coverImageUrl)},
  ${sqlString(item.title)}, ${sqlString(item.excerpt)}, null, ${sqlString(item.locale)},
  ${sqlString(item.sourceKey)}, ${jsonSql(item.sourceMetadata)}
)`).join(',\n');

const sourceKeys = items.map((item) => sqlString(item.sourceKey)).join(', ');
const draftSql = `begin;
insert into public.content_items (
  type, status, title, slug, excerpt, body, cover_image_url,
  seo_title, seo_description, published_at, locale, source_key, source_metadata
)
values
${values}
on conflict (source_key) where source_key is not null do update
set type = excluded.type,
    status = 'draft'::content_status,
    title = excluded.title,
    slug = excluded.slug,
    excerpt = excluded.excerpt,
    body = excluded.body,
    cover_image_url = excluded.cover_image_url,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    published_at = null,
    locale = excluded.locale,
    source_metadata = excluded.source_metadata,
    updated_at = now();

do $$
declare row_count integer;
begin
  select count(*) into row_count
  from public.content_items
  where source_key = any(array[${sourceKeys}]::text[])
    and status = 'draft'::content_status
    and published_at is null;
  if row_count <> ${items.length} then
    raise exception 'Expected ${items.length} week ${week} draft rows, found %', row_count;
  end if;
end $$;
commit;`;

const publishSql = `begin;
update public.content_items
set status = 'published'::content_status,
    published_at = timestamptz '${sqlTimestamp(period.publishAt)}',
    updated_at = now()
where source_key = any(array[${sourceKeys}]::text[])
  and status = 'draft'::content_status
  and published_at is null;

do $$
declare row_count integer;
begin
  select count(*) into row_count
  from public.content_items
  where source_key = any(array[${sourceKeys}]::text[])
    and status = 'published'::content_status
    and published_at is not null;
  if row_count <> ${items.length} then
    raise exception 'Expected ${items.length} published week ${week} rows, found %', row_count;
  end if;
end $$;
commit;`;

const rollbackSql = `begin;
update public.content_items
set status = 'draft'::content_status,
    published_at = null,
    updated_at = now()
where source_key = any(array[${sourceKeys}]::text[]);
commit;`;

await mkdir(outputDir, { recursive: true });
await Promise.all([
	writeFile(resolve(outputDir, 'draft.sql'), draftSql),
	writeFile(resolve(outputDir, 'publish.sql'), publishSql),
	writeFile(resolve(outputDir, 'rollback.sql'), rollbackSql),
	writeFile(resolve(outputDir, 'manifest.json'), JSON.stringify({ year, week, packageDir, items }, null, 2)),
]);

console.log(JSON.stringify({ outputDir, count: items.length, files: items.map((item) => basename(item.sourceMetadata.source_file)), slugs: items.map((item) => item.slug) }, null, 2));
