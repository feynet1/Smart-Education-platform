-- 1. Create branches table
create table if not exists branches (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  description text,
  created_at  timestamptz default now(),
  created_by  uuid references profiles(id) on delete set null
);

-- 2. Add branch_id to profiles
alter table profiles
  add column if not exists branch_id uuid references branches(id) on delete set null;

-- 3. Add branch_id to courses
alter table courses
  add column if not exists branch_id uuid references branches(id) on delete set null;

-- 4. Add branch_id to events
alter table events
  add column if not exists branch_id uuid references branches(id) on delete set null;

-- 5. Add branch_id to attendance
alter table attendance
  add column if not exists branch_id uuid references branches(id) on delete set null;

-- 6. Add branch_id to grade_entries
alter table grade_entries
  add column if not exists branch_id uuid references branches(id) on delete set null;
