-- Bounded admin-only drill-down. No new direct grants on learner tables.
create or replace function private.get_admin_course_participants(
  p_course_id uuid default null, p_status text default 'all',
  p_search text default '', p_page integer default 1
)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $function$
declare result jsonb;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;
  if p_status is null or p_status not in ('all','enrolled','not_started','in_progress','completed','converted','unregistered')
    or p_search is null or length(p_search) > 100
    or p_page is null or p_page < 1 or p_page > 100000 then
    raise exception using errcode = '22023', message = 'INVALID_FILTER';
  end if;

  with course_lessons as (
    select m.course_id, m.title as module_title, m.sort_order as module_order,
      l.id, l.title, l.sort_order as lesson_order
    from public.course_modules m join public.lessons l on l.module_id = m.id
    where p_course_id is null or m.course_id = p_course_id
  ), lesson_counts as (
    select course_id, count(*) as total from course_lessons group by course_id
  ), activity as (
    select cl.course_id, lp.user_id,
      count(*) filter (where lp.completed) as completed_count,
      max(lp.updated_at) as last_activity
    from course_lessons cl join public.lesson_progress lp on lp.lesson_id = cl.id
    group by cl.course_id, lp.user_id
  ), participants as (
    select course_id, user_id from public.enrollments where p_course_id is null or course_id = p_course_id
    union
    select course_id, user_id from activity
  ), learners as (
    select p.user_id, p.course_id, c.title as course_title,
      nullif(btrim(pr.display_name), '') as name, u.email,
      e.enrolled_at, a.last_activity,
      e.id is not null as enrolled,
      coalesce(lc.total, 0) as lesson_count,
      coalesce(a.completed_count, 0) as completed_count,
      case when lc.total > 0 and a.completed_count = lc.total then 'completed'
        when a.user_id is not null then 'in_progress' else 'not_started' end as status
    from participants p
    join public.courses c on c.id = p.course_id
    join auth.users u on u.id = p.user_id
    left join public.profiles pr on pr.id = p.user_id
    left join public.enrollments e on e.course_id = p.course_id and e.user_id = p.user_id
    left join activity a on a.course_id = p.course_id and a.user_id = p.user_id
    left join lesson_counts lc on lc.course_id = p.course_id
  ), filtered as (
    select * from learners
    where (p_status = 'all'
      or (p_status = 'enrolled' and enrolled)
      or (p_status = 'unregistered' and not enrolled)
      or (p_status = 'converted' and enrolled and status = 'completed')
      or (p_status in ('not_started','in_progress','completed') and status = p_status))
    and (btrim(p_search) = '' or
      strpos(lower(coalesce(name, '') || ' ' || coalesce(email, '')), lower(btrim(p_search))) > 0)
  ), paged as (
    select * from filtered order by last_activity desc nulls last, user_id, course_id
    limit 50 offset ((p_page - 1) * 50)
  )
  select jsonb_build_object(
    'total', (select count(*) from filtered), 'pageSize', 50,
    'items', coalesce((select jsonb_agg(jsonb_build_object(
      'userId', p.user_id, 'courseId', p.course_id, 'courseTitle', p.course_title,
      'name', p.name, 'email', p.email, 'enrolledAt', p.enrolled_at,
      'lastActivity', p.last_activity, 'enrolled', p.enrolled, 'status', p.status,
      'lessonCount', p.lesson_count, 'completedCount', p.completed_count,
      'lessons', coalesce((select jsonb_agg(jsonb_build_object(
        'id', cl.id, 'title', cl.title, 'moduleTitle', cl.module_title,
        'completed', coalesce(lp.completed, false), 'started', lp.user_id is not null
      ) order by cl.module_order, cl.lesson_order, cl.id)
        from course_lessons cl
        left join public.lesson_progress lp on lp.lesson_id = cl.id and lp.user_id = p.user_id
        where cl.course_id = p.course_id), '[]'::jsonb)
    ) order by p.last_activity desc nulls last, p.user_id, p.course_id) from paged p), '[]'::jsonb)
  ) into result;
  return result;
end;
$function$;
revoke all on function private.get_admin_course_participants(uuid,text,text,integer) from public, anon;
grant execute on function private.get_admin_course_participants(uuid,text,text,integer) to authenticated;

create or replace function public.admin_course_participants(
  p_course_id uuid default null, p_status text default 'all',
  p_search text default '', p_page integer default 1
)
returns jsonb
language sql stable security invoker
set search_path = ''
as $function$
  select private.get_admin_course_participants(p_course_id,p_status,p_search,p_page);
$function$;
revoke all on function public.admin_course_participants(uuid,text,text,integer) from public, anon;
grant execute on function public.admin_course_participants(uuid,text,text,integer) to authenticated;
