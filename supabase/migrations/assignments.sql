-- assignments table (safe to re-run)
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  type text not null default 'assignment' check (type in ('assignment', 'homework', 'quiz', 'project')),
  due_date date not null,
  created_at timestamptz default now()
);

alter table public.assignments enable row level security;

drop policy if exists "Teachers manage own assignments" on public.assignments;
drop policy if exists "Authenticated read assignments" on public.assignments;

create policy "Teachers manage own assignments"
  on public.assignments for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated read assignments"
  on public.assignments for select
  using (auth.role() = 'authenticated');

-- student_assignments: tracks completion per student
create table if not exists public.student_assignments (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'done')),
  completed_at timestamptz,
  unique (assignment_id, student_id)
);

alter table public.student_assignments enable row level security;

drop policy if exists "Students manage own completion" on public.student_assignments;
drop policy if exists "Teachers read completions" on public.student_assignments;

create policy "Students manage own completion"
  on public.student_assignments for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Teachers read completions"
  on public.student_assignments for select
  using (auth.role() = 'authenticated');
