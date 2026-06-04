ALTER TABLE public.clients ADD COLUMN has_preventive_contract BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.clients ADD COLUMN preventive_contract_value NUMERIC(10,2);
ALTER TABLE public.clients ADD COLUMN preventive_contract_file TEXT;
