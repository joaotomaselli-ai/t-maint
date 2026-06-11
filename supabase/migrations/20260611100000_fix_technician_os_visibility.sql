-- Drop previous policies
DROP POLICY IF EXISTS "Company members view reports" ON public.service_reports;
DROP POLICY IF EXISTS "Company members update reports" ON public.service_reports;

-- Recreate SELECT policy for reports
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
        ) OR
        EXISTS (
          SELECT 1 FROM public.service_sessions ss
          WHERE ss.activity_id = id AND ss.technician_id IN (
            SELECT t.id FROM public.technicians t WHERE t.user_id = auth.uid()
          )
        )
      )
    )
  );

-- Recreate UPDATE policy for reports
CREATE POLICY "Company members update reports" ON public.service_reports FOR UPDATE TO authenticated
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
        ) OR
        EXISTS (
          SELECT 1 FROM public.service_sessions ss
          WHERE ss.activity_id = id AND ss.technician_id IN (
            SELECT t.id FROM public.technicians t WHERE t.user_id = auth.uid()
          )
        )
      )
    )
  );

-- Drop previous sessions policy
DROP POLICY IF EXISTS "Users view own sessions" ON public.service_sessions;
DROP POLICY IF EXISTS "Company members view sessions" ON public.service_sessions;
DROP POLICY IF EXISTS "Company members update sessions" ON public.service_sessions;

-- Recreate SELECT policy for sessions
CREATE POLICY "Company members view sessions" ON public.service_sessions FOR SELECT TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    (
      company_id = public.current_company_id() AND
      (
        NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'technician') OR
        user_id = auth.uid() OR
        technician_id IN (SELECT t.id FROM public.technicians t WHERE t.user_id = auth.uid()) OR
        EXISTS (
          SELECT 1 FROM public.activity_technicians at
          WHERE at.activity_id = service_sessions.activity_id AND at.technician_id IN (
            SELECT t.id FROM public.technicians t WHERE t.user_id = auth.uid()
          )
        ) OR
        EXISTS (
          SELECT 1 FROM public.service_sessions ss
          WHERE ss.activity_id = service_sessions.activity_id AND ss.technician_id IN (
            SELECT t.id FROM public.technicians t WHERE t.user_id = auth.uid()
          )
        )
      )
    )
  );

-- Recreate UPDATE policy for sessions
CREATE POLICY "Company members update sessions" ON public.service_sessions FOR UPDATE TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    (
      company_id = public.current_company_id() AND
      (
        NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'technician') OR
        user_id = auth.uid() OR
        technician_id IN (SELECT t.id FROM public.technicians t WHERE t.user_id = auth.uid()) OR
        EXISTS (
          SELECT 1 FROM public.activity_technicians at
          WHERE at.activity_id = service_sessions.activity_id AND at.technician_id IN (
            SELECT t.id FROM public.technicians t WHERE t.user_id = auth.uid()
          )
        ) OR
        EXISTS (
          SELECT 1 FROM public.service_sessions ss
          WHERE ss.activity_id = service_sessions.activity_id AND ss.technician_id IN (
            SELECT t.id FROM public.technicians t WHERE t.user_id = auth.uid()
          )
        )
      )
    )
  );
-- Drop previous attachments policy
DROP POLICY IF EXISTS "Company members view attachments" ON public.activity_attachments;
DROP POLICY IF EXISTS "Company members update attachments" ON public.activity_attachments;

-- Recreate SELECT policy for attachments
CREATE POLICY "Company members view attachments" ON public.activity_attachments FOR SELECT TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    (
      company_id = public.current_company_id() AND
      (
        NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'technician') OR
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.activity_technicians at
          WHERE at.activity_id = activity_attachments.activity_id AND at.technician_id IN (
            SELECT t.id FROM public.technicians t WHERE t.user_id = auth.uid()
          )
        ) OR
        EXISTS (
          SELECT 1 FROM public.service_sessions ss
          WHERE ss.activity_id = activity_attachments.activity_id AND ss.technician_id IN (
            SELECT t.id FROM public.technicians t WHERE t.user_id = auth.uid()
          )
        )
      )
    )
  );

-- Recreate UPDATE policy for attachments
CREATE POLICY "Company members update attachments" ON public.activity_attachments FOR UPDATE TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    (
      company_id = public.current_company_id() AND
      (
        NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'technician') OR
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.activity_technicians at
          WHERE at.activity_id = activity_attachments.activity_id AND at.technician_id IN (
            SELECT t.id FROM public.technicians t WHERE t.user_id = auth.uid()
          )
        ) OR
        EXISTS (
          SELECT 1 FROM public.service_sessions ss
          WHERE ss.activity_id = activity_attachments.activity_id AND ss.technician_id IN (
            SELECT t.id FROM public.technicians t WHERE t.user_id = auth.uid()
          )
        )
      )
    )
  );
