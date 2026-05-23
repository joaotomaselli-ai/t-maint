
-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_name text not null default '',
  technician_name text not null default '',
  cnpj text,
  phone text,
  address text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Clients table
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  hourly_rate numeric not null default 0,
  km_rate numeric not null default 0,
  address text,
  contact text,
  created_at timestamptz not null default now()
);
alter table public.clients enable row level security;
create index clients_user_id_idx on public.clients(user_id);

create policy "Users view own clients" on public.clients for select using (auth.uid() = user_id);
create policy "Users insert own clients" on public.clients for insert with check (auth.uid() = user_id);
create policy "Users update own clients" on public.clients for update using (auth.uid() = user_id);
create policy "Users delete own clients" on public.clients for delete using (auth.uid() = user_id);

-- Service reports table
create table public.service_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  order_number text not null default '',
  date date not null,
  machine text not null default '',
  requester text not null default '',
  type text not null check (type in ('corretiva','preventiva')),
  description text not null default '',
  summary text not null default '',
  travel_out_start text not null default '',
  travel_out_end text not null default '',
  service_start text not null default '',
  service_end text not null default '',
  travel_back_start text not null default '',
  travel_back_end text not null default '',
  km numeric not null default 0,
  observation text,
  technician text not null default '',
  created_at timestamptz not null default now()
);
alter table public.service_reports enable row level security;
create index service_reports_user_id_idx on public.service_reports(user_id);
create index service_reports_client_id_idx on public.service_reports(client_id);

create policy "Users view own reports" on public.service_reports for select using (auth.uid() = user_id);
create policy "Users insert own reports" on public.service_reports for insert with check (auth.uid() = user_id);
create policy "Users update own reports" on public.service_reports for update using (auth.uid() = user_id);
create policy "Users delete own reports" on public.service_reports for delete using (auth.uid() = user_id);

-- Trigger to auto-update updated_at on profiles
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, company_name, technician_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'company_name', ''),
    coalesce(new.raw_user_meta_data->>'technician_name', new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
