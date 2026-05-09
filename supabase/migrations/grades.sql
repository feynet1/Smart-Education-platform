
-- grades table: teacher enters a grade per student per assignment
create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  assignment_id uuid references public.assignments(id) on delete set null,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  student_name text not null,
  subject text not null,
  assessment text not null,
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  grade text not null,
  feedback text,
  graded_at date not null default current_date,
  created_at timestamptz default now(),
  unique (course_id, student_id, assessment)
);

alter table public.grades enable row level security;

drop policy if exists "Teachers manage own grades" on public.grades;
drop policy if exists "Students read own grades" on public.grades;
drop policy if exists "Admin read all grades" on public.grades;

-- Teachers can insert/update/delete grades for their own courses
create policy "Teachers manage own grades"
  on public.grades for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

-- Students can only read their own grades
create policy "Students read own grades"
  on public.grades for select
  using (auth.uid() = student_id);

-- Any authenticated user can read all grades (for admin analytics)
create policy "Authenticated read all grades"
  on public.grades for select
  using (auth.role() = 'authenticated');
