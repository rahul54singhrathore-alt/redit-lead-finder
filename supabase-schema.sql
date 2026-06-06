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

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  onboarding_completed boolean not null default false,
  starter_keyword text not null default '',
  customer_type text not null default 'both' check (customer_type in ('b2b', 'b2c', 'both')),
  target_subreddits text[] not null default array['ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Reddit', 'Quora']::text[],
  digest_frequency text not null default 'daily' check (digest_frequency in ('daily', 'weekly', 'off')),
  email_digest boolean not null default true,
  instant_alerts boolean not null default true,
  alert_channel text not null default 'email' check (alert_channel in ('email', 'dashboard')),
  min_score integer not null default 5,
  min_comments integer not null default 3,
  ignored_terms text not null default '',
  export_format text not null default 'csv' check (export_format in ('csv', 'json')),
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro', 'growth', 'agency')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles
  alter column target_subreddits set default array['ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Reddit', 'Quora']::text[];

alter table public.user_profiles enable row level security;

drop policy if exists "Users can read own profile" on public.user_profiles;
drop policy if exists "Users can insert own profile" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;
drop policy if exists "Users can delete own profile" on public.user_profiles;

create policy "Users can read own profile"
on public.user_profiles for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own profile"
on public.user_profiles for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own profile"
on public.user_profiles for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own profile"
on public.user_profiles for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.tracked_keywords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  keyword text not null,
  subreddits text[] not null default array['ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Reddit', 'Quora']::text[],
  leads_found integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tracked_keywords_keyword_length check (length(keyword) between 1 and 160)
);

alter table public.tracked_keywords
  alter column subreddits set default array['ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Reddit', 'Quora']::text[];

alter table public.tracked_keywords enable row level security;

drop policy if exists "Users can read own keywords" on public.tracked_keywords;
drop policy if exists "Users can insert own keywords" on public.tracked_keywords;
drop policy if exists "Users can update own keywords" on public.tracked_keywords;
drop policy if exists "Users can delete own keywords" on public.tracked_keywords;

create policy "Users can read own keywords"
on public.tracked_keywords for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own keywords"
on public.tracked_keywords for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own keywords"
on public.tracked_keywords for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own keywords"
on public.tracked_keywords for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.reddit_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subreddit text not null,
  author text not null default 'unknown',
  keyword text not null default '',
  intent text not null default 'Medium' check (intent in ('High', 'Medium', 'Low')),
  status text not null default 'New' check (status in ('New', 'Saved', 'Contacted', 'Archived')),
  score integer not null default 0,
  comments integer not null default 0,
  url text not null default 'https://example.com',
  posted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reddit_leads
  alter column url set default 'https://example.com';

alter table public.reddit_leads enable row level security;

drop policy if exists "Users can read own leads" on public.reddit_leads;
drop policy if exists "Users can insert own leads" on public.reddit_leads;
drop policy if exists "Users can update own leads" on public.reddit_leads;
drop policy if exists "Users can delete own leads" on public.reddit_leads;

create policy "Users can read own leads"
on public.reddit_leads for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own leads"
on public.reddit_leads for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own leads"
on public.reddit_leads for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own leads"
on public.reddit_leads for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  trigger text not null default 'new matching lead found',
  channel text not null default 'Instant email',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint alert_rules_name_length check (length(name) between 1 and 160)
);

alter table public.alert_rules enable row level security;

drop policy if exists "Users can read own alert rules" on public.alert_rules;
drop policy if exists "Users can insert own alert rules" on public.alert_rules;
drop policy if exists "Users can update own alert rules" on public.alert_rules;
drop policy if exists "Users can delete own alert rules" on public.alert_rules;

create policy "Users can read own alert rules"
on public.alert_rules for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own alert rules"
on public.alert_rules for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own alert rules"
on public.alert_rules for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own alert rules"
on public.alert_rules for delete
to authenticated
using (auth.uid() = user_id);
