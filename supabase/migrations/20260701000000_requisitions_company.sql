-- 1. Adicionar company_id na tabela de requisições
ALTER TABLE public.requisitions 
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- 2. Backfill do company_id baseado nas ordens de serviço (service_reports)
UPDATE public.requisitions r
SET company_id = (SELECT company_id FROM public.service_reports sr WHERE sr.id = r.activity_id);

-- 3. Caso tenha alguma requisição fantasma sem OS válida, deletar ou definir um fallback (como a ON DELETE CASCADE cuida disso, não deve haver órfãos)
-- Fazer o company_id ser NOT NULL
ALTER TABLE public.requisitions ALTER COLUMN company_id SET NOT NULL;

-- 4. Permitir que activity_id seja nulo (Requisições Avulsas)
ALTER TABLE public.requisitions ALTER COLUMN activity_id DROP NOT NULL;

-- 5. Atualizar o Trigger que cria requisição via OS para salvar o company_id também
CREATE OR REPLACE FUNCTION public.sync_requisition_from_os()
RETURNS TRIGGER AS $$
BEGIN
    -- Se tem texto de requisições futuras
    IF NEW.future_replacements IS NOT NULL AND trim(NEW.future_replacements) != '' THEN
        INSERT INTO public.requisitions (activity_id, company_id, description, status)
        VALUES (NEW.id, NEW.company_id, NEW.future_replacements, 'Aberta')
        ON CONFLICT (activity_id) DO UPDATE 
        SET description = EXCLUDED.description;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Corrigir as políticas de RLS para isolamento por empresa
DROP POLICY IF EXISTS "Permitir tudo em requisitions para autenticados" ON public.requisitions;

CREATE POLICY "Company members view requisitions" ON public.requisitions FOR SELECT TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    company_id = (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Company members insert requisitions" ON public.requisitions FOR INSERT TO authenticated
  WITH CHECK (
    public.is_master(auth.uid()) OR 
    company_id = (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Company members update requisitions" ON public.requisitions FOR UPDATE TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    company_id = (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Company members delete requisitions" ON public.requisitions FOR DELETE TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    company_id = (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
  );

-- Opcional, atualizar o RLS de requisition_quotes para seguir a mesma lógica (via JOIN)
DROP POLICY IF EXISTS "Permitir tudo em requisition_quotes para autenticados" ON public.requisition_quotes;

CREATE POLICY "Company members manage quotes" ON public.requisition_quotes FOR ALL TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.requisitions r 
      WHERE r.id = requisition_quotes.requisition_id 
      AND r.company_id = (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
    )
  );
