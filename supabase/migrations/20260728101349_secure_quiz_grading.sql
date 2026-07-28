-- Quiz grading is deliberately isolated from the Data API. The private function
-- may read quiz_option_keys, but it never returns correct option identifiers.
drop policy if exists "Admins manage quiz answer keys" on public.quiz_option_keys;
revoke all on table public.quiz_option_keys from anon;
revoke all on table public.quiz_option_keys from authenticated;

create or replace function private.grade_quiz(
  p_quiz_id uuid,
  p_answers jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private, auth, pg_temp
as $function$
declare
  v_user_id uuid := auth.uid();
  v_quiz public.quizzes%rowtype;
  v_question public.quiz_questions%rowtype;
  v_answer jsonb;
  v_answer_question_id uuid;
  v_option_text text;
  v_option_id uuid;
  v_seen_question_ids uuid[] := '{}'::uuid[];
  v_selected_option_ids uuid[];
  v_correct_option_ids uuid[];
  v_free_text_answer text;
  v_is_correct boolean;
  v_points_awarded numeric;
  v_total_points numeric := 0;
  v_earned_points numeric := 0;
  v_score numeric := 0;
  v_passed boolean := false;
  v_attempt_id uuid;
  v_attempts_used integer := 0;
  v_results jsonb := '[]'::jsonb;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'AUTH_REQUIRED';
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'array' then
    raise exception using errcode = '22023', message = 'INVALID_ANSWERS';
  end if;

  select q.*
    into v_quiz
    from public.quizzes q
   where q.id = p_quiz_id;

  if not found or not private.can_access_lesson(v_quiz.lesson_id) then
    raise exception using errcode = '42501', message = 'QUIZ_NOT_ACCESSIBLE';
  end if;

  -- Serialize submissions per user and quiz so parallel requests cannot exceed
  -- max_attempts before either transaction becomes visible to the other.
  perform pg_advisory_xact_lock(
    hashtextextended(v_user_id::text || ':' || p_quiz_id::text, 0)
  );

  select count(*)::integer
    into v_attempts_used
    from public.quiz_attempts qa
   where qa.quiz_id = p_quiz_id
     and qa.user_id = v_user_id
     and qa.completed_at is not null;

  if v_quiz.max_attempts is not null and v_attempts_used >= v_quiz.max_attempts then
    raise exception using errcode = 'P0001', message = 'MAX_ATTEMPTS_REACHED';
  end if;

  -- Validate the entire payload before creating the attempt.
  for v_answer in
    select value from jsonb_array_elements(p_answers)
  loop
    if jsonb_typeof(v_answer) <> 'object'
      or jsonb_typeof(v_answer -> 'question_id') <> 'string'
      or jsonb_typeof(coalesce(v_answer -> 'selected_option_ids', '[]'::jsonb)) <> 'array'
    then
      raise exception using errcode = '22023', message = 'INVALID_ANSWER_SHAPE';
    end if;

    begin
      v_answer_question_id := (v_answer ->> 'question_id')::uuid;
    exception when invalid_text_representation then
      raise exception using errcode = '22023', message = 'INVALID_QUESTION_ID';
    end;

    if v_answer_question_id = any(v_seen_question_ids) then
      raise exception using errcode = '22023', message = 'DUPLICATE_QUESTION';
    end if;
    v_seen_question_ids := array_append(v_seen_question_ids, v_answer_question_id);

    select qq.*
      into v_question
      from public.quiz_questions qq
     where qq.id = v_answer_question_id
       and qq.quiz_id = p_quiz_id;

    if not found then
      raise exception using errcode = '22023', message = 'QUESTION_NOT_IN_QUIZ';
    end if;

    v_selected_option_ids := '{}'::uuid[];
    for v_option_text in
      select value
        from jsonb_array_elements_text(
          coalesce(v_answer -> 'selected_option_ids', '[]'::jsonb)
        )
    loop
      begin
        v_option_id := v_option_text::uuid;
      exception when invalid_text_representation then
        raise exception using errcode = '22023', message = 'INVALID_OPTION_ID';
      end;

      if v_option_id = any(v_selected_option_ids) then
        raise exception using errcode = '22023', message = 'DUPLICATE_OPTION';
      end if;

      if not exists (
        select 1
          from public.quiz_options qo
         where qo.id = v_option_id
           and qo.question_id = v_answer_question_id
      ) then
        raise exception using errcode = '22023', message = 'OPTION_NOT_IN_QUESTION';
      end if;

      v_selected_option_ids := array_append(v_selected_option_ids, v_option_id);
    end loop;

    if v_question.type in ('single_choice', 'true_false')
      and cardinality(v_selected_option_ids) > 1
    then
      raise exception using errcode = '22023', message = 'TOO_MANY_OPTIONS';
    end if;

    if length(coalesce(v_answer ->> 'free_text_answer', '')) > 5000 then
      raise exception using errcode = '22023', message = 'FREE_TEXT_TOO_LONG';
    end if;
  end loop;

  insert into public.quiz_attempts (
    quiz_id,
    user_id,
    started_at
  )
  values (
    p_quiz_id,
    v_user_id,
    now()
  )
  returning id into v_attempt_id;

  for v_question in
    select qq.*
      from public.quiz_questions qq
     where qq.quiz_id = p_quiz_id
     order by qq.sort_order, qq.id
  loop
    v_answer := null;
    select value
      into v_answer
      from jsonb_array_elements(p_answers)
     where (value ->> 'question_id')::uuid = v_question.id
     limit 1;

    select coalesce(array_agg(selected_id order by selected_id), '{}'::uuid[])
      into v_selected_option_ids
      from (
        select distinct value::uuid as selected_id
          from jsonb_array_elements_text(
            coalesce(v_answer -> 'selected_option_ids', '[]'::jsonb)
          )
      ) selected;

    select coalesce(array_agg(qo.id order by qo.id), '{}'::uuid[])
      into v_correct_option_ids
      from public.quiz_options qo
      join public.quiz_option_keys qok on qok.option_id = qo.id
     where qo.question_id = v_question.id
       and qok.is_correct = true;

    v_free_text_answer := nullif(btrim(v_answer ->> 'free_text_answer'), '');
    v_total_points := v_total_points + v_question.points;

    if v_question.type = 'free_text' then
      v_is_correct := null;
      v_points_awarded := 0;
    else
      v_is_correct :=
        cardinality(v_correct_option_ids) > 0
        and v_selected_option_ids = v_correct_option_ids;
      v_points_awarded := case when v_is_correct then v_question.points else 0 end;
    end if;

    v_earned_points := v_earned_points + v_points_awarded;

    insert into public.quiz_answers (
      attempt_id,
      question_id,
      selected_option_ids,
      free_text_answer,
      is_correct,
      points_awarded
    )
    values (
      v_attempt_id,
      v_question.id,
      v_selected_option_ids,
      v_free_text_answer,
      v_is_correct,
      v_points_awarded
    );

    v_results := v_results || jsonb_build_array(
      jsonb_build_object(
        'question_id', v_question.id,
        'is_correct', v_is_correct,
        'points_awarded', v_points_awarded,
        'points_possible', v_question.points,
        'explanation', v_question.explanation
      )
    );
  end loop;

  if v_total_points > 0 then
    v_score := round((v_earned_points / v_total_points) * 100, 2);
  end if;
  v_passed := v_score >= v_quiz.passing_score;

  update public.quiz_attempts
     set score = v_score,
         passed = v_passed,
         completed_at = now()
   where id = v_attempt_id;

  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'quiz_id', p_quiz_id,
    'score', v_score,
    'passed', v_passed,
    'passing_score', v_quiz.passing_score,
    'attempts_used', v_attempts_used + 1,
    'max_attempts', v_quiz.max_attempts,
    'attempts_remaining',
      case
        when v_quiz.max_attempts is null then null
        else greatest(v_quiz.max_attempts - (v_attempts_used + 1), 0)
      end,
    'questions', v_results
  );
end;
$function$;

comment on function private.grade_quiz(uuid, jsonb) is
  'Atomically grades and stores a quiz attempt without exposing quiz_option_keys.';

revoke all on function private.grade_quiz(uuid, jsonb) from public;
revoke all on function private.grade_quiz(uuid, jsonb) from anon;
grant usage on schema private to authenticated;
grant execute on function private.grade_quiz(uuid, jsonb) to authenticated;

-- PostgREST exposes this narrow invoker wrapper through /rpc/submit_quiz.
create or replace function public.submit_quiz(
  p_quiz_id uuid,
  p_answers jsonb
)
returns jsonb
language sql
volatile
security invoker
set search_path = pg_catalog, public, private, auth, pg_temp
as $function$
  select private.grade_quiz(p_quiz_id, p_answers);
$function$;

comment on function public.submit_quiz(uuid, jsonb) is
  'Authenticated RPC wrapper for private.grade_quiz. Returns score and explanations, never answer keys.';

revoke all on function public.submit_quiz(uuid, jsonb) from public;
revoke all on function public.submit_quiz(uuid, jsonb) from anon;
grant execute on function public.submit_quiz(uuid, jsonb) to authenticated;
