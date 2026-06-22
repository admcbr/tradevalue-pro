-- Add trial_ends_at to companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- Set trial for existing starter companies that have no trial date yet
-- (existing users get 3 days from now as grace period)
UPDATE public.companies
SET trial_ends_at = now() + interval '3 days'
WHERE plan = 'starter' AND trial_ends_at IS NULL;

-- Check
SELECT id, name, plan, trial_ends_at FROM public.companies LIMIT 5;
