-- courses table (safe to re-run)
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subject text not null,
  grade text not null,
  description text,
  join_code text not null unique,
  created_at timestamptz default now()
);

alter table public.courses enable row level security;

drop policy if exists "Teachers manage own courses" on public.courses;
drop policy if exists "Students read courses" on public.courses;
drop policy if exists "Admin read all courses" on public.courses;

-- Teachers can do everything with their own courses
create policy "Teachers manage own courses"
  on public.courses for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

-- Any authenticated user can read courses (needed for student join by code)
create policy "Authenticated read courses"
  on public.courses for select
  using (auth.role() = 'authenticated');
