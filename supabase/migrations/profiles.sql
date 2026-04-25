-- profiles (safe to re-run)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  role text not null default 'Student',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Own profile read" on public.profiles;
drop policy if exists "Own profile update" on public.profiles;
drop policy if exists "Service role all" on public.profiles;
drop policy if exists "Service role update" on public.profiles;

create policy "Own profile read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Own profile update"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Service role all"
  on public.profiles for all
  using (auth.role() = 'service_role');

-- Trigger: auto-create profile on email/password signup only
-- Google users are matched by email in the app (fetchProfile)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider text;
begin
  v_provider := coalesce(new.raw_app_meta_data->>'provider', 'email');

  -- Only create profile for email/password signups (includes admin invites)
  -- Google OAuth users must already have an account created via email first
  if v_provider = 'email' then
    insert into public.profiles (id, name, email, role)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      new.email,
      coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'Student')
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
