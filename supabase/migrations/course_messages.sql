-- course_messages: per-course real-time chat
create table if not exists public.course_messages (
  id          uuid        primary key default gen_random_uuid(),
  course_id   uuid        not null references public.courses(id) on delete cascade,
  sender_id   uuid        not null references auth.users(id),
  sender_name text        not null,
  sender_role text        not null check (sender_role in ('Teacher', 'Student')),
  content     text        not null check (char_length(content) <= 2000),
  created_at  timestamptz not null default now()
);

-- Efficient retrieval of recent messages per course
create index if not exists course_messages_course_time_idx
  on public.course_messages (course_id, created_at desc);

alter table public.course_messages enable row level security;

-- Enable Realtime for this table
alter publication supabase_realtime add table public.course_messages;

-- ── RLS Policies ──────────────────────────────────────────────────────────────

drop policy if exists "Participants can read course messages" on public.course_messages;
drop policy if exists "Participants can insert course messages" on public.course_messages;

-- READ: teacher who owns the course OR enrolled student
create policy "Participants can read course messages"
  on public.course_messages for select
  using (
    -- Teacher owns the course
    exists (
      select 1 from public.courses c
      where c.id = course_id
        and c.teacher_id = auth.uid()
    )
    or
    -- Student is actively enrolled
    exists (
      select 1 from public.enrollments e
      where e.course_id = course_messages.course_id
        and e.student_id = auth.uid()
    )
  );

-- INSERT: same participant check + sender_id must match authenticated user
create policy "Participants can insert course messages"
  on public.course_messages for insert
  with check (
    auth.uid() = sender_id
    and (
      exists (
        select 1 from public.courses c
        where c.id = course_id
          and c.teacher_id = auth.uid()
      )
      or
      exists (
        select 1 from public.enrollments e
        where e.course_id = course_messages.course_id
          and e.student_id = auth.uid()
      )
    )
  );
