-- Add avatar_url column to profiles
alter table public.profiles add column if not exists avatar_url text;

-- Create avatars storage bucket (public so images can be displayed via URL)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Drop existing policies to avoid conflicts
drop policy if exists "Avatar public read" on storage.objects;
drop policy if exists "Avatar own upload" on storage.objects;
drop policy if exists "Avatar own delete" on storage.objects;

-- Policy: anyone can read avatars (they are public)
create policy "Avatar public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Policy: authenticated users can upload their own avatar
create policy "Avatar own upload"
  on storage.objects for insert
  with check (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: users can update/delete their own avatar
create policy "Avatar own delete"
  on storage.objects for delete
  using (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
