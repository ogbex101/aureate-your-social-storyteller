-- Phase 3.1: Storage bucket for uploaded post assets (images/video).
-- Objects are stored under `${auth.uid()}/...` so folder-based RLS scopes
-- every user to their own files. Run once in the Supabase SQL Editor.

insert into storage.buckets (id, name, public)
values ('assets', 'assets', false)
on conflict (id) do nothing;

drop policy if exists "assets bucket: owner select" on storage.objects;
create policy "assets bucket: owner select" on storage.objects
  for select using (bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "assets bucket: owner insert" on storage.objects;
create policy "assets bucket: owner insert" on storage.objects
  for insert with check (bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "assets bucket: owner update" on storage.objects;
create policy "assets bucket: owner update" on storage.objects
  for update using (bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "assets bucket: owner delete" on storage.objects;
create policy "assets bucket: owner delete" on storage.objects
  for delete using (bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text);
