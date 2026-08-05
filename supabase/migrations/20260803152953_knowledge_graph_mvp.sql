-- Knowledge Graph MVP. This migration is additive: existing content, courses,
-- lessons, tags, and categories remain the systems of record.

create table public.entities (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  name text not null,
  slug text not null,
  description text,
  aliases text[] not null default '{}'::text[],
  status public.content_status not null default 'draft',
  source_tag_id uuid unique references public.tags(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entities_type_check check (
    entity_type in ('tool', 'topic', 'concept', 'audience', 'use_case', 'industry', 'skill')
  ),
  constraint entities_name_length_check check (length(btrim(name)) between 2 and 160),
  constraint entities_slug_check check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and length(slug) between 2 and 160
  ),
  constraint entities_description_length_check check (
    description is null or length(description) <= 2000
  ),
  constraint entities_alias_count_check check (cardinality(aliases) <= 20),
  unique (entity_type, slug)
);

create unique index entities_type_name_unique
  on public.entities (entity_type, lower(name));
create index entities_status_type_idx
  on public.entities (status, entity_type);

create table public.knowledge_nodes (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid unique references public.content_items(id) on delete cascade,
  course_id uuid unique references public.courses(id) on delete cascade,
  lesson_id uuid unique references public.lessons(id) on delete cascade,
  entity_id uuid unique references public.entities(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint knowledge_nodes_exactly_one_reference_check check (
    num_nonnulls(content_item_id, course_id, lesson_id, entity_id) = 1
  )
);

create table public.relationships (
  id uuid primary key default gen_random_uuid(),
  source_node_id uuid not null references public.knowledge_nodes(id) on delete cascade,
  target_node_id uuid not null references public.knowledge_nodes(id) on delete cascade,
  relation_type text not null,
  status text not null default 'proposed',
  origin text not null default 'manual',
  confidence numeric(4, 3),
  rationale text,
  evidence jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint relationships_type_check check (
    relation_type in (
      'about', 'mentions', 'uses', 'demonstrates', 'targets',
      'prerequisite_for', 'related_to', 'updates', 'derived_from', 'part_of'
    )
  ),
  constraint relationships_status_check check (
    status in ('proposed', 'approved', 'rejected', 'archived')
  ),
  constraint relationships_origin_check check (origin in ('manual', 'ai', 'import')),
  constraint relationships_confidence_check check (
    confidence is null or confidence between 0 and 1
  ),
  constraint relationships_rationale_length_check check (
    rationale is null or length(rationale) <= 2000
  ),
  constraint relationships_evidence_object_check check (jsonb_typeof(evidence) = 'object'),
  constraint relationships_distinct_nodes_check check (source_node_id <> target_node_id),
  constraint relationships_related_to_order_check check (
    relation_type <> 'related_to' or source_node_id < target_node_id
  ),
  constraint relationships_review_check check (
    (status = 'proposed' and reviewed_by is null and reviewed_at is null)
    or (status in ('approved', 'rejected', 'archived') and reviewed_by is not null and reviewed_at is not null)
  ),
  unique (source_node_id, target_node_id, relation_type)
);

create index relationships_status_created_idx
  on public.relationships (status, created_at desc);
create index relationships_source_status_idx
  on public.relationships (source_node_id, status);
create index relationships_target_status_idx
  on public.relationships (target_node_id, status);
create index relationships_type_status_idx
  on public.relationships (relation_type, status);

alter table public.entities enable row level security;
alter table public.knowledge_nodes enable row level security;
alter table public.relationships enable row level security;

revoke all on table public.entities from public, anon, authenticated;
revoke all on table public.knowledge_nodes from public, anon, authenticated;
revoke all on table public.relationships from public, anon, authenticated;

grant select on table public.entities to authenticated;
grant insert (
  entity_type, name, slug, description, aliases, status, source_tag_id, created_by
) on table public.entities to authenticated;
grant update (
  entity_type, name, slug, description, aliases, status, source_tag_id, updated_at
) on table public.entities to authenticated;

grant select on table public.knowledge_nodes to authenticated;

grant select on table public.relationships to authenticated;
grant insert (
  source_node_id, target_node_id, relation_type, status, origin, confidence,
  rationale, evidence, created_by
) on table public.relationships to authenticated;
grant update (
  target_node_id, relation_type, status, confidence, rationale, evidence, updated_at
) on table public.relationships to authenticated;

grant select, insert, update, delete on table public.entities to service_role;
grant select, insert, update, delete on table public.knowledge_nodes to service_role;
grant select, insert, update, delete on table public.relationships to service_role;

create policy entities_content_managers_select
  on public.entities
  for select
  to authenticated
  using ((select private.is_content_manager()));

create policy entities_content_managers_insert
  on public.entities
  for insert
  to authenticated
  with check (
    (select private.is_content_manager())
    and created_by = (select auth.uid())
  );

create policy entities_content_managers_update
  on public.entities
  for update
  to authenticated
  using ((select private.is_content_manager()))
  with check ((select private.is_content_manager()));

create policy knowledge_nodes_content_managers_select
  on public.knowledge_nodes
  for select
  to authenticated
  using ((select private.is_content_manager()));

create policy relationships_content_managers_select
  on public.relationships
  for select
  to authenticated
  using ((select private.is_content_manager()));

create policy relationships_content_managers_insert
  on public.relationships
  for insert
  to authenticated
  with check (
    (select private.is_content_manager())
    and created_by = (select auth.uid())
    and status = 'proposed'
    and reviewed_by is null
    and reviewed_at is null
  );

create policy relationships_content_managers_update
  on public.relationships
  for update
  to authenticated
  using ((select private.is_content_manager()))
  with check ((select private.is_content_manager()));

create or replace function private.ensure_knowledge_node()
returns trigger
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private, pg_temp
as $function$
begin
  if tg_table_name = 'content_items' then
    insert into public.knowledge_nodes (content_item_id)
    values (new.id)
    on conflict (content_item_id) do nothing;
  elsif tg_table_name = 'courses' then
    insert into public.knowledge_nodes (course_id)
    values (new.id)
    on conflict (course_id) do nothing;
  elsif tg_table_name = 'lessons' then
    insert into public.knowledge_nodes (lesson_id)
    values (new.id)
    on conflict (lesson_id) do nothing;
  elsif tg_table_name = 'entities' then
    insert into public.knowledge_nodes (entity_id)
    values (new.id)
    on conflict (entity_id) do nothing;
  else
    raise exception using errcode = '22023', message = 'UNSUPPORTED_KNOWLEDGE_NODE_SOURCE';
  end if;
  return new;
end;
$function$;

revoke all on function private.ensure_knowledge_node() from public, anon, authenticated;

create trigger content_items_ensure_knowledge_node
  after insert on public.content_items
  for each row execute function private.ensure_knowledge_node();
create trigger courses_ensure_knowledge_node
  after insert on public.courses
  for each row execute function private.ensure_knowledge_node();
create trigger lessons_ensure_knowledge_node
  after insert on public.lessons
  for each row execute function private.ensure_knowledge_node();
create trigger entities_ensure_knowledge_node
  after insert on public.entities
  for each row execute function private.ensure_knowledge_node();

create or replace function private.review_knowledge_relationship()
returns trigger
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public, private, auth, pg_temp
as $function$
begin
  new.created_by := old.created_by;
  new.created_at := old.created_at;
  new.updated_at := now();

  if new.source_node_id <> old.source_node_id then
    raise exception using errcode = '22023', message = 'RELATIONSHIP_SOURCE_IMMUTABLE';
  end if;

  if old.status <> 'proposed' and (
    new.target_node_id is distinct from old.target_node_id
    or new.relation_type is distinct from old.relation_type
    or new.confidence is distinct from old.confidence
    or new.rationale is distinct from old.rationale
    or new.evidence is distinct from old.evidence
  ) then
    raise exception using errcode = '22023', message = 'REVIEWED_RELATIONSHIP_IMMUTABLE';
  end if;

  if new.status is distinct from old.status then
    if not private.is_content_manager() or auth.uid() is null then
      raise exception using errcode = '42501', message = 'CONTENT_MANAGER_REQUIRED';
    end if;

    if old.status = 'proposed' and new.status in ('approved', 'rejected') then
      new.reviewed_by := auth.uid();
      new.reviewed_at := now();
    elsif old.status in ('approved', 'rejected') and new.status = 'archived' then
      new.reviewed_by := old.reviewed_by;
      new.reviewed_at := old.reviewed_at;
    else
      raise exception using errcode = '22023', message = 'INVALID_RELATIONSHIP_TRANSITION';
    end if;
  else
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
  end if;

  return new;
end;
$function$;

revoke all on function private.review_knowledge_relationship() from public, anon;
grant execute on function private.review_knowledge_relationship() to authenticated;

create trigger relationships_review_guard
  before update on public.relationships
  for each row execute function private.review_knowledge_relationship();

insert into public.knowledge_nodes (content_item_id)
select id from public.content_items
on conflict (content_item_id) do nothing;

insert into public.knowledge_nodes (course_id)
select id from public.courses
on conflict (course_id) do nothing;

insert into public.knowledge_nodes (lesson_id)
select id from public.lessons
on conflict (lesson_id) do nothing;

comment on table public.entities is
  'Curated Knowledge Graph concepts. Tags remain the editorial taxonomy.';
comment on table public.knowledge_nodes is
  'Foreign-key-safe graph nodes for existing content, courses, lessons, and entities.';
comment on table public.relationships is
  'Human-reviewed Knowledge Graph relationships. AI-origin rows start as proposed.';
