-- Add jitsi_room column to class_sessions
-- Stores the auto-generated Jitsi Meet room name so teacher and students
-- always reference the exact same room for a given live session.
alter table public.class_sessions
  add column if not exists jitsi_room text;
