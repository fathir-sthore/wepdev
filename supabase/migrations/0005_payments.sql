-- 0005_payments.sql
-- Purchases table backing the Pakasir QRIS payment flow. Status transitions
-- (pending -> completed/failed/expired/cancelled) only ever happen server-side
-- via the service-role client (webhook + status-check + cancel routes) —
-- there is deliberately no client-writable "update" RLS policy here.

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  script_id uuid not null references public.scripts(id) on delete cascade,

  order_id text not null unique,
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

create index if not exists purchases_user_idx on public.purchases (user_id);
create index if not exists purchases_script_idx on public.purchases (script_id);
create index if not exists purchases_order_idx on public.purchases (order_id);
create index if not exists purchases_status_idx on public.purchases (status);

-- Only one *completed* purchase per user per script — pending/failed/expired
-- rows from retries are fine to keep around for history.
create unique index if not exists purchases_one_completed_per_user_script
  on public.purchases (user_id, script_id)
  where (status = 'completed');

alter table public.purchases enable row level security;

create policy "Users read their own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

create policy "Users create their own pending purchase"
  on public.purchases for insert
  with check (auth.uid() = user_id and status = 'pending');

create policy "Admins read all purchases"
  on public.purchases for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop trigger if exists purchases_set_updated_at on public.purchases;
create trigger purchases_set_updated_at
  before update on public.purchases
  for each row execute function public.set_updated_at();
