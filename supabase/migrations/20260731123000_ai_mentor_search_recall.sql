-- Improve natural-language recall by treating query terms as alternatives.
-- The strict AND behavior of websearch_to_tsquery returned no sources for many
-- otherwise useful Danish questions.
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
    select websearch_to_tsquery(
      'simple',
      regexp_replace(left(btrim(coalesce(p_query, '')), 500), '\s+', ' OR ', 'g')
    ) as query
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

-- The usage table is private and has no grants. This explicit deny policy makes
-- the defense-in-depth intent machine-verifiable as well.
drop policy if exists ai_mentor_daily_usage_deny_all on private.ai_mentor_daily_usage;
create policy ai_mentor_daily_usage_deny_all
  on private.ai_mentor_daily_usage
  as restrictive
  for all
  to public
  using (false)
  with check (false);
