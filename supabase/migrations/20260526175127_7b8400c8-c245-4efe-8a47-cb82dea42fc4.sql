
CREATE TABLE public.client_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  paid_at timestamptz NOT NULL DEFAULT now(),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, activity_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_payments TO authenticated;
GRANT ALL ON public.client_payments TO service_role;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own client_payments" ON public.client_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own client_payments" ON public.client_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own client_payments" ON public.client_payments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own client_payments" ON public.client_payments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.technician_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_id uuid NOT NULL,
  technician_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  paid_at timestamptz NOT NULL DEFAULT now(),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, activity_id, technician_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.technician_payments TO authenticated;
GRANT ALL ON public.technician_payments TO service_role;
ALTER TABLE public.technician_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own tech_payments" ON public.technician_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own tech_payments" ON public.technician_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own tech_payments" ON public.technician_payments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own tech_payments" ON public.technician_payments FOR DELETE TO authenticated USING (auth.uid() = user_id);
