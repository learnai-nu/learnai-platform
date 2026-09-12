-- Add double opt-in evidence without exposing subscriber data through the Data API.
alter table public.newsletter_subscribers
  add column confirmation_token_hash text,
  add column confirmation_expires_at timestamptz,
  add column confirmation_sent_at timestamptz,
  add column confirmed_at timestamptz,
  add column resend_contact_id text;

-- Existing rows were collected through the explicit consent checkbox. Preserve
-- that consent if any rows predate this migration.
update public.newsletter_subscribers
set confirmed_at = consent_at
where confirmed_at is null;

create unique index newsletter_subscribers_confirmation_token_hash_key
on public.newsletter_subscribers (confirmation_token_hash)
where confirmation_token_hash is not null;

create or replace function public.request_newsletter_subscription(
  p_email text,
  p_first_name text,
  p_source text,
  p_confirmation_token_hash text
)
returns table (should_send_confirmation boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  existing_confirmed_at timestamptz;
  existing_unsubscribed_at timestamptz;
begin
  if p_email is null
    or p_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    or length(p_email) > 254
    or p_confirmation_token_hash !~ '^[a-f0-9]{64}$'
  then
    raise exception 'invalid newsletter subscription request';
  end if;

  select ns.confirmed_at, ns.unsubscribed_at
  into existing_confirmed_at, existing_unsubscribed_at
  from public.newsletter_subscribers ns
  where lower(ns.email) = lower(trim(p_email));

  if existing_confirmed_at is not null and existing_unsubscribed_at is null then
    return query select false;
    return;
  end if;

  insert into public.newsletter_subscribers (
    email,
    first_name,
    source,
    consent_at,
    confirmation_token_hash,
    confirmation_expires_at,
    confirmation_sent_at,
    confirmed_at,
    unsubscribed_at,
    resend_contact_id
  ) values (
    lower(trim(p_email)),
    nullif(trim(p_first_name), ''),
    p_source,
    now(),
    p_confirmation_token_hash,
    now() + interval '24 hours',
    now(),
    null,
    null,
    null
  )
  on conflict ((lower(email))) do update set
    first_name = excluded.first_name,
    source = excluded.source,
    consent_at = now(),
    confirmation_token_hash = excluded.confirmation_token_hash,
    confirmation_expires_at = excluded.confirmation_expires_at,
    confirmation_sent_at = now(),
    confirmed_at = null,
    unsubscribed_at = null,
    resend_contact_id = null;

  return query select true;
end;
$$;

create or replace function public.get_newsletter_confirmation(
  p_confirmation_token_hash text
)
returns table (email text, first_name text)
language sql
security definer
set search_path = public, pg_temp
as $$
  select ns.email, ns.first_name
  from public.newsletter_subscribers ns
  where ns.confirmation_token_hash = p_confirmation_token_hash
    and ns.confirmation_expires_at > now()
    and ns.confirmed_at is null
  limit 1;
$$;

create or replace function public.confirm_newsletter_subscription(
  p_confirmation_token_hash text,
  p_resend_contact_id text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  changed_rows integer;
begin
  update public.newsletter_subscribers
  set
    confirmed_at = now(),
    unsubscribed_at = null,
    resend_contact_id = nullif(trim(p_resend_contact_id), ''),
    confirmation_token_hash = null,
    confirmation_expires_at = null
  where confirmation_token_hash = p_confirmation_token_hash
    and confirmation_expires_at > now()
    and confirmed_at is null;

  get diagnostics changed_rows = row_count;
  return changed_rows = 1;
end;
$$;

-- Tables stay private. Only the three narrowly scoped operations are available
-- to the public forms, and token possession is required for confirmation.
revoke all on table public.newsletter_subscribers from anon, authenticated;
revoke all on function public.request_newsletter_subscription(text, text, text, text) from public;
revoke all on function public.get_newsletter_confirmation(text) from public;
revoke all on function public.confirm_newsletter_subscription(text, text) from public;

grant execute on function public.request_newsletter_subscription(text, text, text, text) to anon, authenticated;
grant execute on function public.get_newsletter_confirmation(text) to anon, authenticated;
grant execute on function public.confirm_newsletter_subscription(text, text) to anon, authenticated;
