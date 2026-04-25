-- activity_logs (safe to re-run)
create table if not exists public.activity_logs (
  id bigserial primary key,
  action text not null,
  "user" text not null,
  created_at timestamptz default now()
);

alter table public.activity_logs enable row level security;

drop policy if exists "Auth read logs" on public.activity_logs;
drop policy if exists "Auth insert logs" on public.activity_logs;
drop policy if exists "Auth delete logs" on public.activity_logs;

create policy "Auth read logs"
  on public.activity_logs for select
  using (auth.role() = 'authenticated');

create policy "Auth insert logs"
  on public.activity_logs for insert
  with check (auth.role() = 'authenticated');

create policy "Auth delete logs"
  on public.activity_logs for delete
  using (auth.role() = 'authenticated');
