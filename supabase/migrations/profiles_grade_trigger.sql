-- Update the new_user trigger to also save grade for students

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
  v_role     text;
  v_grade    text;
begin
  v_provider := coalesce(new.raw_app_meta_data->>'provider', 'email');

  -- Only create profile for email/password signups (includes admin invites)
  if v_provider = 'email' then
    v_role  := coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'Student');
    v_grade := case when v_role = 'Student' then new.raw_user_meta_data->>'grade' else null end;

    insert into public.profiles (id, name, email, role, grade)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      new.email,
      v_role,
      v_grade
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
