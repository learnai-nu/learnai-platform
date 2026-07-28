-- Quiz answer keys remain inaccessible to browser roles. These private
-- functions expose only a content-manager workflow and validate the JWT role
-- again inside the database.
create or replace function private.is_content_manager()
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog, auth, pg_temp
as $function$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'editor');
$function$;

revoke all on function private.is_content_manager() from public;
revoke all on function private.is_content_manager() from anon;
grant execute on function private.is_content_manager() to authenticated;

create or replace function private.get_admin_quiz(p_quiz_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public, private, auth, pg_temp
as $function$
declare
  v_result jsonb;
begin
  if not private.is_content_manager() then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;

  select jsonb_build_object(
    'id', q.id,
    'lesson_id', q.lesson_id,
    'title', q.title,
    'description', q.description,
    'passing_score', q.passing_score,
    'max_attempts', q.max_attempts,
    'questions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', qq.id,
          'type', qq.type,
          'question', qq.question,
          'explanation', qq.explanation,
          'points', qq.points,
          'sort_order', qq.sort_order,
          'options', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', qo.id,
                'option_text', qo.option_text,
                'sort_order', qo.sort_order,
                'is_correct', coalesce(qok.is_correct, false)
              )
              order by qo.sort_order, qo.id
            )
            from public.quiz_options qo
            left join public.quiz_option_keys qok on qok.option_id = qo.id
            where qo.question_id = qq.id
          ), '[]'::jsonb)
        )
        order by qq.sort_order, qq.id
      )
      from public.quiz_questions qq
      where qq.quiz_id = q.id
    ), '[]'::jsonb)
  )
  into v_result
  from public.quizzes q
  where q.id = p_quiz_id;

  if v_result is null then
    raise exception using errcode = 'P0002', message = 'QUIZ_NOT_FOUND';
  end if;

  return v_result;
end;
$function$;

revoke all on function private.get_admin_quiz(uuid) from public;
revoke all on function private.get_admin_quiz(uuid) from anon;
grant usage on schema private to authenticated;
grant execute on function private.get_admin_quiz(uuid) to authenticated;

create or replace function private.upsert_admin_quiz_question(
  p_quiz_id uuid,
  p_question_id uuid,
  p_type public.question_type,
  p_question text,
  p_explanation text,
  p_points smallint,
  p_sort_order integer,
  p_options jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private, auth, pg_temp
as $function$
declare
  v_question_id uuid := coalesce(p_question_id, gen_random_uuid());
  v_existing_type public.question_type;
  v_option jsonb;
  v_option_id uuid;
  v_option_text text;
  v_is_correct boolean;
  v_sort_order integer;
  v_option_ids uuid[] := '{}'::uuid[];
  v_option_count integer;
  v_correct_count integer;
begin
  if not private.is_content_manager() then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;

  if not exists (select 1 from public.quizzes where id = p_quiz_id) then
    raise exception using errcode = 'P0002', message = 'QUIZ_NOT_FOUND';
  end if;

  if length(btrim(coalesce(p_question, ''))) < 2
    or length(p_question) > 2000
    or length(coalesce(p_explanation, '')) > 5000
    or p_points < 1
    or p_sort_order < 0
  then
    raise exception using errcode = '22023', message = 'INVALID_QUESTION';
  end if;

  if p_options is null or jsonb_typeof(p_options) <> 'array' then
    raise exception using errcode = '22023', message = 'INVALID_OPTIONS';
  end if;

  select type
  into v_existing_type
  from public.quiz_questions
  where id = v_question_id
    and quiz_id = p_quiz_id;

  if found then
    if v_existing_type <> p_type then
      raise exception using errcode = '22023', message = 'QUESTION_TYPE_IMMUTABLE';
    end if;

    update public.quiz_questions
    set question = btrim(p_question),
        explanation = nullif(btrim(coalesce(p_explanation, '')), ''),
        points = p_points,
        sort_order = p_sort_order,
        updated_at = now()
    where id = v_question_id
      and quiz_id = p_quiz_id;
  else
    insert into public.quiz_questions (
      id,
      quiz_id,
      type,
      question,
      explanation,
      points,
      sort_order
    )
    values (
      v_question_id,
      p_quiz_id,
      p_type,
      btrim(p_question),
      nullif(btrim(coalesce(p_explanation, '')), ''),
      p_points,
      p_sort_order
    );
  end if;

  if p_type = 'free_text' then
    if jsonb_array_length(p_options) <> 0
      or exists (select 1 from public.quiz_options where question_id = v_question_id)
    then
      raise exception using errcode = '22023', message = 'FREE_TEXT_HAS_OPTIONS';
    end if;

    return private.get_admin_quiz(p_quiz_id);
  end if;

  if jsonb_array_length(p_options) < 2 or jsonb_array_length(p_options) > 6 then
    raise exception using errcode = '22023', message = 'INVALID_OPTION_COUNT';
  end if;

  for v_option in select value from jsonb_array_elements(p_options)
  loop
    if jsonb_typeof(v_option) <> 'object'
      or jsonb_typeof(v_option -> 'text') <> 'string'
      or jsonb_typeof(v_option -> 'is_correct') <> 'boolean'
    then
      raise exception using errcode = '22023', message = 'INVALID_OPTION_SHAPE';
    end if;

    v_option_text := btrim(v_option ->> 'text');
    if length(v_option_text) < 1 or length(v_option_text) > 500 then
      raise exception using errcode = '22023', message = 'INVALID_OPTION_TEXT';
    end if;

    begin
      v_sort_order := coalesce((v_option ->> 'sort_order')::integer, 0);
      v_is_correct := (v_option ->> 'is_correct')::boolean;
      v_option_id := nullif(v_option ->> 'id', '')::uuid;
    exception when invalid_text_representation then
      raise exception using errcode = '22023', message = 'INVALID_OPTION_VALUE';
    end;

    if v_sort_order < 0 then
      raise exception using errcode = '22023', message = 'INVALID_OPTION_ORDER';
    end if;

    if v_option_id is not null and v_option_id = any(v_option_ids) then
      raise exception using errcode = '22023', message = 'DUPLICATE_OPTION';
    end if;

    if v_option_id is null then
      insert into public.quiz_options (question_id, option_text, sort_order)
      values (v_question_id, v_option_text, v_sort_order)
      returning id into v_option_id;
    else
      update public.quiz_options
      set option_text = v_option_text,
          sort_order = v_sort_order
      where id = v_option_id
        and question_id = v_question_id;

      if not found then
        raise exception using errcode = '22023', message = 'OPTION_NOT_IN_QUESTION';
      end if;
    end if;

    v_option_ids := array_append(v_option_ids, v_option_id);

    insert into public.quiz_option_keys (option_id, is_correct)
    values (v_option_id, v_is_correct)
    on conflict (option_id)
    do update set is_correct = excluded.is_correct;
  end loop;

  select count(*), count(*) filter (where qok.is_correct)
  into v_option_count, v_correct_count
  from public.quiz_options qo
  left join public.quiz_option_keys qok on qok.option_id = qo.id
  where qo.question_id = v_question_id;

  if v_option_count > 6 then
    raise exception using errcode = '22023', message = 'TOO_MANY_STORED_OPTIONS';
  end if;

  if p_type in ('single_choice', 'true_false') and v_correct_count <> 1 then
    raise exception using errcode = '22023', message = 'ONE_CORRECT_OPTION_REQUIRED';
  end if;

  if p_type = 'multiple_choice' and v_correct_count < 1 then
    raise exception using errcode = '22023', message = 'CORRECT_OPTION_REQUIRED';
  end if;

  if p_type = 'true_false' and v_option_count <> 2 then
    raise exception using errcode = '22023', message = 'TRUE_FALSE_REQUIRES_TWO_OPTIONS';
  end if;

  return private.get_admin_quiz(p_quiz_id);
end;
$function$;

revoke all on function private.upsert_admin_quiz_question(
  uuid,
  uuid,
  public.question_type,
  text,
  text,
  smallint,
  integer,
  jsonb
) from public;
revoke all on function private.upsert_admin_quiz_question(
  uuid,
  uuid,
  public.question_type,
  text,
  text,
  smallint,
  integer,
  jsonb
) from anon;
grant execute on function private.upsert_admin_quiz_question(
  uuid,
  uuid,
  public.question_type,
  text,
  text,
  smallint,
  integer,
  jsonb
) to authenticated;

create or replace function public.admin_get_quiz(p_quiz_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = pg_catalog, public, private, auth, pg_temp
as $function$
  select private.get_admin_quiz(p_quiz_id);
$function$;

create or replace function public.admin_upsert_quiz_question(
  p_quiz_id uuid,
  p_question_id uuid,
  p_type public.question_type,
  p_question text,
  p_explanation text,
  p_points smallint,
  p_sort_order integer,
  p_options jsonb
)
returns jsonb
language sql
volatile
security invoker
set search_path = pg_catalog, public, private, auth, pg_temp
as $function$
  select private.upsert_admin_quiz_question(
    p_quiz_id,
    p_question_id,
    p_type,
    p_question,
    p_explanation,
    p_points,
    p_sort_order,
    p_options
  );
$function$;

revoke all on function public.admin_get_quiz(uuid) from public;
revoke all on function public.admin_get_quiz(uuid) from anon;
grant execute on function public.admin_get_quiz(uuid) to authenticated;

revoke all on function public.admin_upsert_quiz_question(
  uuid,
  uuid,
  public.question_type,
  text,
  text,
  smallint,
  integer,
  jsonb
) from public;
revoke all on function public.admin_upsert_quiz_question(
  uuid,
  uuid,
  public.question_type,
  text,
  text,
  smallint,
  integer,
  jsonb
) from anon;
grant execute on function public.admin_upsert_quiz_question(
  uuid,
  uuid,
  public.question_type,
  text,
  text,
  smallint,
  integer,
  jsonb
) to authenticated;

comment on function public.admin_get_quiz(uuid) is
  'Content-manager-only quiz editor payload. Never available to anon or learners.';
comment on function public.admin_upsert_quiz_question(
  uuid,
  uuid,
  public.question_type,
  text,
  text,
  smallint,
  integer,
  jsonb
) is
  'Atomically saves an admin quiz question and protected answer keys.';
