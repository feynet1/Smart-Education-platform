-- Enable Row Level Security on the branches table
alter table branches enable row level security;

-- Drop existing policies if any exist
drop policy if exists "Enable read access for authenticated users" on branches;
drop policy if exists "Enable insert for authenticated users" on branches;
drop policy if exists "Enable update for authenticated users" on branches;
drop policy if exists "Enable delete for authenticated users" on branches;

-- Allow any logged-in user to see the branches (so they show up in dropdowns, etc.)
create policy "Enable read access for authenticated users"
on branches for select
using (auth.role() = 'authenticated');

-- Allow logged-in users to create branches
create policy "Enable insert for authenticated users"
on branches for insert
with check (auth.role() = 'authenticated');

-- Allow logged-in users to update branches
create policy "Enable update for authenticated users"
on branches for update
using (auth.role() = 'authenticated');

-- Allow logged-in users to delete branches
create policy "Enable delete for authenticated users"
on branches for delete
using (auth.role() = 'authenticated');
