-- Keep the public estimate aligned with the six lesson estimates (62 minutes)
-- while retaining the simpler, honest "cirka en time" promise in the title.
update public.courses
set
  title = 'AI i praksis – din første AI-gevinst på cirka en time',
  estimated_minutes = 62,
  updated_at = now()
where slug = 'ai-i-praksis-dit-foerste-kursus';

-- Fail loudly if the stable database ID no longer represents the course and
-- lesson slugs used by the application to mount the interactive exercise.
do $contract$
begin
  if not exists (
    select 1
    from public.lessons l
    join public.course_modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where l.id = 'c650d0a0-62b1-4af2-be1a-ed5c16042bdc'
      and l.slug = 'hvad-er-generativ-ai'
      and c.slug = 'ai-i-praksis-dit-foerste-kursus'
  ) then
    raise exception 'Challenge Coach lesson ID/slug contract is out of sync';
  end if;
end
$contract$;
