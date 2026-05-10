-- Fix grade_entries score constraint to allow raw marks above 100
-- (e.g. midterm out of 50 is fine, but we store raw marks not percentages)
alter table public.grade_entries
  drop constraint if exists grade_entries_score_check;

alter table public.grade_entries
  add constraint grade_entries_score_check
  check (score >= 0 and score <= 10000);

-- Also ensure students can read their own grade entries
drop policy if exists "Students read own entries" on public.grade_entries;
create policy "Students read own entries"
  on public.grade_entries for select
  using (auth.uid() = student_id);
