-- Виправлення: адмін бачить ВСІХ юзерів і компанії
-- Запустіть в Supabase SQL Editor

-- Видаляємо всі старі політики на users
drop policy if exists "users_own" on public.users;
drop policy if exists "users_company_read" on public.users;
drop policy if exists "admin_users" on public.users;
drop policy if exists "admin_companies" on public.companies;
drop policy if exists "admin_estimations" on public.estimations;

-- Функція перевірки чи є поточний юзер адміном
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select email = 'wertuvenom@gmail.com' 
  from auth.users where id = auth.uid();
$$;

-- USERS: юзер бачить себе + свою компанію + адмін бачить всіх
drop policy if exists "users_read" on public.users;
drop policy if exists "users_insert" on public.users;
drop policy if exists "users_update" on public.users;

create policy "users_select" on public.users
  for select to authenticated using (
    id = auth.uid() 
    or company_id = public.my_company_id()
    or public.is_admin()
  );

create policy "users_insert" on public.users
  for insert to authenticated with check (id = auth.uid());

create policy "users_update" on public.users
  for update to authenticated using (
    id = auth.uid() 
    or (company_id = public.my_company_id() and public.my_role() in ('owner','admin'))
    or public.is_admin()
  );

-- COMPANIES: адмін бачить всі
drop policy if exists "company_read" on public.companies;

create policy "company_select" on public.companies
  for select to authenticated using (
    id = public.my_company_id()
    or public.my_company_id() is null
    or public.is_admin()
  );

-- ESTIMATIONS: адмін бачить всі
drop policy if exists "est_select" on public.estimations;

create policy "est_select" on public.estimations
  for select to authenticated using (
    company_id = public.my_company_id()
    or public.is_admin()
  );

-- Перевірка: показати всіх юзерів (має повернути список)
select id, email, name, role, company_id, created_at 
from public.users 
order by created_at desc;

-- Also fix: allow users to update their own company_id during onboarding
-- The trigger creates user WITHOUT company_id, then onboarding tries to upsert WITH company_id
drop policy if exists "users_update" on public.users;

create policy "users_update" on public.users
  for update to authenticated using (
    id = auth.uid()
    or (company_id = public.my_company_id() and public.my_role() in ('owner','admin'))
    or public.is_admin()
  ) with check (
    id = auth.uid()
    or public.is_admin()
  );
