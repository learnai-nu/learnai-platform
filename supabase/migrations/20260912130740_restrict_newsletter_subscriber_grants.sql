-- Newsletter addresses are personal data. Public forms only need to append
-- the three fields below; reading or editing the subscriber list remains a
-- backend responsibility.
revoke all privileges
on table public.newsletter_subscribers
from authenticated;

grant insert (email, first_name, source)
on table public.newsletter_subscribers
to authenticated;
