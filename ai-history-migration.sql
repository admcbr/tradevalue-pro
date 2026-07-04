-- Add ai_analysis column to estimations table
ALTER TABLE public.estimations
  ADD COLUMN IF NOT EXISTS ai_analysis jsonb;

-- Verify
SELECT column_name FROM information_schema.columns
WHERE table_name = 'estimations' AND column_name = 'ai_analysis';
