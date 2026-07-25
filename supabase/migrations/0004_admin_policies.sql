-- 0004_admin_policies.sql
-- The admin dashboard needs to update rows it doesn't own (other users'
-- profiles, other people's reports) — policies for that weren't needed
-- until now.

create policy "Admins update any profile"
  on public.profiles for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins update any report"
  on public.reports for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
