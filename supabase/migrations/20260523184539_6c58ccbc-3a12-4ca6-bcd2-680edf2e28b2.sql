
ALTER TABLE public.service_reports
  ADD COLUMN IF NOT EXISTS overtime_weekday_hours numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overtime_weekend_hours numeric NOT NULL DEFAULT 0;
