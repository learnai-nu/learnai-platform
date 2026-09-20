-- Verify drill-down counts, per-user lesson state and authorization; rollback all fixtures.
begin;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000001","app_metadata":{"role":"admin"},"role":"authenticated"}', true);
do $test$
declare
  cid uuid := gen_random_uuid(); mid uuid := gen_random_uuid();
  la uuid := gen_random_uuid(); lb uuid := gen_random_uuid();
  ua uuid; ub uuid; result jsonb; item jsonb; email_a text;
begin
  select id, email into ua, email_a from auth.users order by id limit 1;
  select id into ub from auth.users where id <> ua order by id limit 1;
  if ub is null then raise exception 'Test requires two existing users'; end if;
  insert into public.courses(id,title,slug) values(cid,'Participant test','participant-test-' || cid);
  insert into public.course_modules(id,course_id,title) values(mid,cid,'Test module');
  insert into public.lessons(id,module_id,title,slug,sort_order) values
    (la,mid,'First','test-a-' || la,0), (lb,mid,'Second','test-b-' || lb,1);
  insert into public.enrollments(user_id,course_id) values(ua,cid), (ub,cid);
  insert into public.lesson_progress(user_id,lesson_id,completed) values(ua,la,true);
  result := public.admin_course_participants(cid);
  assert (result->>'total')::int = 2;
  assert jsonb_array_length(result->'items') = 2;
  assert (public.admin_course_participants(cid,'not_started')->>'total')::int = 1;
  assert (public.admin_course_participants(cid,'in_progress')->>'total')::int = 1;
  assert (public.admin_course_participants(cid,'completed')->>'total')::int = 0;
  select value into item from jsonb_array_elements(result->'items') where value->>'userId' = ua::text;
  assert (item->>'completedCount')::int = 1;
  assert (item->>'lessonCount')::int = 2;
  assert item->'lessons'->0->>'title' = 'First';
  assert item->'lessons'->0->>'completed' = 'true';
  assert item->'lessons'->1->>'started' = 'false';
  select value into item from jsonb_array_elements(result->'items') where value->>'userId' = ub::text;
  assert (item->>'completedCount')::int = 0, 'Progress must not leak across learners';
  assert item->'lessons'->0->>'completed' = 'false';
  assert (public.admin_course_participants(cid,'all',upper(email_a))->>'total')::int = 1;
  assert (public.admin_course_participants(cid,'all','unlikely-absent-name-' || cid)->>'total')::int = 0;
  assert jsonb_array_length(public.admin_course_participants(cid,'all','',2)->'items') = 0;
  assert (public.admin_course_participants(cid,'all','',2)->>'total')::int = 2;

  insert into public.lesson_progress(user_id,lesson_id,completed) values(ua,lb,true),(ub,lb,false);
  assert (public.admin_course_participants(cid,'completed')->>'total')::int = 1;
  assert (public.admin_course_participants(cid,'converted')->>'total')::int = 1;
  delete from public.enrollments where course_id = cid and user_id = ua;
  result := public.admin_course_participants(cid,'unregistered');
  assert (result->>'total')::int = 1;
  assert result->'items'->0->>'userId' = ua::text;
  assert result->'items'->0->>'enrolled' = 'false';
  assert (public.admin_course_participants(cid,'enrolled')->>'total')::int = 1;
  assert (public.admin_course_participants(cid,'converted')->>'total')::int = 0;
  assert (public.admin_course_participants(gen_random_uuid())->>'total')::int = 0;
  begin
    perform public.admin_course_participants(cid,'invalid');
    raise exception 'Invalid filter accepted';
  exception when invalid_parameter_value then null;
  end;
end;
$test$;
set local role authenticated;
do $test$
declare claims text;
begin
  perform public.admin_course_participants();
  foreach claims in array array[
    '{"sub":"00000000-0000-4000-8000-000000000001","app_metadata":{"role":"editor"}}',
    '{"sub":"00000000-0000-4000-8000-000000000001","user_metadata":{"role":"admin"}}',
    '{"app_metadata":{"role":"admin"}}'
  ] loop
    perform set_config('request.jwt.claims', claims, true);
    begin
      perform public.admin_course_participants();
      raise exception 'Unauthorized participant access';
    exception when insufficient_privilege then null;
    end;
  end loop;
  assert not has_function_privilege('anon','public.admin_course_participants(uuid,text,text,integer)','execute');
  assert not has_function_privilege('anon','private.get_admin_course_participants(uuid,text,text,integer)','execute');
end;
$test$;
rollback;
