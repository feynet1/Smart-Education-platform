-- Add max_marks columns to course_weights so teacher can set marks per category
-- Default max marks equal the weight value for each category
alter table public.course_weights
  add column if not exists hw_max     numeric(6,2) not null default 10,
  add column if not exists assign_max numeric(6,2) not null default 15,
  add column if not exists quiz_max   numeric(6,2) not null default 10,
  add column if not exists mid_max    numeric(6,2) not null default 25,
  add column if not exists proj_max   numeric(6,2) not null default 15,
  add column if not exists final_max  numeric(6,2) not null default 25;

-- Fix any existing rows to use weight-matching defaults
update public.course_weights
set
  hw_max     = homework,
  assign_max = assignment,
  quiz_max   = quiz,
  mid_max    = midterm,
  proj_max   = project,
  final_max  = final_exam
where hw_max is null
   or assign_max is null
   or quiz_max is null
   or mid_max is null
   or proj_max is null
   or final_max is null;
