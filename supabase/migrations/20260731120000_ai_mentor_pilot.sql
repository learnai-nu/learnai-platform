-- Sprint 5: a privacy-conscious AI Mentor pilot.
-- Conversations are not persisted. Only a per-user daily request counter is stored.

alter table public.profiles
  add column if not exists industry text,
  add column if not exists preferred_ai_tools text[] not null default '{}'::text[],
  add column if not exists onboarding_completed_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_industry_length_check,
  add constraint profiles_industry_length_check
    check (industry is null or length(industry) <= 120),
  drop constraint if exists profiles_preferred_ai_tools_count_check,
  add constraint profiles_preferred_ai_tools_count_check
    check (cardinality(preferred_ai_tools) <= 20),
  drop constraint if exists profiles_learning_goals_count_check,
  add constraint profiles_learning_goals_count_check
    check (cardinality(learning_goals) <= 20),
  drop constraint if exists profiles_interests_count_check,
  add constraint profiles_interests_count_check
    check (cardinality(interests) <= 20);

create table if not exists private.ai_mentor_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  request_count integer not null default 0 check (request_count between 0 and 20),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

alter table private.ai_mentor_daily_usage enable row level security;
revoke all on table private.ai_mentor_daily_usage from public, anon, authenticated;

create or replace function private.consume_ai_mentor_quota()
returns integer
language plpgsql
volatile
security definer
set search_path = pg_catalog, private, auth, pg_temp
as $function$
declare
  v_user_id uuid := auth.uid();
  v_is_anonymous boolean := coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
  v_count integer;
begin
  if v_user_id is null or v_is_anonymous then
    raise exception using errcode = '28000', message = 'AUTH_REQUIRED';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':ai-mentor:' || current_date::text, 0));

  insert into private.ai_mentor_daily_usage (user_id, usage_date, request_count)
  values (v_user_id, current_date, 1)
  on conflict (user_id, usage_date)
  do update set request_count = private.ai_mentor_daily_usage.request_count + 1,
                updated_at = now()
  where private.ai_mentor_daily_usage.request_count < 20
  returning request_count into v_count;

  if v_count is null then
    raise exception using errcode = 'P0001', message = 'AI_DAILY_LIMIT_REACHED';
  end if;

  return 20 - v_count;
end;
$function$;

revoke all on function private.consume_ai_mentor_quota() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.consume_ai_mentor_quota() to authenticated;

create or replace function public.consume_ai_mentor_quota()
returns integer
language sql
volatile
security invoker
set search_path = pg_catalog, private, auth, pg_temp
as $function$
  select private.consume_ai_mentor_quota();
$function$;

revoke all on function public.consume_ai_mentor_quota() from public, anon;
grant execute on function public.consume_ai_mentor_quota() to authenticated;

comment on function public.consume_ai_mentor_quota() is
  'Consumes one of 20 daily AI Mentor requests for the authenticated non-anonymous user.';

create or replace function public.search_published_learning_content(
  p_query text,
  p_limit integer default 6
)
returns table (
  id uuid,
  title text,
  slug text,
  type public.content_type,
  excerpt text,
  body jsonb,
  updated_at timestamptz,
  rank real
)
language sql
stable
security invoker
set search_path = pg_catalog, public, pg_temp
as $function$
  with search_input as (
    select websearch_to_tsquery('simple', left(btrim(coalesce(p_query, '')), 500)) as query
  )
  select
    content.id,
    content.title,
    content.slug,
    content.type,
    content.excerpt,
    content.body,
    content.updated_at,
    ts_rank_cd(
      to_tsvector(
        'simple',
        coalesce(content.title, '') || ' ' ||
        coalesce(content.excerpt, '') || ' ' ||
        content.body::text
      ),
      search_input.query
    ) as rank
  from public.content_items content
  cross join search_input
  where content.status = 'published'
    and content.locale = 'da'
    and search_input.query @@ to_tsvector(
      'simple',
      coalesce(content.title, '') || ' ' ||
      coalesce(content.excerpt, '') || ' ' ||
      content.body::text
    )
  order by rank desc, content.updated_at desc
  limit least(greatest(coalesce(p_limit, 6), 1), 8);
$function$;

revoke all on function public.search_published_learning_content(text, integer) from public, anon;
grant execute on function public.search_published_learning_content(text, integer) to authenticated;

comment on function public.search_published_learning_content(text, integer) is
  'RLS-aware full-text retrieval for the authenticated AI Mentor. Returns published Danish LearnAI content only.';
