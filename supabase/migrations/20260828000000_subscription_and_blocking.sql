-- Migration for subscriptions, blocking and renewal tracking
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS blocked_reason text,
ADD COLUMN IF NOT EXISTS subscription_cycle text NOT NULL DEFAULT 'mensal' CHECK (subscription_cycle IN ('mensal', 'semestral', 'anual', 'personalizado')),
ADD COLUMN IF NOT EXISTS subscription_start_date timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS subscription_end_date timestamptz DEFAULT (now() + interval '30 days'),
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS auto_block_on_expire boolean NOT NULL DEFAULT true;

UPDATE public.companies 
SET 
  subscription_start_date = COALESCE(subscription_start_date, created_at, now()),
  subscription_end_date = COALESCE(subscription_end_date, now() + interval '30 days'),
  subscription_cycle = COALESCE(subscription_cycle, 'mensal'),
  is_blocked = COALESCE(is_blocked, false),
  auto_block_on_expire = COALESCE(auto_block_on_expire, true);
