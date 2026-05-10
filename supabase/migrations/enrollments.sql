-- enrollments table: tracks which students are enrolled in which courses
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz default now(),
  unique (student_id, course_id)
);

alter table public.enrollments enable row level security;

-- Drop existing policies safely
drop policy if exists "Students manage own enrollments"   on public.enrollments;
drop policy if exists "Teachers read course enrollments"  on public.enrollments;
drop policy if exists "Authenticated read enrollments"    on public.enrollments;

-- Students can enroll/unenroll themselves
create policy "Students manage own enrollments"
  on public.enrollments for all
  using  (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- Teachers can read enrollments for their own courses
create policy "Teachers read course enrollments"
  on public.enrollments for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id
        and c.teacher_id = auth.uid()
    )
  );

-- Admins and service role can read all enrollments
create policy "Authenticated read enrollments"
  on public.enrollments for select
  using (auth.role() = 'authenticated');
