-- Create activity_logs table for admin reports
create table if not exists activity_logs (
  id bigserial primary key,
  action text not null,
  "user" text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table activity_logs enable row level security;

-- Only authenticated users (admins) can read logs
create policy "Authenticated users can read logs"
  on activity_logs for select
  using (auth.role() = 'authenticated');

-- Only authenticated users (admins) can insert logs
create policy "Authenticated users can insert logs"
  on activity_logs for insert
  with check (auth.role() = 'authenticated');

-- Seed some initial logs
insert into activity_logs (action, "user", created_at) values
  ('Admin logged in',                   'admin@test.com',   now() - interval '2 days'),
  ('Teacher created course "Math 101"', 'teacher@test.com', now() - interval '3 days'),
  ('Student joined course',             'student@test.com', now() - interval '3 days')
on conflict do nothing;
