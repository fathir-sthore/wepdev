-- 0008_vps_marketplace.sql
-- "Panel & Hosting" — admin uploads individual VPS units as stock (specs +
-- credentials), buyers purchase one unit at a time via Pakasir, same
-- pending -> completed flow as script purchases. Credentials only ever
-- surface to the admin who uploaded them and the buyer who paid for that
-- specific unit — never in a public listing.

create table if not exists public.vps_stock (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid not null references auth.users(id) on delete cascade,

  title text not null,
  description text,
  provider_type text not null, -- e.g. "DigitalOcean", "NAT", "Legal" — free text, admin's own label
  os text not null,
  cpu_cores integer not null check (cpu_cores > 0),
  cpu_model text,
  ram_gb integer not null check (ram_gb > 0),
  disk_gb integer not null check (disk_gb > 0),
  price numeric(12,2) not null check (price >= 0),

  -- Credentials — only ever read via the service-role client (admin API
  -- routes, and the buyer's "my VPS" page after a completed purchase),
  -- never through a client-writable/readable RLS path.
  ip_address text not null,
  port integer not null default 22,
  username text not null,
  password text not null,

  status text not null default 'available'
    check (status in ('available', 'reserved', 'sold')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vps_stock_status_idx on public.vps_stock (status);
create index if not exists vps_stock_uploaded_by_idx on public.vps_stock (uploaded_by);

alter table public.vps_stock enable row level security;

-- Public listing must never expose ip/port/username/password — enforced at
-- the column-grant level (same pattern as the profiles fix), not just by
-- what the app's SELECT happens to ask for.
create policy "Available VPS specs are publicly readable"
  on public.vps_stock for select
  using (status = 'available');

create policy "Admins read all VPS stock"
  on public.vps_stock for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

revoke select on public.vps_stock from anon, authenticated;
grant select (
  id, title, description, provider_type, os, cpu_cores, cpu_model,
  ram_gb, disk_gb, price, status, created_at
) on public.vps_stock to anon, authenticated;

drop trigger if exists vps_stock_set_updated_at on public.vps_stock;
create trigger vps_stock_set_updated_at
  before update on public.vps_stock
  for each row execute function public.set_updated_at();


create table if not exists public.vps_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vps_stock_id uuid not null references public.vps_stock(id) on delete restrict,

  order_id text not null unique,
  pakasir_txn_id text,
  payment_method text not null default 'qris',
  amount numeric(12,2) not null,
  fee numeric(12,2),
  total_payment numeric(12,2),
  qr_string text,

  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed', 'expired', 'cancelled')),

  expires_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vps_orders_user_idx on public.vps_orders (user_id);
create index if not exists vps_orders_stock_idx on public.vps_orders (vps_stock_id);
create index if not exists vps_orders_status_idx on public.vps_orders (status);
create index if not exists vps_orders_txn_idx on public.vps_orders (pakasir_txn_id);

alter table public.vps_orders enable row level security;

create policy "Users read their own VPS orders"
  on public.vps_orders for select
  using (auth.uid() = user_id);

create policy "Users create their own pending VPS order"
  on public.vps_orders for insert
  with check (auth.uid() = user_id and status = 'pending');

create policy "Admins read all VPS orders"
  on public.vps_orders for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop trigger if exists vps_orders_set_updated_at on public.vps_orders;
create trigger vps_orders_set_updated_at
  before update on public.vps_orders
  for each row execute function public.set_updated_at();


-- Atomically claims one available unit for a pending order — prevents two
-- concurrent buyers from being sold the same VPS. SKIP LOCKED means a
-- buyer never waits behind another buyer's in-flight reservation attempt;
-- they just get the next available row instead.
create or replace function public.reserve_vps_stock(p_stock_id uuid)
returns public.vps_stock
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.vps_stock;
begin
  select * into v_row
  from public.vps_stock
  where id = p_stock_id and status = 'available'
  for update skip locked;

  if not found then
    raise exception 'VPS_UNAVAILABLE';
  end if;

  update public.vps_stock set status = 'reserved' where id = p_stock_id;
  return v_row;
end;
$$;

-- Reverts a reservation back to available — called when a pending order
-- expires or is cancelled without completing.
create or replace function public.release_vps_stock(p_stock_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.vps_stock set status = 'available'
  where id = p_stock_id and status = 'reserved';
$$;
