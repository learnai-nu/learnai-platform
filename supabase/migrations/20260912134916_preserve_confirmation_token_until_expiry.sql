drop policy if exists newsletter_confirmation_update on public.newsletter_subscribers;

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
  confirmation_token_hash = (
    coalesce(current_setting('request.headers', true), '{}')::jsonb ->> 'x-newsletter-token'
  )
  and confirmation_expires_at > now()
  and confirmed_at is not null
  and unsubscribed_at is null
);

revoke update (confirmation_token_hash, confirmation_expires_at)
on table public.newsletter_subscribers from anon, authenticated;
