-- Migration para o Módulo de Orçamentos e Propostas Comerciais
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    quote_number TEXT NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    machine TEXT NOT NULL DEFAULT '',
    technician_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'negotiating', 'approved', 'rejected', 'expired')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '15 days'),
    
    -- Itens e Valores
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    services_total NUMERIC(10,2) NOT NULL DEFAULT 0,
    products_total NUMERIC(10,2) NOT NULL DEFAULT 0,
    travel_km NUMERIC(10,2) NOT NULL DEFAULT 0,
    travel_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
    travel_total NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    
    -- Condições Comerciais
    payment_terms TEXT DEFAULT 'À vista / Pix',
    execution_deadline TEXT DEFAULT 'A combinar',
    warranty_terms TEXT DEFAULT '90 dias para peças e serviços',
    notes TEXT,
    
    -- Vínculo com O.S.
    converted_activity_id UUID REFERENCES public.service_reports(id) ON DELETE SET NULL,
    converted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Company members view quotes'
  ) THEN
    CREATE POLICY "Company members view quotes" ON public.quotes FOR SELECT TO authenticated
      USING (
        public.is_master(auth.uid()) OR 
        company_id = (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Company members manage quotes'
  ) THEN
    CREATE POLICY "Company members manage quotes" ON public.quotes FOR ALL TO authenticated
      USING (
        public.is_master(auth.uid()) OR 
        company_id = (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
      );
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS quotes_company_id_idx ON public.quotes(company_id);
CREATE INDEX IF NOT EXISTS quotes_client_id_idx ON public.quotes(client_id);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON public.quotes(status);
