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
