
-- Fix search_path on touch_updated_at
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- Revoke execute from public/authenticated for SECURITY DEFINER trigger fn
revoke execute on function public.handle_new_user() from public, anon, authenticated;
