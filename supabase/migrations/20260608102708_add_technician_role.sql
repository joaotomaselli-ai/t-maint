-- Add 'technician' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'technician';

-- Add columns to technicians
ALTER TABLE public.technicians
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS has_login boolean NOT NULL DEFAULT false;

-- Update RLS for service_reports
DROP POLICY IF EXISTS "Company members view reports" ON public.service_reports;
CREATE POLICY "Company members view reports" ON public.service_reports FOR SELECT TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    (
      company_id = public.current_company_id() AND
      (
        NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'technician') OR
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.activity_technicians at
          WHERE at.activity_id = id AND at.technician_id IN (
            SELECT t.id FROM public.technicians t WHERE t.user_id = auth.uid()
          )
        )
      )
    )
  );

-- Update RLS for service_sessions
DROP POLICY IF EXISTS "Users view own sessions" ON public.service_sessions;
CREATE POLICY "Users view own sessions" ON public.service_sessions FOR SELECT TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    (
      company_id = public.current_company_id() AND
      (
        NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'technician') OR
        user_id = auth.uid()
      )
    )
  );
