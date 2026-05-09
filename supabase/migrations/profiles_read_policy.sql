-- Allow any authenticated user to read all profiles
-- Needed for: admin user management, teacher name display on courses, etc.

drop policy if exists "Authenticated read all profiles" on public.profiles;

create policy "Authenticated read all profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');
