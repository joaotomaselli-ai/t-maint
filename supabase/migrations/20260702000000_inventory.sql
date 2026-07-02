-- Módulo de Estoque Inteligente

-- 1. Tabela de Itens de Estoque (inventory_items)
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT, -- Opcional, Código da Peça
    description TEXT,
    location TEXT, -- Onde está guardado (Corredor, prateleira)
    unit TEXT NOT NULL DEFAULT 'Un', -- Unidade de medida (Un, Kg, M, etc)
    min_quantity NUMERIC(10,2), -- Opcional, se NULL não tem estoque mínimo
    current_quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
    average_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    qr_code_value TEXT, -- Pode ser o próprio ID ou uma URL completa, o front-end vai gerar
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS na tabela items
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members view inventory_items" ON public.inventory_items FOR SELECT TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    company_id = (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Company members manage inventory_items" ON public.inventory_items FOR ALL TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    company_id = (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
  );

-- 2. Tabela de Histórico de Movimentações (inventory_movements)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')), -- Entrada ou Saída
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_cost NUMERIC(10,2) NOT NULL DEFAULT 0, -- Calculado (quantity * unit_cost)
    activity_id UUID REFERENCES public.service_reports(id) ON DELETE SET NULL, -- Opcional
    user_id UUID NOT NULL REFERENCES auth.users(id), -- Quem fez a movimentação
    reason TEXT, -- Motivo (Ex: Compra, Ajuste de Estoque, Consumo)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS na tabela movements
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members view inventory_movements" ON public.inventory_movements FOR SELECT TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    company_id = (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Company members insert inventory_movements" ON public.inventory_movements FOR INSERT TO authenticated
  WITH CHECK (
    public.is_master(auth.uid()) OR 
    company_id = (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
  );

-- Movimentações em geral não devem ser editadas ou deletadas (são um log imutável), mas vamos manter a regra padrão para admins, caso precisem corrigir algo.
CREATE POLICY "Company members update inventory_movements" ON public.inventory_movements FOR UPDATE TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    company_id = (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "Company members delete inventory_movements" ON public.inventory_movements FOR DELETE TO authenticated
  USING (
    public.is_master(auth.uid()) OR 
    company_id = (SELECT company_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
  );


-- 3. Trigger para gerar Requisição Automática quando atingir o estoque mínimo
-- O usuário pediu para que o min_quantity seja opcional (podendo ser NULL).
CREATE OR REPLACE FUNCTION public.check_inventory_min_quantity()
RETURNS TRIGGER AS $$
BEGIN
    -- Só prossegue se o item TIVER um estoque mínimo configurado (NOT NULL)
    IF NEW.min_quantity IS NOT NULL THEN
        -- Se a quantidade atual caiu para igual ou menor que a mínima, e antes não estava (ou acabou de ser criado/movimentado)
        -- Para evitar flood, a gente pode checar se old estava maior, OU se é uma requisição que ainda não foi gerada.
        -- Vamos verificar se a nova quantidade é <= min_quantity e a anterior era > min_quantity.
        -- OBS: Triggers de UPDATE na tabela de itens ou inserções de movimentações podem alterar o current_quantity.
        -- Neste trigger simples na tabela inventory_items:
        IF (NEW.current_quantity <= NEW.min_quantity) AND (OLD.current_quantity > NEW.min_quantity) THEN
            -- Inserir requisição avulsa
            INSERT INTO public.requisitions (company_id, description, status)
            VALUES (
                NEW.company_id, 
                '⚠️ ALERTA DE ESTOQUE MÍNIMO: Reposição automática solicitada para o item "' || NEW.name || '" (SKU: ' || COALESCE(NEW.sku, 'S/N') || '). Quantidade atual: ' || NEW.current_quantity || ' ' || NEW.unit, 
                'Aberta'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_inventory_min_quantity ON public.inventory_items;
CREATE TRIGGER trg_check_inventory_min_quantity
AFTER UPDATE OF current_quantity ON public.inventory_items
FOR EACH ROW EXECUTE FUNCTION public.check_inventory_min_quantity();
