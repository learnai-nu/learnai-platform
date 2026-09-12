create schema if not exists private;

create table public.newsletter_subscription_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text,
  source text not null,
  consent_at timestamptz not null default now(),
  confirmation_token_hash text not null,
  created_at timestamptz not null default now(),
  constraint newsletter_subscription_requests_email_length check (length(email) <= 254),
  constraint newsletter_subscription_requests_token_format check (confirmation_token_hash ~ '^[a-f0-9]{64}$')
);

alter table public.newsletter_subscription_requests enable row level security;

create policy newsletter_request_insert
on public.newsletter_subscription_requests
for insert
to anon, authenticated
with check (
  email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  and length(email) <= 254
  and confirmation_token_hash ~ '^[a-f0-9]{64}$'
);

create or replace function private.capture_newsletter_subscription_request()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
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
    lower(trim(new.email)),
    nullif(trim(new.first_name), ''),
    new.source,
    new.consent_at,
    new.confirmation_token_hash,
    now() + interval '24 hours',
    now(),
    null,
    null,
    null
  )
  on conflict ((lower(email))) do update set
    first_name = excluded.first_name,
    source = excluded.source,
    consent_at = excluded.consent_at,
    confirmation_token_hash = excluded.confirmation_token_hash,
    confirmation_expires_at = excluded.confirmation_expires_at,
    confirmation_sent_at = excluded.confirmation_sent_at,
    confirmed_at = case
      when public.newsletter_subscribers.unsubscribed_at is null
        then public.newsletter_subscribers.confirmed_at
      else null
    end,
    unsubscribed_at = case
      when public.newsletter_subscribers.unsubscribed_at is null
        then null
      else public.newsletter_subscribers.unsubscribed_at
    end;

  -- The public table is a write-only command surface, not a second store of PII.
  return null;
end;
$$;

create trigger newsletter_subscription_request_capture
before insert on public.newsletter_subscription_requests
for each row execute function private.capture_newsletter_subscription_request();

revoke all on table public.newsletter_subscription_requests from public, anon, authenticated;
grant insert (email, first_name, source, consent_at, confirmation_token_hash)
on table public.newsletter_subscription_requests to anon, authenticated;

revoke all on function private.capture_newsletter_subscription_request() from public, anon, authenticated;

drop function if exists public.request_newsletter_subscription(text, text, text, text);
drop function if exists public.get_newsletter_confirmation(text);
drop function if exists public.confirm_newsletter_subscription(text, text);

create policy newsletter_confirmation_lookup
on public.newsletter_subscribers
for select
to anon, authenticated
using (
  confirmation_token_hash = (
    coalesce(current_setting('request.headers', true), '{}')::jsonb ->> 'x-newsletter-token'
  )
  and confirmation_expires_at > now()
);

create policy newsletter_confirmation_update
on public.newsletter_subscribers
for update
to anon, authenticated
using (
  confirmation_token_hash = (
    coalesce(current_setting('request.headers', true), '{}')::jsonb ->> 'x-newsletter-token'
  )
  and confirmation_expires_at > now()
)
with check (
  confirmed_at is not null
  and unsubscribed_at is null
  and confirmation_token_hash is null
  and confirmation_expires_at is null
);

grant select (id, email, first_name, confirmation_token_hash, confirmation_expires_at, confirmed_at)
on table public.newsletter_subscribers to anon, authenticated;
grant update (confirmed_at, unsubscribed_at, resend_contact_id, confirmation_token_hash, confirmation_expires_at)
on table public.newsletter_subscribers to anon, authenticated;
