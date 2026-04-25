-- platform_settings (safe to re-run)
create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

insert into public.platform_settings (key, value) values
  ('registrationEnabled', 'false'),
  ('maintenanceMode', 'false'),
  ('academicYear', '"2025-2026"'),
  ('semesterName', '"Spring 2026"')
on conflict (key) do nothing;

alter table public.platform_settings enable row level security;

drop policy if exists "Public read settings" on public.platform_settings;
drop policy if exists "Auth write settings" on public.platform_settings;

create policy "Public read settings"
  on public.platform_settings for select using (true);

create policy "Auth write settings"
  on public.platform_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
