-- An explanation may reveal the answer. Browser roles retain access only to
-- the fields needed to render a question; grading returns the explanation
-- after the attempt has been completed.
revoke select on table public.quiz_questions from authenticated;

grant select (
  id,
  quiz_id,
  type,
  question,
  points,
  sort_order,
  created_at,
  updated_at
) on table public.quiz_questions to authenticated;
