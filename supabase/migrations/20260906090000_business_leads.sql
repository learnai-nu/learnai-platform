-- Leadmotor for /virksomheder. Formularen på siden er offentlig, men de
-- indsendte oplysninger er persondata og må kun læses af administratorer.
-- RLS er grænsen: anon må indsætte og intet andet, editors ser ingenting.

-- Migrationen kan køres igen oven på et miljø, hvor dele allerede findes.

-- Tidligere migrationer antog, at private-skemaet fandtes. Det gør det ikke
-- nødvendigvis, så det oprettes her. Skemaet må ikke være synligt for
-- browserrollerne ud over den ene funktion, politikkerne kalder.
create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
grant usage on schema private to authenticated;

do $$ begin
  create type public.business_lead_size as enum ('1-9', '10-49', '50-249', '250+');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.business_lead_status as enum ('new', 'contacted', 'qualified', 'won', 'lost');
exception when duplicate_object then null; end $$;

create table if not exists public.business_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  work_email text not null,
  company text not null,
  role_title text,
  company_size public.business_lead_size,
  goal text not null default '',
  source text not null default 'virksomheder',
  status public.business_lead_status not null default 'new',
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_leads_created_at_idx
  on public.business_leads (created_at desc);

alter table public.business_leads enable row level security;
alter table public.business_leads force row level security;

-- Administratorrollen alene. Redaktører redigerer indhold, ikke leads.
create or replace function private.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog, auth, pg_temp
as $function$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$function$;

revoke all on function private.is_admin() from public;
revoke all on function private.is_admin() from anon;
grant execute on function private.is_admin() to authenticated;

drop policy if exists business_leads_public_insert on public.business_leads;
create policy business_leads_public_insert on public.business_leads
  for insert to anon, authenticated
  with check (true);

drop policy if exists business_leads_admin_read on public.business_leads;
create policy business_leads_admin_read on public.business_leads
  for select to authenticated
  using (private.is_admin());

drop policy if exists business_leads_admin_write on public.business_leads;
create policy business_leads_admin_write on public.business_leads
  for update to authenticated
  using (private.is_admin())
  with check (private.is_admin());

-- Ingen af browserrollerne må læse eller ændre andet end de felter,
-- formularen selv udfylder. status og internal_note tilhører administrationen.
revoke all on table public.business_leads from anon, authenticated;
grant insert (name, work_email, company, role_title, company_size, goal, source)
  on table public.business_leads to anon, authenticated;
grant select, update (status, internal_note) on table public.business_leads to authenticated;

create or replace function public.set_business_leads_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, pg_temp
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

drop trigger if exists business_leads_set_updated_at on public.business_leads;
create trigger business_leads_set_updated_at
  before update on public.business_leads
  for each row execute function public.set_business_leads_updated_at();
