-- ═══════════════════════════════════════════════════════════
-- TradeValue Pro — повна схема бази даних для Supabase
-- Запустіть цей файл в Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ── Companies ─────────────────────────────────────────────
create table public.companies (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  business_type text,
  city          text,
  plan          text not null default 'starter',
  plan_expires  timestamptz,
  estimations_this_month int not null default 0,
  created_at    timestamptz default now()
);

-- ── Users (extends auth.users) ────────────────────────────
create table public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text not null default '',
  role       text not null default 'manager' check (role in ('owner','admin','manager','viewer')),
  company_id uuid references public.companies(id) on delete set null,
  phone      text,
  address    text,
  created_at timestamptz default now()
);

-- Auto-create user record on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Company Rules ─────────────────────────────────────────
create table public.company_rules (
  id                    uuid primary key default uuid_generate_v4(),
  company_id            uuid not null references public.companies(id) on delete cascade unique,
  default_buy_percent   numeric not null default 20,
  default_sell_percent  numeric not null default 5,
  min_profit            numeric not null default 2500,
  min_profitability     numeric not null default 15,
  max_buy_price         numeric not null default 50000,
  min_buy_price         numeric not null default 3000,
  max_market_price      numeric not null default 80000,
  min_market_price      numeric not null default 2000,
  tradein_enabled       boolean not null default true,
  tradein_type          text not null default 'percent',
  tradein_value         numeric not null default 5,
  updated_at            timestamptz default now()
);

-- ── Estimations ───────────────────────────────────────────
create table public.estimations (
  id                  uuid primary key default uuid_generate_v4(),
  company_id          uuid not null references public.companies(id) on delete cascade,
  user_id             uuid not null references public.users(id) on delete set null,
  category_id         text not null,
  category_name       text not null,
  brand_name          text,
  model_name          text,
  eval_type           text not null default 'buyout',
  market_price        numeric not null,
  buy_price           numeric not null default 0,
  sell_price          numeric not null default 0,
  profit              numeric not null default 0,
  profitability       numeric not null default 0,
  status              text not null default 'good',
  deal_status         text not null default 'estimated',
  explanation         text[] default '{}',
  blocked_reason      text,
  field_values        jsonb default '{}',
  completeness_values text[] default '{}',
  comment             text,
  created_at          timestamptz default now()
);

-- ── Blocked brands/models ─────────────────────────────────
create table public.blocked_brands (
  id         uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id) on delete cascade,
  brand      text not null,
  unique(company_id, brand)
);

create table public.blocked_models (
  id         uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id) on delete cascade,
  model      text not null,
  unique(company_id, model)
);

-- ── Team permissions ──────────────────────────────────────
create table public.user_permissions (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.users(id) on delete cascade unique,
  company_id            uuid not null references public.companies(id) on delete cascade,
  see_dashboard         boolean default true,
  see_history_own       boolean default true,
  see_history_all       boolean default false,
  see_statistics        boolean default false,
  see_team              boolean default false,
  can_edit_rules        boolean default false,
  can_manage_categories boolean default false
);

-- ═══════════════ ROW LEVEL SECURITY ═══════════════════════

alter table public.companies enable row level security;
alter table public.users enable row level security;
alter table public.company_rules enable row level security;
alter table public.estimations enable row level security;
alter table public.blocked_brands enable row level security;
alter table public.blocked_models enable row level security;
alter table public.user_permissions enable row level security;

-- Helper function
create or replace function public.my_company_id()
returns uuid language sql stable security definer as $$
  select company_id from public.users where id = auth.uid();
$$;

create or replace function public.my_role()
returns text language sql stable security definer as $$
  select role from public.users where id = auth.uid();
$$;

-- Companies: members can read their own
create policy "company_read" on public.companies
  for select using (id = public.my_company_id());

create policy "company_insert" on public.companies
  for insert with check (true);

create policy "company_update" on public.companies
  for update using (id = public.my_company_id() and public.my_role() in ('owner','admin'));

-- Users: same company
create policy "users_read" on public.users
  for select using (company_id = public.my_company_id() or id = auth.uid());

create policy "users_insert" on public.users
  for insert with check (id = auth.uid());

create policy "users_update" on public.users
  for update using (id = auth.uid() or (company_id = public.my_company_id() and public.my_role() in ('owner','admin')));

-- Company rules: all members read, only owner/admin write
create policy "rules_read" on public.company_rules
  for select using (company_id = public.my_company_id());

create policy "rules_write" on public.company_rules
  for all using (company_id = public.my_company_id() and public.my_role() in ('owner','admin'));

-- Estimations: all members can insert, read own or all
create policy "est_insert" on public.estimations
  for insert with check (company_id = public.my_company_id());

create policy "est_select" on public.estimations
  for select using (
    company_id = public.my_company_id() and
    (user_id = auth.uid() or public.my_role() in ('owner','admin'))
  );

create policy "est_update" on public.estimations
  for update using (company_id = public.my_company_id() and user_id = auth.uid());

-- Blocked: owner/admin write, all read
create policy "blocked_brand_read" on public.blocked_brands
  for select using (company_id = public.my_company_id());
create policy "blocked_brand_write" on public.blocked_brands
  for all using (company_id = public.my_company_id() and public.my_role() in ('owner','admin'));

create policy "blocked_model_read" on public.blocked_models
  for select using (company_id = public.my_company_id());
create policy "blocked_model_write" on public.blocked_models
  for all using (company_id = public.my_company_id() and public.my_role() in ('owner','admin'));

-- Permissions
create policy "perms_read" on public.user_permissions
  for select using (company_id = public.my_company_id());
create policy "perms_write" on public.user_permissions
  for all using (company_id = public.my_company_id() and public.my_role() in ('owner','admin'));

-- ═══════════════ UTILITY VIEWS ════════════════════════════

-- Monthly stats per company
create or replace view public.company_stats as
select
  company_id,
  count(*) as total_estimations,
  count(*) filter (where status != 'not_evaluated') as valid_estimations,
  count(*) filter (where status = 'not_evaluated') as rejected_estimations,
  sum(profit) filter (where status != 'not_evaluated') as total_potential_profit,
  avg(profitability) filter (where status != 'not_evaluated') as avg_profitability,
  date_trunc('month', created_at) as month
from public.estimations
group by company_id, date_trunc('month', created_at);

-- ═══════════════ PLAN LIMITS ══════════════════════════════
-- Enforce estimation limits per plan
create or replace function public.check_plan_limit()
returns trigger language plpgsql security definer as $$
declare
  company_plan text;
  monthly_count int;
  plan_limit int;
begin
  select plan into company_plan from public.companies where id = new.company_id;
  select count(*) into monthly_count
  from public.estimations
  where company_id = new.company_id
    and created_at >= date_trunc('month', now());
  
  plan_limit := case company_plan
    when 'starter'  then 5
    when 'pro'      then 300
    when 'business' then 999999
    else 5
  end;

  if monthly_count >= plan_limit then
    raise exception 'Plan limit reached. Upgrade to continue.';
  end if;

  return new;
end;
$$;

create trigger enforce_plan_limit
  before insert on public.estimations
  for each row execute procedure public.check_plan_limit();

-- ── Invitations ───────────────────────────────────────────────────────────────
create table public.invitations (
  id            uuid primary key default uuid_generate_v4(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  invited_by    uuid not null references public.users(id) on delete cascade,
  email         text not null,
  role          text not null default 'manager',
  token         text not null unique default encode(gen_random_bytes(32), 'hex'),
  accepted      boolean not null default false,
  created_at    timestamptz default now(),
  expires_at    timestamptz default now() + interval '7 days'
);

alter table public.invitations enable row level security;

create policy "inv_read" on public.invitations
  for select using (company_id = public.my_company_id() or email = (select email from public.users where id = auth.uid()));

create policy "inv_insert" on public.invitations
  for insert with check (company_id = public.my_company_id() and public.my_role() in ('owner','admin'));

create policy "inv_update" on public.invitations
  for update using (company_id = public.my_company_id() or email = (select email from public.users where id = auth.uid()));
