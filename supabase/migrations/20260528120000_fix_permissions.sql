-- Grant EXECUTE permissions back to PUBLIC (all database roles) for the helper security definer functions.
-- This is required because PostgreSQL evaluates RLS policies, triggers, and column defaults 
-- under various system roles (like authenticator, authenticated, anon, etc.).
-- Revoking execute permissions caused RLS insert and select queries to fail for users.

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_master(uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_company_id() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.fill_company_id() TO PUBLIC;
