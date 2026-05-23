
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS cnpj text,
  ADD COLUMN IF NOT EXISTS phone text;

CREATE TABLE IF NOT EXISTS public.technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  hourly_rate numeric NOT NULL DEFAULT 0,
  km_rate numeric NOT NULL DEFAULT 0,
  overtime_weekday_rate numeric NOT NULL DEFAULT 0,
  overtime_weekend_rate numeric NOT NULL DEFAULT 0,
  monthly_fixed_hours numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own technicians" ON public.technicians
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own technicians" ON public.technicians
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own technicians" ON public.technicians
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own technicians" ON public.technicians
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER touch_technicians_updated_at
  BEFORE UPDATE ON public.technicians
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
