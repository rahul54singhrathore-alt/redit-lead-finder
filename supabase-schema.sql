create table if not exists public.early_access_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  market text not null,
  source text not null default 'website',
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.early_access_leads enable row level security;

drop policy if exists "Allow public lead submissions" on public.early_access_leads;

create policy "Allow public lead submissions"
on public.early_access_leads
for insert
to anon
with check (
  length(email) <= 320
  and position('@' in email) > 1
  and length(market) between 2 and 500
  and source = 'website'
);
