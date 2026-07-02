-- Ajustes do Estoque (Correções e Unicidade)

-- 1. Restrição para não permitir criar um material com o mesmo nome na mesma empresa
ALTER TABLE public.inventory_items 
ADD CONSTRAINT inventory_items_company_name_key UNIQUE (company_id, name);

-- 2. Correção do Trigger: adicionar SECURITY DEFINER para ignorar RLS e permitir a criação na tabela de requisições,
-- e também cobrir o cenário de INSERT.
CREATE OR REPLACE FUNCTION public.check_inventory_min_quantity()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.min_quantity IS NOT NULL THEN
        -- Verifica se a operação é INSERT ou se a quantidade cruzou o limite para baixo no UPDATE
        IF (NEW.current_quantity <= NEW.min_quantity) AND 
           (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.current_quantity > NEW.min_quantity)) THEN
            
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

-- Já existe o trg_check_inventory_min_quantity para UPDATE, vamos recriar e adicionar para INSERT
DROP TRIGGER IF EXISTS trg_check_inventory_min_quantity ON public.inventory_items;

CREATE TRIGGER trg_check_inventory_min_quantity
AFTER UPDATE OF current_quantity ON public.inventory_items
FOR EACH ROW EXECUTE FUNCTION public.check_inventory_min_quantity();

CREATE TRIGGER trg_check_inventory_min_quantity_ins
AFTER INSERT ON public.inventory_items
FOR EACH ROW EXECUTE FUNCTION public.check_inventory_min_quantity();
