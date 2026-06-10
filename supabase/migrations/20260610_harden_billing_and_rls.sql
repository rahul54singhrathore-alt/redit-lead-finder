-- Hardening migration (post-deploy advisor fixes)
--   1. Lock down the protect_billing_columns SECURITY DEFINER trigger function
--   2. Rewrite RLS policies to evaluate auth.uid() once per query, not per row
--   3. Add the missing covering index for tracked_keywords.user_id

-- 1. Lock down the billing-guard trigger function.
--    Pin search_path (privilege-escalation hardening) and revoke the default
--    PUBLIC execute grant so it can't be invoked directly via /rest/v1/rpc.
--    The trigger keeps working: trigger execution does not require EXECUTE.
alter function public.protect_billing_columns() set search_path = '';
revoke execute on function public.protect_billing_columns() from public, anon, authenticated;

-- 2. Rewrite RLS policies: (auth.uid() = user_id) -> ((select auth.uid()) = user_id)

-- user_profiles
drop policy "Users can read own profile"   on public.user_profiles;
create policy "Users can read own profile"   on public.user_profiles for select using ((select auth.uid()) = user_id);
drop policy "Users can insert own profile"  on public.user_profiles;
create policy "Users can insert own profile" on public.user_profiles for insert with check ((select auth.uid()) = user_id);
drop policy "Users can update own profile"   on public.user_profiles;
create policy "Users can update own profile" on public.user_profiles for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy "Users can delete own profile"   on public.user_profiles;
create policy "Users can delete own profile" on public.user_profiles for delete using ((select auth.uid()) = user_id);

-- tracked_keywords
drop policy "Users can read own keywords"    on public.tracked_keywords;
create policy "Users can read own keywords"   on public.tracked_keywords for select using ((select auth.uid()) = user_id);
drop policy "Users can insert own keywords"  on public.tracked_keywords;
create policy "Users can insert own keywords" on public.tracked_keywords for insert with check ((select auth.uid()) = user_id);
drop policy "Users can update own keywords"   on public.tracked_keywords;
create policy "Users can update own keywords" on public.tracked_keywords for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy "Users can delete own keywords"   on public.tracked_keywords;
create policy "Users can delete own keywords" on public.tracked_keywords for delete using ((select auth.uid()) = user_id);

-- tracked_prompts
drop policy "Users manage own tracked_prompts select" on public.tracked_prompts;
create policy "Users manage own tracked_prompts select" on public.tracked_prompts for select using ((select auth.uid()) = user_id);
drop policy "Users manage own tracked_prompts insert" on public.tracked_prompts;
create policy "Users manage own tracked_prompts insert" on public.tracked_prompts for insert with check ((select auth.uid()) = user_id);
drop policy "Users manage own tracked_prompts delete" on public.tracked_prompts;
create policy "Users manage own tracked_prompts delete" on public.tracked_prompts for delete using ((select auth.uid()) = user_id);

-- prompt_rank_history
drop policy "prompt_rank_history_owner_all" on public.prompt_rank_history;
create policy "prompt_rank_history_owner_all" on public.prompt_rank_history for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 3. Add covering index for the unindexed foreign key
create index if not exists tracked_keywords_user_id_idx on public.tracked_keywords (user_id);
