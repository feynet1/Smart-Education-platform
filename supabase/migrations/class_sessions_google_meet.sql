-- Add meeting_type and google_meet_link columns to class_sessions
alter table public.class_sessions
  add column if not exists meeting_type text not null default 'jitsi' check (meeting_type in ('jitsi', 'google_meet')),
  add column if not exists google_meet_link text;
