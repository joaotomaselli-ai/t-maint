CREATE OR REPLACE FUNCTION public.is_technician_on_activity(p_activity_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tech_id uuid;
  v_tech_name text;
BEGIN
  -- Get the technician ID and name for the current user
  SELECT id, name INTO v_tech_id, v_tech_name FROM public.technicians WHERE user_id = auth.uid() LIMIT 1;
  
  IF v_tech_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check if they are the primary technician listed by name
  IF EXISTS (SELECT 1 FROM public.service_reports WHERE id = p_activity_id AND technician = v_tech_name) THEN
    RETURN true;
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
