-- Return aggregates only; keep learner rows protected by their existing RLS.
create or replace function private.get_admin_course_statistics()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  result jsonb;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;

  with course_lessons as (
    select m.course_id, l.id as lesson_id
    from public.course_modules m
    join public.lessons l on l.module_id = m.id
  ), lesson_counts as (
    select course_id, count(*) as total from course_lessons group by course_id
  ), activity as (
    select cl.course_id, lp.user_id,
      count(*) filter (where lp.completed) as completed_lessons
    from course_lessons cl
    join public.lesson_progress lp on lp.lesson_id = cl.lesson_id
    group by cl.course_id, lp.user_id
  ), participants as (
    select course_id, user_id from public.enrollments
    union
    select course_id, user_id from activity
  ), learner_status as (
    select p.course_id, p.user_id,
      exists (select 1 from public.enrollments e
        where e.course_id = p.course_id and e.user_id = p.user_id) as enrolled,
      a.user_id is not null as started,
      coalesce(lc.total > 0 and a.completed_lessons = lc.total, false) as completed
    from participants p
    left join activity a on a.course_id = p.course_id and a.user_id = p.user_id
    left join lesson_counts lc on lc.course_id = p.course_id
  ), counts as (
    select course_id,
      count(*) filter (where enrolled) as enrolled,
      count(*) filter (where enrolled and not started) as not_started,
      count(*) filter (where started and not completed) as in_progress,
      count(*) filter (where completed) as completed,
      count(*) filter (where enrolled and completed) as completed_enrolled,
      count(*) filter (where not enrolled) as without_enrollment
    from learner_status group by course_id
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id, 'title', c.title,
    'enrolled', coalesce(s.enrolled, 0),
    'notStarted', coalesce(s.not_started, 0),
    'inProgress', coalesce(s.in_progress, 0),
    'completed', coalesce(s.completed, 0),
    'completedEnrolled', coalesce(s.completed_enrolled, 0),
    'withoutEnrollment', coalesce(s.without_enrollment, 0)
  ) order by c.title, c.id), '[]'::jsonb)
  into result
  from public.courses c left join counts s on s.course_id = c.id;

  return result;
end;
$function$;

revoke all on function private.get_admin_course_statistics() from public, anon;
grant execute on function private.get_admin_course_statistics() to authenticated;

create or replace function public.admin_course_statistics()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $function$
  select private.get_admin_course_statistics();
$function$;

revoke all on function public.admin_course_statistics() from public, anon;
grant execute on function public.admin_course_statistics() to authenticated;
