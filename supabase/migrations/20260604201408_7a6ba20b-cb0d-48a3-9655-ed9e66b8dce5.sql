
DROP POLICY IF EXISTS "Company members update clients" ON public.clients;
CREATE POLICY "Company members update clients" ON public.clients FOR UPDATE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id())
  WITH CHECK (true);

