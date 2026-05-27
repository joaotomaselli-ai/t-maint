
-- Add DEFAULT public.current_company_id() so company_id is optional in generated types
ALTER TABLE public.clients ALTER COLUMN company_id SET DEFAULT public.current_company_id();
ALTER TABLE public.technicians ALTER COLUMN company_id SET DEFAULT public.current_company_id();
ALTER TABLE public.service_reports ALTER COLUMN company_id SET DEFAULT public.current_company_id();
ALTER TABLE public.service_sessions ALTER COLUMN company_id SET DEFAULT public.current_company_id();
ALTER TABLE public.activity_attachments ALTER COLUMN company_id SET DEFAULT public.current_company_id();
ALTER TABLE public.activity_technicians ALTER COLUMN company_id SET DEFAULT public.current_company_id();
ALTER TABLE public.client_payments ALTER COLUMN company_id SET DEFAULT public.current_company_id();
ALTER TABLE public.technician_payments ALTER COLUMN company_id SET DEFAULT public.current_company_id();

-- Lock down SECURITY DEFINER helper functions: only the database may execute,
-- (RLS policies run with elevated privilege regardless of caller).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_master(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_company_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fill_company_id() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_master(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.current_company_id() TO service_role;
GRANT EXECUTE ON FUNCTION public.fill_company_id() TO service_role;
