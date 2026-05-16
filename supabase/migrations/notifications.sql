-- notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'info',
  is_read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

drop policy if exists "Users can read own notifications" on public.notifications;
drop policy if exists "Authenticated users can create notifications" on public.notifications;
drop policy if exists "Users can update own notifications" on public.notifications;

-- Policies
create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Authenticated users can create notifications"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Enable realtime for notifications
alter publication supabase_realtime add table public.notifications;
