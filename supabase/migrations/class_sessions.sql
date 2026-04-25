-- class_sessions table (safe to re-run)
create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  status text not null default 'open' check (status in ('open', 'closed')),
  started_at timestamptz default now(),
  closed_at timestamptz
);

alter table public.class_sessions enable row level security;

drop policy if exists "Teachers manage sessions" on public.class_sessions;
drop policy if exists "Authenticated read sessions" on public.class_sessions;

-- Teachers manage their own sessions
create policy "Teachers manage sessions"
  on public.class_sessions for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Anyone authenticated can read sessions (students need to check if session is open)
create policy "Authenticated read sessions"
  on public.class_sessions for select
  using (auth.role() = 'authenticated');

-- Add session_id to attendance if not exists
alter table public.attendance
  add column if not exists session_id uuid references public.class_sessions(id) on delete set null;
