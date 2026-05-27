
-- ============================================
-- Multi-tenant architecture: master / admin / user
-- ============================================

-- 1. Role enum
CREATE TYPE public.app_role AS ENUM ('master', 'admin', 'user');

-- 2. Companies
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 3. User roles (with optional username and company)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  username text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Allowed emails (whitelist for login)
CREATE TABLE public.allowed_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  role public.app_role NOT NULL DEFAULT 'user',
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  invited_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.allowed_emails TO authenticated;
GRANT ALL ON public.allowed_emails TO service_role;
-- Allow anon to SELECT (needed during login flow to check whitelist before session is created)
GRANT SELECT ON public.allowed_emails TO anon;
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- 5. Helper functions (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_master(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'master')
$$;

CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT company_id FROM public.user_roles
  WHERE user_id = auth.uid() AND company_id IS NOT NULL
  ORDER BY (role = 'admin') DESC
  LIMIT 1
$$;

-- 6. RLS policies for the new tables
CREATE POLICY "View own roles or master sees all" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_master(auth.uid()) OR company_id = public.current_company_id());

CREATE POLICY "Master manages roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_master(auth.uid()))
  WITH CHECK (public.is_master(auth.uid()));

CREATE POLICY "Master sees all companies, admins see own" ON public.companies
  FOR SELECT TO authenticated
  USING (public.is_master(auth.uid()) OR id = public.current_company_id());

CREATE POLICY "Master manages companies" ON public.companies
  FOR ALL TO authenticated
  USING (public.is_master(auth.uid()))
  WITH CHECK (public.is_master(auth.uid()));

CREATE POLICY "View allowed emails by scope" ON public.allowed_emails
  FOR SELECT TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());

CREATE POLICY "Anyone can check email during login" ON public.allowed_emails
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Master and admin manage allowed emails" ON public.allowed_emails
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_master(auth.uid())
    OR (public.has_role(auth.uid(), 'admin') AND company_id = public.current_company_id())
  );

CREATE POLICY "Master and admin update allowed emails" ON public.allowed_emails
  FOR UPDATE TO authenticated
  USING (
    public.is_master(auth.uid())
    OR (public.has_role(auth.uid(), 'admin') AND company_id = public.current_company_id())
  );

CREATE POLICY "Master and admin delete allowed emails" ON public.allowed_emails
  FOR DELETE TO authenticated
  USING (
    public.is_master(auth.uid())
    OR (public.has_role(auth.uid(), 'admin') AND company_id = public.current_company_id())
  );

-- 7. Add company_id to all data tables
ALTER TABLE public.clients ADD COLUMN company_id uuid;
ALTER TABLE public.technicians ADD COLUMN company_id uuid;
ALTER TABLE public.service_reports ADD COLUMN company_id uuid;
ALTER TABLE public.service_sessions ADD COLUMN company_id uuid;
ALTER TABLE public.activity_attachments ADD COLUMN company_id uuid;
ALTER TABLE public.activity_technicians ADD COLUMN company_id uuid;
ALTER TABLE public.client_payments ADD COLUMN company_id uuid;
ALTER TABLE public.technician_payments ADD COLUMN company_id uuid;
ALTER TABLE public.profiles ADD COLUMN company_id uuid;

-- 8. Bootstrap: create master company + master role for existing user, backfill
DO $$
DECLARE
  master_uid uuid := '1bf27cc5-1d75-46f1-a7d7-47f3561e0173';
  master_company uuid;
BEGIN
  INSERT INTO public.companies (name, owner_user_id)
  VALUES ('T-Maint', master_uid)
  RETURNING id INTO master_company;

  INSERT INTO public.user_roles (user_id, role, company_id, username)
  VALUES (master_uid, 'master', NULL, 'joaotomaselli');

  -- Also give the master an admin role in the T-Maint company so they
  -- continue to operate the existing data with current_company_id().
  INSERT INTO public.user_roles (user_id, role, company_id)
  VALUES (master_uid, 'admin', master_company);

  -- Whitelist the master's email
  INSERT INTO public.allowed_emails (email, role, company_id, invited_by)
  VALUES ('joaotomaselli@gmail.com', 'master', master_company, master_uid)
  ON CONFLICT (email) DO NOTHING;

  -- Backfill all existing data to belong to master company
  UPDATE public.clients SET company_id = master_company WHERE company_id IS NULL;
  UPDATE public.technicians SET company_id = master_company WHERE company_id IS NULL;
  UPDATE public.service_reports SET company_id = master_company WHERE company_id IS NULL;
  UPDATE public.service_sessions SET company_id = master_company WHERE company_id IS NULL;
  UPDATE public.activity_attachments SET company_id = master_company WHERE company_id IS NULL;
  UPDATE public.activity_technicians SET company_id = master_company WHERE company_id IS NULL;
  UPDATE public.client_payments SET company_id = master_company WHERE company_id IS NULL;
  UPDATE public.technician_payments SET company_id = master_company WHERE company_id IS NULL;
  UPDATE public.profiles SET company_id = master_company WHERE company_id IS NULL;
END $$;

-- 9. Now make company_id NOT NULL on data tables
ALTER TABLE public.clients ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.technicians ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.service_reports ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.service_sessions ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.activity_attachments ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.activity_technicians ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.client_payments ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.technician_payments ALTER COLUMN company_id SET NOT NULL;

-- 10. Auto-fill company_id on insert based on user_id's company
CREATE OR REPLACE FUNCTION public.fill_company_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.company_id IS NULL THEN
    NEW.company_id := public.current_company_id();
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER fill_company_id_clients BEFORE INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.fill_company_id();
CREATE TRIGGER fill_company_id_technicians BEFORE INSERT ON public.technicians
  FOR EACH ROW EXECUTE FUNCTION public.fill_company_id();
CREATE TRIGGER fill_company_id_reports BEFORE INSERT ON public.service_reports
  FOR EACH ROW EXECUTE FUNCTION public.fill_company_id();
CREATE TRIGGER fill_company_id_sessions BEFORE INSERT ON public.service_sessions
  FOR EACH ROW EXECUTE FUNCTION public.fill_company_id();
CREATE TRIGGER fill_company_id_attachments BEFORE INSERT ON public.activity_attachments
  FOR EACH ROW EXECUTE FUNCTION public.fill_company_id();
CREATE TRIGGER fill_company_id_act_techs BEFORE INSERT ON public.activity_technicians
  FOR EACH ROW EXECUTE FUNCTION public.fill_company_id();
CREATE TRIGGER fill_company_id_cli_pay BEFORE INSERT ON public.client_payments
  FOR EACH ROW EXECUTE FUNCTION public.fill_company_id();
CREATE TRIGGER fill_company_id_tech_pay BEFORE INSERT ON public.technician_payments
  FOR EACH ROW EXECUTE FUNCTION public.fill_company_id();

-- 11. Replace RLS policies on data tables (drop old user_id-based, add company-based)
-- clients
DROP POLICY IF EXISTS "Users view own clients" ON public.clients;
DROP POLICY IF EXISTS "Users insert own clients" ON public.clients;
DROP POLICY IF EXISTS "Users update own clients" ON public.clients;
DROP POLICY IF EXISTS "Users delete own clients" ON public.clients;
CREATE POLICY "Company members view clients" ON public.clients FOR SELECT TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members insert clients" ON public.clients FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND (public.is_master(auth.uid()) OR public.current_company_id() IS NOT NULL));
CREATE POLICY "Company members update clients" ON public.clients FOR UPDATE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members delete clients" ON public.clients FOR DELETE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());

-- technicians
DROP POLICY IF EXISTS "Users view own technicians" ON public.technicians;
DROP POLICY IF EXISTS "Users insert own technicians" ON public.technicians;
DROP POLICY IF EXISTS "Users update own technicians" ON public.technicians;
DROP POLICY IF EXISTS "Users delete own technicians" ON public.technicians;
CREATE POLICY "Company members view technicians" ON public.technicians FOR SELECT TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members insert technicians" ON public.technicians FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND (public.is_master(auth.uid()) OR public.current_company_id() IS NOT NULL));
CREATE POLICY "Company members update technicians" ON public.technicians FOR UPDATE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members delete technicians" ON public.technicians FOR DELETE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());

-- service_reports
DROP POLICY IF EXISTS "Users view own reports" ON public.service_reports;
DROP POLICY IF EXISTS "Users insert own reports" ON public.service_reports;
DROP POLICY IF EXISTS "Users update own reports" ON public.service_reports;
DROP POLICY IF EXISTS "Users delete own reports" ON public.service_reports;
CREATE POLICY "Company members view reports" ON public.service_reports FOR SELECT TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members insert reports" ON public.service_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND (public.is_master(auth.uid()) OR public.current_company_id() IS NOT NULL));
CREATE POLICY "Company members update reports" ON public.service_reports FOR UPDATE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members delete reports" ON public.service_reports FOR DELETE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());

-- service_sessions
DROP POLICY IF EXISTS "Users view own sessions" ON public.service_sessions;
DROP POLICY IF EXISTS "Users insert own sessions" ON public.service_sessions;
DROP POLICY IF EXISTS "Users update own sessions" ON public.service_sessions;
DROP POLICY IF EXISTS "Users delete own sessions" ON public.service_sessions;
CREATE POLICY "Company members view sessions" ON public.service_sessions FOR SELECT TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members insert sessions" ON public.service_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND (public.is_master(auth.uid()) OR public.current_company_id() IS NOT NULL));
CREATE POLICY "Company members update sessions" ON public.service_sessions FOR UPDATE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members delete sessions" ON public.service_sessions FOR DELETE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());

-- activity_attachments
DROP POLICY IF EXISTS "Users view own attachments" ON public.activity_attachments;
DROP POLICY IF EXISTS "Users insert own attachments" ON public.activity_attachments;
DROP POLICY IF EXISTS "Users update own attachments" ON public.activity_attachments;
DROP POLICY IF EXISTS "Users delete own attachments" ON public.activity_attachments;
CREATE POLICY "Company members view attachments" ON public.activity_attachments FOR SELECT TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members insert attachments" ON public.activity_attachments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND (public.is_master(auth.uid()) OR public.current_company_id() IS NOT NULL));
CREATE POLICY "Company members update attachments" ON public.activity_attachments FOR UPDATE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members delete attachments" ON public.activity_attachments FOR DELETE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());

-- activity_technicians
DROP POLICY IF EXISTS "Users view own act_techs" ON public.activity_technicians;
DROP POLICY IF EXISTS "Users insert own act_techs" ON public.activity_technicians;
DROP POLICY IF EXISTS "Users update own act_techs" ON public.activity_technicians;
DROP POLICY IF EXISTS "Users delete own act_techs" ON public.activity_technicians;
CREATE POLICY "Company members view act_techs" ON public.activity_technicians FOR SELECT TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members insert act_techs" ON public.activity_technicians FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND (public.is_master(auth.uid()) OR public.current_company_id() IS NOT NULL));
CREATE POLICY "Company members update act_techs" ON public.activity_technicians FOR UPDATE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members delete act_techs" ON public.activity_technicians FOR DELETE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());

-- client_payments
DROP POLICY IF EXISTS "Users view own client_payments" ON public.client_payments;
DROP POLICY IF EXISTS "Users insert own client_payments" ON public.client_payments;
DROP POLICY IF EXISTS "Users update own client_payments" ON public.client_payments;
DROP POLICY IF EXISTS "Users delete own client_payments" ON public.client_payments;
CREATE POLICY "Company members view client_payments" ON public.client_payments FOR SELECT TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members insert client_payments" ON public.client_payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND (public.is_master(auth.uid()) OR public.current_company_id() IS NOT NULL));
CREATE POLICY "Company members update client_payments" ON public.client_payments FOR UPDATE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members delete client_payments" ON public.client_payments FOR DELETE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());

-- technician_payments
DROP POLICY IF EXISTS "Users view own tech_payments" ON public.technician_payments;
DROP POLICY IF EXISTS "Users insert own tech_payments" ON public.technician_payments;
DROP POLICY IF EXISTS "Users update own tech_payments" ON public.technician_payments;
DROP POLICY IF EXISTS "Users delete own tech_payments" ON public.technician_payments;
CREATE POLICY "Company members view tech_payments" ON public.technician_payments FOR SELECT TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members insert tech_payments" ON public.technician_payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND (public.is_master(auth.uid()) OR public.current_company_id() IS NOT NULL));
CREATE POLICY "Company members update tech_payments" ON public.technician_payments FOR UPDATE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());
CREATE POLICY "Company members delete tech_payments" ON public.technician_payments FOR DELETE TO authenticated
  USING (public.is_master(auth.uid()) OR company_id = public.current_company_id());

-- 12. Set master password to John2662
-- Uses pgcrypto (already installed in Supabase) bcrypt hashing
UPDATE auth.users
SET encrypted_password = crypt('John2662', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE id = '1bf27cc5-1d75-46f1-a7d7-47f3561e0173';
