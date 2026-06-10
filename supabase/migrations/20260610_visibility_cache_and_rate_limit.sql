-- Caching + rate-limiting infrastructure for the multi-engine visibility check.
-- Both tables are server-only: RLS is enabled with NO policies, so anon and
-- authenticated roles get nothing; only the service-role client (which bypasses
-- RLS) reads/writes them.

-- 1. Cache of multi-engine visibility results, keyed by a hash of
--    (prompt, brand, engine-config). TTL is enforced in the query, not here.
create table if not exists public.visibility_cache (
  cache_key text primary key,
  prompt text not null,
  brand text not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists visibility_cache_created_at_idx
  on public.visibility_cache (created_at);

alter table public.visibility_cache enable row level security;

-- 2. Fixed-window rate-limit counters, one row per (bucket, window).
create table if not exists public.rate_limit_counters (
  bucket text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (bucket, window_start)
);

create index if not exists rate_limit_counters_window_idx
  on public.rate_limit_counters (window_start);

alter table public.rate_limit_counters enable row level security;

-- 3. Atomic fixed-window increment. Returns the new count for the current
--    window. SECURITY DEFINER + pinned search_path; callable only by the
--    service role (the trusted server), never anon/authenticated.
create or replace function public.increment_rate_limit(p_bucket text, p_window_seconds integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_count integer;
begin
  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into public.rate_limit_counters (bucket, window_start, count)
  values (p_bucket, v_window, 1)
  on conflict (bucket, window_start)
  do update set count = public.rate_limit_counters.count + 1
  returning count into v_count;

  return v_count;
end;
$$;

revoke execute on function public.increment_rate_limit(text, integer) from public, anon, authenticated;
grant execute on function public.increment_rate_limit(text, integer) to service_role;
