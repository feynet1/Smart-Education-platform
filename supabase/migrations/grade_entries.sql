-- course_weights: teacher sets weight per category for each course
create table if not exists public.course_weights (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade unique,
  homework   numeric(5,2) not null default 10 check (homework   >= 0),
  assignment numeric(5,2) not null default 15 check (assignment >= 0),
  quiz       numeric(5,2) not null default 10 check (quiz       >= 0),
  midterm    numeric(5,2) not null default 25 check (midterm    >= 0),
  project    numeric(5,2) not null default 15 check (project    >= 0),
  final_exam numeric(5,2) not null default 25 check (final_exam >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.course_weights enable row level security;

drop policy if exists "Teachers manage own weights" on public.course_weights;
drop policy if exists "Authenticated read weights"  on public.course_weights;

create policy "Teachers manage own weights"
  on public.course_weights for all
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.teacher_id = auth.uid()
    )
  );

create policy "Authenticated read weights"
  on public.course_weights for select
  using (auth.role() = 'authenticated');

-- grade_entries: one row per (course, student, category)
create table if not exists public.grade_entries (
  id uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses(id) on delete cascade,
  teacher_id   uuid not null references auth.users(id) on delete cascade,
  student_id   uuid not null references auth.users(id) on delete cascade,
  student_name text not null,
  category     text not null check (category in ('homework','assignment','quiz','midterm','project','final_exam')),
  score        numeric(5,2) not null check (score >= 0 and score <= 100),
  feedback     text,
  graded_at    date not null default current_date,
  created_at   timestamptz default now(),
  unique (course_id, student_id, category)
);

alter table public.grade_entries enable row level security;

drop policy if exists "Teachers manage own entries" on public.grade_entries;
drop policy if exists "Students read own entries"   on public.grade_entries;
drop policy if exists "Authenticated read entries"  on public.grade_entries;

create policy "Teachers manage own entries"
  on public.grade_entries for all
  using  (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

create policy "Students read own entries"
  on public.grade_entries for select
  using (auth.uid() = student_id);

create policy "Authenticated read entries"
  on public.grade_entries for select
  using (auth.role() = 'authenticated');
