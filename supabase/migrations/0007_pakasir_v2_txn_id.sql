-- 0007_pakasir_v2_txn_id.sql
-- Pakasir's v2 API identifies transactions by an opaque txn_id returned
-- from create-transaction, not by order_id+amount like v1 (which is
-- deprecated and shuts down 2026-10-20). Status checks and cancellation
-- both require this id going forward.

alter table public.purchases add column if not exists pakasir_txn_id text;
create index if not exists purchases_pakasir_txn_id_idx on public.purchases (pakasir_txn_id);
