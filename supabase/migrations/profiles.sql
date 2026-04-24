-- ============================================================
-- profiles table
-- One row per auth user. Created automatically via trigger.
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  role text not null default 'Student',
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Drop existing policies to avoid conflicts on re-run
drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Service role full access" on profiles;

-- Users can read their own profile
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Service role can do everything (needed for the trigger and edge functions)
create policy "Service role full access"
  on profiles for all
  using (auth.role() = 'service_role');

-- ============================================================
-- Trigger: auto-create profile on signup
--
-- SECURITY RULE:
--   - Email/password signups (provider = 'email') are allowed
--     only when registrationEnabled = true in platform_settings,
--     OR when the user was invited (raw_user_meta_data has a role).
--   - Google OAuth signups (provider = 'google') are BLOCKED
--     unless the user's email already exists in profiles
--     (meaning they were previously invited and accepted).
--   - Any other provider is blocked by default.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider text;
  v_role text;
  v_name text;
  v_reg_enabled boolean;
  v_existing_profile uuid;
begin
  -- Determine provider
  v_provider := new.raw_app_meta_data->>'provider';

  -- ── Google OAuth ──────────────────────────────────────────
  -- Only allow if a profile row already exists for this email
  -- (i.e. the user was invited first via email/password flow)
  if v_provider = 'google' then
    select id into v_existing_profile
      from public.profiles
      where email = new.email
      limit 1;

    if v_existing_profile is null then
      -- No prior profile — uninvited Google user. Block by raising exception.
      raise exception 'GOOGLE_NOT_INVITED: No account found for %. Contact your administrator.', new.email;
    end if;

    -- Profile exists — update the id to link to the new Google auth user
    -- (handles the case where they were invited via email and now link Google)
    update public.profiles set id = new.id where email = new.email;
    return new;
  end if;

  -- ── Email / Password signup ───────────────────────────────
  if v_provider = 'email' then
    -- Check if this is an admin invite (has role in metadata)
    v_role := coalesce(new.raw_user_meta_data->>'role', '');
    v_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));

    if v_role != '' then
      -- Invited user — always allowed, create profile with assigned role
      insert into public.profiles (id, name, email, role)
        values (new.id, v_name, new.email, v_role)
        on conflict (id) do update set role = excluded.role, name = excluded.name;
      return new;
    end if;

    -- Open registration — check platform_settings
    select (value::text = 'true' or value::boolean = true)
      into v_reg_enabled
      from public.platform_settings
      where key = 'registrationEnabled'
      limit 1;

    if v_reg_enabled then
      insert into public.profiles (id, name, email, role)
        values (new.id, v_name, new.email, coalesce(nullif(v_role,''), 'Student'))
        on conflict (id) do nothing;
      return new;
    else
      -- Registration disabled and not an invite — block
      raise exception 'REGISTRATION_DISABLED: Registration is currently closed. Contact your administrator.';
    end if;
  end if;

  -- ── Any other provider — block ────────────────────────────
  raise exception 'PROVIDER_NOT_ALLOWED: Sign-in provider "%" is not permitted.', v_provider;
end;
$$;

-- Attach trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
