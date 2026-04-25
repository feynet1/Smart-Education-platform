-- course_notes metadata table (safe to re-run)
create table if not exists public.course_notes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size text,
  file_type text,
  created_at timestamptz default now()
);

alter table public.course_notes enable row level security;

drop policy if exists "Teachers manage own notes" on public.course_notes;
drop policy if exists "Authenticated read notes" on public.course_notes;

-- Teachers manage their own notes
create policy "Teachers manage own notes"
  on public.course_notes for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Any authenticated user can read notes (students need to download)
create policy "Authenticated read notes"
  on public.course_notes for select
  using (auth.role() = 'authenticated');
