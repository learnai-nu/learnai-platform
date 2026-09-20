-- Run after the migration. All fixtures and session settings are rolled back.
begin;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000001","app_metadata":{"role":"admin"},"role":"authenticated"}', true);

do $test$
declare
  test_course_id uuid := gen_random_uuid();
  module_id uuid := gen_random_uuid();
  lesson_a uuid := gen_random_uuid();
  lesson_b uuid := gen_random_uuid();
  learner_a uuid;
  learner_b uuid;
  stats jsonb;
begin
  select id into learner_a from auth.users order by id limit 1;
  select id into learner_b from auth.users where id <> learner_a order by id limit 1;
  if learner_b is null then raise exception 'Test requires two existing users'; end if;

  insert into public.courses(id,title,slug) values(test_course_id,'Statistics test', 'statistics-test-' || test_course_id);
  select item into stats from jsonb_array_elements(public.admin_course_statistics()) item where item->>'id' = test_course_id::text;
  assert (stats->>'completed')::int = 0, 'Empty course must not count as completed';

  insert into public.course_modules(id,course_id,title) values(module_id,test_course_id,'Test');
  insert into public.lessons(id,module_id,title,slug,sort_order) values
    (lesson_a,module_id,'A','test-a-' || lesson_a,0), (lesson_b,module_id,'B','test-b-' || lesson_b,1);
  insert into public.enrollments(user_id,course_id) values(learner_a,test_course_id), (learner_b,test_course_id);
  insert into public.lesson_progress(user_id,lesson_id,completed) values(learner_a,lesson_a,true);

  select item into stats from jsonb_array_elements(public.admin_course_statistics()) item where item->>'id' = test_course_id::text;
  assert (stats->>'enrolled')::int = 2;
  assert (stats->>'notStarted')::int = 1;
  assert (stats->>'inProgress')::int = 1;
  assert (stats->>'completed')::int = 0;

  insert into public.lesson_progress(user_id,lesson_id,completed) values(learner_a,lesson_b,true);
  select item into stats from jsonb_array_elements(public.admin_course_statistics()) item where item->>'id' = test_course_id::text;
  assert (stats->>'completed')::int = 1;
  assert (stats->>'completedEnrolled')::int = 1;
  assert (stats->>'inProgress')::int = 0;

  -- A historical learner without enrollment remains visible without inflating conversion.
  delete from public.enrollments where user_id = learner_a and enrollments.course_id = test_course_id;
  select item into stats from jsonb_array_elements(public.admin_course_statistics()) item where item->>'id' = test_course_id::text;
  assert (stats->>'enrolled')::int = 1;
  assert (stats->>'completed')::int = 1;
  assert (stats->>'completedEnrolled')::int = 0;
  assert (stats->>'withoutEnrollment')::int = 1;
end;
$test$;

set local role authenticated;
do $test$
declare claims text;
begin
  -- Exercise the real authenticated role, not a database owner bypass.
  perform public.admin_course_statistics();
  foreach claims in array array[
    '{"sub":"00000000-0000-4000-8000-000000000001","app_metadata":{"role":"editor"}}',
    '{"sub":"00000000-0000-4000-8000-000000000001","user_metadata":{"role":"admin"}}',
    '{"app_metadata":{"role":"admin"}}'
  ] loop
    perform set_config('request.jwt.claims', claims, true);
    begin
      perform public.admin_course_statistics();
      raise exception 'Unauthorized statistics access';
    exception when insufficient_privilege then null;
    end;
  end loop;
  assert not has_function_privilege('anon','public.admin_course_statistics()','execute');
  assert not has_function_privilege('anon','private.get_admin_course_statistics()','execute');
end;
$test$;

rollback;
