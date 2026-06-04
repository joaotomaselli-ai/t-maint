
-- 1) Remove broad anon SELECT on allowed_emails (server now uses service role for the check)
DROP POLICY IF EXISTS "Anyone can check email during login" ON public.allowed_emails;

-- 2) Helper: role scoped to a specific company
CREATE OR REPLACE FUNCTION public.has_role_in_company(_user_id uuid, _role public.app_role, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND company_id IS NOT DISTINCT FROM _company_id
  )
$$;

-- 3) Tighten allowed_emails policies: admin must be admin OF that company
DROP POLICY IF EXISTS "Master and admin delete allowed emails" ON public.allowed_emails;
DROP POLICY IF EXISTS "Master and admin manage allowed emails" ON public.allowed_emails;
DROP POLICY IF EXISTS "Master and admin update allowed emails" ON public.allowed_emails;

CREATE POLICY "Master and admin delete allowed emails"
ON public.allowed_emails FOR DELETE TO authenticated
USING (
  public.is_master(auth.uid())
  OR public.has_role_in_company(auth.uid(), 'admin', company_id)
);

CREATE POLICY "Master and admin insert allowed emails"
ON public.allowed_emails FOR INSERT TO authenticated
WITH CHECK (
  public.is_master(auth.uid())
  OR public.has_role_in_company(auth.uid(), 'admin', company_id)
);

CREATE POLICY "Master and admin update allowed emails"
ON public.allowed_emails FOR UPDATE TO authenticated
USING (
  public.is_master(auth.uid())
  OR public.has_role_in_company(auth.uid(), 'admin', company_id)
);

-- 4) Tighten user_roles policies for admins (must admin THAT company)
DROP POLICY IF EXISTS "Admin deletes roles in own company" ON public.user_roles;
DROP POLICY IF EXISTS "Admin inserts roles in own company" ON public.user_roles;
DROP POLICY IF EXISTS "Admin manages roles in own company" ON public.user_roles;

CREATE POLICY "Admin deletes roles in own company"
ON public.user_roles FOR DELETE TO authenticated
USING (
  public.has_role_in_company(auth.uid(), 'admin', company_id)
  AND role <> 'master'
);

CREATE POLICY "Admin inserts roles in own company"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (
  public.has_role_in_company(auth.uid(), 'admin', company_id)
  AND role <> 'master'
);

CREATE POLICY "Admin updates roles in own company"
ON public.user_roles FOR UPDATE TO authenticated
USING (
  public.has_role_in_company(auth.uid(), 'admin', company_id)
  AND role <> 'master'
)
WITH CHECK (
  public.has_role_in_company(auth.uid(), 'admin', company_id)
  AND role <> 'master'
);
