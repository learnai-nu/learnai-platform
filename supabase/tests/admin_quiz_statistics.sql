-- All fixtures and session settings are rolled back.
begin;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000001","app_metadata":{"role":"admin"},"role":"authenticated"}', true);
do $test$
declare
  cid uuid := gen_random_uuid();
  mid uuid := gen_random_uuid();
  la uuid := gen_random_uuid(); lb uuid := gen_random_uuid(); lc uuid := gen_random_uuid();
  qa uuid := gen_random_uuid(); qb uuid := gen_random_uuid(); qc uuid := gen_random_uuid();
  ua uuid; ub uuid; stats jsonb; row_stats jsonb; baseline jsonb;
  scored bigint; expected_participants bigint;
begin
  select id into ua from auth.users order by id limit 1;
  select id into ub from auth.users where id <> ua order by id limit 1;
  if ub is null then raise exception 'Test requires two existing users'; end if;
  baseline := public.admin_quiz_statistics();
  select count(*) into scored from public.quiz_attempts where completed_at is not null and score is not null;
  select count(*) into expected_participants from (
    select user_id from public.quiz_attempts where completed_at is not null
    union select ua union select ub
  ) users;
  insert into public.courses(id,title,slug) values(cid,'Quiz statistics test','quiz-statistics-test-' || cid);
  insert into public.course_modules(id,course_id,title) values(mid,cid,'Test');
  insert into public.lessons(id,module_id,title,slug,sort_order) values
    (la,mid,'A','test-a-' || la,0), (lb,mid,'B','test-b-' || lb,1), (lc,mid,'C','test-c-' || lc,2);
  insert into public.quizzes(id,lesson_id,title) values(qa,la,'Quiz A'),(qb,lb,'Quiz B'),(qc,lc,'Empty quiz');
  insert into public.quiz_attempts(quiz_id,user_id,score,passed,completed_at) values
    (qa,ua,0,false,now()), (qa,ua,100,true,now()), (qa,ub,80,true,now()),
    (qb,ua,20,false,now()), (qb,ub,100,true,null);
  stats := public.admin_quiz_statistics();
  select item into row_stats from jsonb_array_elements(stats->'quizzes') item where item->>'id' = qa::text;
  assert (row_stats->>'participants')::int = 2, 'Retries must not duplicate participants';
  assert (row_stats->>'completed')::int = 3;
  assert (row_stats->>'passed')::int = 2;
  assert (row_stats->>'averageScore')::numeric = 60, 'Zero scores count in the average';
  select item into row_stats from jsonb_array_elements(stats->'quizzes') item where item->>'id' = qb::text;
  assert (row_stats->>'participants')::int = 1, 'Unsubmitted attempts must be excluded';
  assert (row_stats->>'completed')::int = 1;
  assert (row_stats->>'passed')::int = 0;
  assert (row_stats->>'averageScore')::numeric = 20;
  select item into row_stats from jsonb_array_elements(stats->'quizzes') item where item->>'id' = qc::text;
  assert (row_stats->>'completed')::int = 0;
  assert row_stats->>'averageScore' is null;
  assert (stats->>'completed')::int = (baseline->>'completed')::int + 4;
  assert (stats->>'passed')::int = (baseline->>'passed')::int + 2;
  assert (stats->>'participants')::int = expected_participants, 'Global participants must be unique across quizzes';
  assert abs((stats->>'averageScore')::numeric -
    (coalesce((baseline->>'averageScore')::numeric,0) * scored + 200) / (scored + 4)) < 0.00001,
    'Global score must be weighted by attempts';
end;
$test$;
set local role authenticated;
do $test$
declare claims text;
begin
  -- Exercise the real authenticated role, not a database owner bypass.
  perform public.admin_quiz_statistics();
  foreach claims in array array[
    '{"sub":"00000000-0000-4000-8000-000000000001","app_metadata":{"role":"editor"}}',
    '{"sub":"00000000-0000-4000-8000-000000000001","user_metadata":{"role":"admin"}}',
    '{"app_metadata":{"role":"admin"}}'
  ] loop
    perform set_config('request.jwt.claims', claims, true);
    begin
      perform public.admin_quiz_statistics();
      raise exception 'Unauthorized statistics access';
    exception when insufficient_privilege then null;
    end;
  end loop;
  assert not has_function_privilege('anon','public.admin_quiz_statistics()','execute');
  assert not has_function_privilege('anon','private.get_admin_quiz_statistics()','execute');
end;
$test$;

rollback;
