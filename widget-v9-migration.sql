ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS widget_bg_color   text    DEFAULT '#07070C',
  ADD COLUMN IF NOT EXISTS widget_hide_price boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS widget_disabled   boolean DEFAULT false;

SELECT column_name FROM information_schema.columns
WHERE table_name = 'companies'
  AND column_name IN ('widget_bg_color','widget_hide_price','widget_disabled');
