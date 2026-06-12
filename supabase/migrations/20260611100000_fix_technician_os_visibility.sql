-- Create security definer function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_technician_on_activity(p_activity_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tech_id uuid;
BEGIN
  -- Get the technician ID for the current user
  SELECT id INTO v_tech_id FROM public.technicians WHERE user_id = auth.uid() LIMIT 1;
  
  IF v_tech_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check if they are in activity_technicians
  IF EXISTS (SELECT 1 FROM public.activity_technicians WHERE activity_id = p_activity_id AND technician_id = v_tech_id) THEN
    RETURN true;
  END IF;

  -- Check if they are in service_sessions
  IF EXISTS (SELECT 1 FROM public.service_sessions WHERE activity_id = p_activity_id AND technician_id = v_tech_id) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Drop previous policies to avoid conflicts
DROP POLICY IF EXISTS "Company members view reports" ON public.service_reports;
DROP POLICY IF EXISTS "Company members update reports" ON public.service_reports;
DROP POLICY IF EXISTS "Users view own sessions" ON public.service_sessions;
DROP POLICY IF EXISTS "Company members view sessions" ON public.service_sessions;
DROP POLICY IF EXISTS "Company members update sessions" ON public.service_sessions;
DROP POLICY IF EXISTS "Users view own attachments" ON public.activity_attachments;
DROP POLICY IF EXISTS "Company members view attachments" ON public.activity_attachments;
DROP POLICY IF EXISTS "Company members update attachments" ON public.activity_attachments;
DROP POLICY IF EXISTS "Users view own act_techs" ON public.activity_technicians;
DROP POLICY IF EXISTS "Company members view act_techs" ON public.activity_technicians;
DROP POLICY IF EXISTS "Company members update act_techs" ON public.activity_technicians;

-- RLS for service_reports
CREATE POLICY "Company members view reports" ON public.service_reports FOR SELECT TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    (
      company_id = public.current_company_id() AND
      (
        NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'technician') OR
        user_id = auth.uid() OR
        public.is_technician_on_activity(id)
      )
    )
  );

CREATE POLICY "Company members update reports" ON public.service_reports FOR UPDATE TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    (
      company_id = public.current_company_id() AND
      (
        NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'technician') OR
        user_id = auth.uid() OR
        public.is_technician_on_activity(id)
      )
    )
  );

-- RLS for service_sessions
CREATE POLICY "Company members view sessions" ON public.service_sessions FOR SELECT TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    (
      EXISTS (
        SELECT 1 FROM public.service_reports r 
        WHERE r.id = activity_id AND r.company_id = public.current_company_id()
      ) AND
      (
        NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'technician') OR
        user_id = auth.uid() OR
        public.is_technician_on_activity(activity_id)
      )
    )
  );

CREATE POLICY "Company members update sessions" ON public.service_sessions FOR UPDATE TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    (
      EXISTS (
        SELECT 1 FROM public.service_reports r 
        WHERE r.id = activity_id AND r.company_id = public.current_company_id()
      ) AND
      (
        NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'technician') OR
        user_id = auth.uid() OR
        public.is_technician_on_activity(activity_id)
      )
    )
  );

-- RLS for activity_attachments
CREATE POLICY "Company members view attachments" ON public.activity_attachments FOR SELECT TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    (
      EXISTS (
        SELECT 1 FROM public.service_reports r 
        WHERE r.id = activity_id AND r.company_id = public.current_company_id()
      ) AND
      (
        NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'technician') OR
        user_id = auth.uid() OR
        public.is_technician_on_activity(activity_id)
      )
    )
  );

CREATE POLICY "Company members update attachments" ON public.activity_attachments FOR UPDATE TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    (
      EXISTS (
        SELECT 1 FROM public.service_reports r 
        WHERE r.id = activity_id AND r.company_id = public.current_company_id()
      ) AND
      (
        NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'technician') OR
        user_id = auth.uid() OR
        public.is_technician_on_activity(activity_id)
      )
    )
  );

-- RLS for activity_technicians
CREATE POLICY "Company members view act_techs" ON public.activity_technicians FOR SELECT TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    (
      EXISTS (
        SELECT 1 FROM public.service_reports r 
        WHERE r.id = activity_id AND r.company_id = public.current_company_id()
      ) AND
      (
        NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'technician') OR
        user_id = auth.uid() OR
        public.is_technician_on_activity(activity_id)
      )
    )
  );

CREATE POLICY "Company members update act_techs" ON public.activity_technicians FOR UPDATE TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    (
      EXISTS (
        SELECT 1 FROM public.service_reports r 
        WHERE r.id = activity_id AND r.company_id = public.current_company_id()
      ) AND
      (
        NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'technician') OR
        user_id = auth.uid() OR
        public.is_technician_on_activity(activity_id)
      )
    )
  );
