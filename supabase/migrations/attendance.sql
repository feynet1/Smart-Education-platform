-- attendance table (safe to re-run)
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  student_name text not null,
  date date not null,
  status text not null default 'Present' check (status in ('Present', 'Absent', 'Late')),
  created_at timestamptz default now(),
  unique (course_id, student_id, date)
);

alter table public.attendance enable row level security;

drop policy if exists "Teachers manage attendance" on public.attendance;
drop policy if exists "Students read own attendance" on public.attendance;

-- Teachers can manage attendance for their courses
create policy "Teachers manage attendance"
  on public.attendance for all
  using (
    exists (
      select 1 from public.courses
      where courses.id = attendance.course_id
      and courses.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.courses
      where courses.id = attendance.course_id
      and courses.teacher_id = auth.uid()
    )
  );

-- Students can read their own attendance
create policy "Students read own attendance"
  on public.attendance for select
  using (auth.uid() = student_id);
