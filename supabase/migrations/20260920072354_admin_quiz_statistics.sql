-- Only aggregate results leave the database; learner RLS remains unchanged.
create or replace function private.get_admin_quiz_statistics()
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $function$
declare result jsonb;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;

  with submitted as (
    select quiz_id, user_id, score, passed
    from public.quiz_attempts where completed_at is not null
  ), per_quiz as (
    select quiz_id, count(distinct user_id) as participants,
      count(*) as completed, count(*) filter (where passed is true) as passed,
      avg(score) as average_score
    from submitted group by quiz_id
  )
  select jsonb_build_object(
    'participants', (select count(distinct user_id) from submitted),
    'completed', (select count(*) from submitted),
    'passed', (select count(*) from submitted where passed is true),
    'averageScore', (select avg(score) from submitted),
    'quizzes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', q.id, 'title', q.title, 'courseTitle', c.title,
        'participants', coalesce(s.participants, 0),
        'completed', coalesce(s.completed, 0),
        'passed', coalesce(s.passed, 0), 'averageScore', s.average_score
      ) order by c.title, q.title, q.id)
      from public.quizzes q
      join public.lessons l on l.id = q.lesson_id
      join public.course_modules m on m.id = l.module_id
      join public.courses c on c.id = m.course_id
      left join per_quiz s on s.quiz_id = q.id
    ), '[]'::jsonb)
  ) into result;
  return result;
end;
$function$;
revoke all on function private.get_admin_quiz_statistics() from public, anon;
grant execute on function private.get_admin_quiz_statistics() to authenticated;

create or replace function public.admin_quiz_statistics()
returns jsonb
language sql stable security invoker
set search_path = ''
as $function$
  select private.get_admin_quiz_statistics();
$function$;
revoke all on function public.admin_quiz_statistics() from public, anon;
grant execute on function public.admin_quiz_statistics() to authenticated;
