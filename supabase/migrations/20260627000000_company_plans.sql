ALTER TABLE public.companies 
ADD COLUMN plan_type text NOT NULL DEFAULT 'basic' CHECK (plan_type IN ('basic', 'pro', 'elite', 'elite_pro'));

-- Default existing companies to pro since they were already using all features
UPDATE public.companies SET plan_type = 'pro';
