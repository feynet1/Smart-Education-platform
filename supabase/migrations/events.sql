-- events table (safe to re-run)
create table if not exists public.events (
  id bigserial primary key,
  title text not null,
  date date not null,
  type text not null default 'academic',
  target text not null default 'all',
  description text,
  created_at timestamptz default now()
);

alter table public.events enable row level security;

drop policy if exists "Auth read events" on public.events;
drop policy if exists "Auth write events" on public.events;
drop policy if exists "Public read events" on public.events;

-- Anyone authenticated can read events
create policy "Auth read events"
  on public.events for select
  using (auth.role() = 'authenticated');

-- Only authenticated users can insert/update/delete
create policy "Auth write events"
  on public.events for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Seed default events
insert into public.events (title, date, type, target) values
  ('Spring Semester Starts', '2026-01-15', 'academic', 'all'),
  ('Midterm Exams Week',     '2026-02-20', 'exam',     'students'),
  ('Faculty Meeting',        '2026-02-05', 'meeting',  'teachers')
on conflict do nothing;
