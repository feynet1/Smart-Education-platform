-- Add max_marks columns to course_weights so teacher can set marks per category
alter table public.course_weights
  add column if not exists hw_max    numeric(6,2) not null default 10,
  add column if not exists assign_max numeric(6,2) not null default 20,
  add column if not exists quiz_max  numeric(6,2) not null default 10,
  add column if not exists mid_max   numeric(6,2) not null default 50,
  add column if not exists proj_max  numeric(6,2) not null default 30,
  add column if not exists final_max numeric(6,2) not null default 100;
