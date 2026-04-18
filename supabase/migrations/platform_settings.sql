-- Create platform_settings table
create table if not exists platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Insert default values (skip if already exist)
insert into platform_settings (key, value) values
  ('registrationEnabled', 'false'),
  ('maintenanceMode', 'false'),
  ('academicYear', '"2025-2026"'),
  ('semesterName', '"Spring 2026"')
on conflict (key) do nothing;

-- Enable RLS
alter table platform_settings enable row level security;

-- Drop all old policies first to avoid conflicts
drop policy if exists "Public can read settings" on platform_settings;
drop policy if exists "Admins can update settings" on platform_settings;
drop policy if exists "Authenticated users can update settings" on platform_settings;

-- Anyone can read (needed for /register page before login)
create policy "Public can read settings"
  on platform_settings for select
  using (true);

-- Only logged-in users (admins) can write
create policy "Authenticated users can update settings"
  on platform_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
