-- Add grade column to profiles for students
alter table public.profiles
  add column if not exists grade text default null;
