-- ============================================================
-- profiles table
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  role text not null default 'Student',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Service role full access" on profiles;
drop policy if exists "Authenticated users can read profiles" on profiles;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Service role full access"
  on profiles for all
  using (auth.role() = 'service_role');

-- ============================================================
-- Trigger function: handle_new_user
-- Called after every insert into auth.users
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider  text;
  v_role      text;
  v_name      text;
  v_reg_raw   text;
  v_reg_enabled boolean;
  v_existing_id uuid;
begin
  -- Determine OAuth provider (defaults to 'email')
  v_provider := coalesce(new.raw_app_meta_data->>'provider', 'email');

  -- ── Block uninvited Google users ──────────────────────────
  if v_provider = 'google' then
    select id into v_existing_id
      from public.profiles
      where email = new.email
      limit 1;

    if v_existing_id is null then
      raise exception 'GOOGLE_NOT_INVITED: No account found for this email.';
    end if;

    -- Invited user linking Google — update profile id
    update public.profiles set id = new.id where email = new.email;
    return new;
  end if;

  -- ── Email / Password signup ───────────────────────────────
  v_role := coalesce(new.raw_user_meta_data->>'role', '');
  v_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));

  -- Admin invite (has role in metadata) — always allowed
  if v_role <> '' then
    insert into public.profiles (id, name, email, role)
      values (new.id, v_name, new.email, v_role)
      on conflict (id) do update
        set role = excluded.role,
            name = excluded.name;
    return new;
  end if;

  -- Open registration — read registrationEnabled from platform_settings
  -- value is stored as jsonb: true (boolean) or "true" (string) depending on insert
  v_reg_raw := null;
  begin
    select value::text
      into v_reg_raw
      from public.platform_settings
      where key = 'registrationEnabled'
      limit 1;
  exception when others then
    v_reg_raw := 'false';
  end;

  -- Accept both jsonb true and string "true"
  v_reg_enabled := (v_reg_raw = 'true' or v_reg_raw = '"true"');

  if v_reg_enabled then
    insert into public.profiles (id, name, email, role)
      values (new.id, v_name, new.email, 'Student')
      on conflict (id) do nothing;
    return new;
  end if;

  -- Registration closed and not an invite
  raise exception 'REGISTRATION_DISABLED: Registration is currently closed.';
end;
$$;

-- Attach trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
