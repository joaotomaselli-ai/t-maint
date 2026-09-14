-- Add preventive contract fields to clients table
ALTER TABLE public.clients
ADD COLUMN has_preventive_contract boolean NOT NULL DEFAULT false,
ADD COLUMN preventive_contract_value numeric,
ADD COLUMN preventive_contract_file text;
