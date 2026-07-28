alter table public.content_items
  add column if not exists locale text not null default 'da',
  add column if not exists difficulty public.course_level,
  add column if not exists source_key text,
  add column if not exists source_metadata jsonb not null default '{}'::jsonb;

alter table public.content_items
  drop constraint if exists content_items_locale_check,
  add constraint content_items_locale_check
    check (locale in ('da', 'en')),
  drop constraint if exists content_items_source_key_length_check,
  add constraint content_items_source_key_length_check
    check (source_key is null or length(source_key) between 3 and 300),
  drop constraint if exists content_items_source_metadata_object_check,
  add constraint content_items_source_metadata_object_check
    check (jsonb_typeof(source_metadata) = 'object');

create unique index if not exists content_items_source_key_unique
  on public.content_items (source_key)
  where source_key is not null;

create index if not exists content_items_locale_status_idx
  on public.content_items (locale, status, published_at desc);

comment on column public.content_items.locale is
  'BCP 47 language code used for filtering and AI retrieval.';
comment on column public.content_items.difficulty is
  'Normalized LearnAI difficulty level.';
comment on column public.content_items.source_key is
  'Stable, namespaced import identifier used for idempotent migrations.';
comment on column public.content_items.source_metadata is
  'Non-sensitive provenance and legacy metadata. Never store account data here.';
