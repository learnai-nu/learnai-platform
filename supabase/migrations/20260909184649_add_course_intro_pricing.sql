-- Keep limited introductory pricing explicit and editable instead of hiding it
-- in course copy. Both intro fields must be set together.
alter table public.courses
  add column if not exists intro_price_dkk numeric,
  add column if not exists intro_seat_limit integer;

alter table public.courses
  drop constraint if exists courses_intro_price_dkk_check,
  drop constraint if exists courses_intro_seat_limit_check,
  drop constraint if exists courses_intro_offer_complete_check;

alter table public.courses
  add constraint courses_intro_price_dkk_check
    check (intro_price_dkk is null or (intro_price_dkk > 0 and intro_price_dkk < price_dkk)),
  add constraint courses_intro_seat_limit_check
    check (intro_seat_limit is null or intro_seat_limit > 0),
  add constraint courses_intro_offer_complete_check
    check ((intro_price_dkk is null) = (intro_seat_limit is null));

comment on column public.courses.intro_price_dkk is
  'Limited introductory price. Null when no introductory offer is active.';
comment on column public.courses.intro_seat_limit is
  'Maximum number of seats offered at intro_price_dkk. Availability is enforced by the future checkout flow.';

update public.courses
set
  price_dkk = 995,
  intro_price_dkk = 497.50,
  intro_seat_limit = 50,
  updated_at = now()
where slug = 'ai-for-ledere';
