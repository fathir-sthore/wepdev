-- 0003_storage.sql
-- Storage buckets for the admin/developer upload flow.
-- Convention: every object path starts with the uploading user's uid as the
-- first folder segment, e.g. "scripts/<uid>/<timestamp>-name.zip". This lets
-- the RLS policies below use storage.foldername(name)[1] = auth.uid() to
-- scope access without any extra lookup table.

insert into storage.buckets (id, name, public)
values
  ('scripts', 'scripts', false),        -- private: only served via signed URL
  ('thumbnails', 'thumbnails', true),
  ('screenshots', 'screenshots', true),
  ('documents', 'documents', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Public buckets: anyone can read, owner can write/delete their own folder.
-- ---------------------------------------------------------------------------
create policy "Public read: thumbnails"
  on storage.objects for select
  using (bucket_id = 'thumbnails');

create policy "Public read: screenshots"
  on storage.objects for select
  using (bucket_id = 'screenshots');

create policy "Public read: documents"
  on storage.objects for select
  using (bucket_id = 'documents');

create policy "Public read: avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Owners write their own folder: thumbnails"
  on storage.objects for insert
  with check (bucket_id = 'thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners write their own folder: screenshots"
  on storage.objects for insert
  with check (bucket_id = 'screenshots' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners write their own folder: documents"
  on storage.objects for insert
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners write their own folder: avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners update their own files"
  on storage.objects for update
  using ((storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners delete their own files"
  on storage.objects for delete
  using ((storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- Private "scripts" bucket: owner can write/manage; nobody can read directly
-- (downloads are only ever served through a signed URL from the service role,
-- see app/api/scripts/[id]/download).
-- ---------------------------------------------------------------------------
create policy "Owners write their own folder: scripts"
  on storage.objects for insert
  with check (bucket_id = 'scripts' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners manage their own files: scripts"
  on storage.objects for select
  using (bucket_id = 'scripts' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners update their own files: scripts"
  on storage.objects for update
  using (bucket_id = 'scripts' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners delete their own files: scripts"
  on storage.objects for delete
  using (bucket_id = 'scripts' and (storage.foldername(name))[1] = auth.uid()::text);
