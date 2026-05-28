-- Add allowed_features per user_role (null = todas as funções permitidas)
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS allowed_features text[] NULL;

-- Allow admins to update/delete user_roles within their company (not master rows)
CREATE POLICY "Admin manages roles in own company"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND company_id = current_company_id()
  AND role <> 'master'
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND company_id = current_company_id()
  AND role <> 'master'
);

CREATE POLICY "Admin deletes roles in own company"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND company_id = current_company_id()
  AND role <> 'master'
);

CREATE POLICY "Admin inserts roles in own company"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND company_id = current_company_id()
  AND role <> 'master'
);