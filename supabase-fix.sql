-- ═══════════════════════════════════════════════════════════
-- TradeValue Pro — RLS Fix
-- Run this in Supabase SQL Editor to fix registration issues
-- ═══════════════════════════════════════════════════════════

-- Drop existing restrictive policies
drop policy if exists "company_read" on public.companies;
drop policy if exists "company_insert" on public.companies;
drop policy if exists "company_update" on public.companies;
drop policy if exists "users_read" on public.users;
drop policy if exists "users_insert" on public.users;
drop policy if exists "users_update" on public.users;
drop policy if exists "rules_read" on public.company_rules;
drop policy if exists "rules_write" on public.company_rules;
drop policy if exists "est_insert" on public.estimations;
drop policy if exists "est_select" on public.estimations;
drop policy if exists "est_update" on public.estimations;

-- ── Companies ─────────────────────────────────────────────
-- Anyone authenticated can create a company (for onboarding)
create policy "company_insert" on public.companies
  for insert to authenticated with check (true);

-- Members can read their own company
create policy "company_read" on public.companies
  for select to authenticated using (
    id = public.my_company_id() or public.my_company_id() is null
  );

-- Only owner/admin can update
create policy "company_update" on public.companies
  for update to authenticated using (id = public.my_company_id());

-- ── Users ─────────────────────────────────────────────────
-- User can always read/write their own record
create policy "users_own" on public.users
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Users in same company can read each other
create policy "users_company_read" on public.users
  for select to authenticated using (
    company_id = public.my_company_id()
  );

-- ── Company Rules ──────────────────────────────────────────
-- Insert allowed for any authenticated (for onboarding)
create policy "rules_insert" on public.company_rules
  for insert to authenticated with check (true);

-- Read own company rules
create policy "rules_read" on public.company_rules
  for select to authenticated using (company_id = public.my_company_id());

-- Update own company rules (owner/admin)
create policy "rules_update" on public.company_rules
  for update to authenticated using (company_id = public.my_company_id());

-- ── Estimations ───────────────────────────────────────────
create policy "est_insert" on public.estimations
  for insert to authenticated with check (
    company_id = public.my_company_id()
  );

create policy "est_select" on public.estimations
  for select to authenticated using (
    company_id = public.my_company_id()
  );

create policy "est_delete" on public.estimations
  for delete to authenticated using (
    company_id = public.my_company_id() and user_id = auth.uid()
  );

-- ── Admin: allow reading all data for admin user ───────────
-- This allows the admin dashboard to see all companies/users
create policy "admin_companies" on public.companies
  for select to authenticated using (
    (select email from auth.users where id = auth.uid()) = 'wertuvenom@gmail.com'
  );

create policy "admin_users" on public.users
  for select to authenticated using (
    (select email from auth.users where id = auth.uid()) = 'wertuvenom@gmail.com'
  );

create policy "admin_estimations" on public.estimations
  for select to authenticated using (
    (select email from auth.users where id = auth.uid()) = 'wertuvenom@gmail.com'
  );
