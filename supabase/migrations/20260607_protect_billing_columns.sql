-- Billing columns must only ever be changed by trusted server code (the Stripe
-- webhook, which uses the service-role key). The RLS update policy on
-- user_profiles lets a user update their own profile row for legit fields
-- (brand, onboarding, etc.), but without this trigger they could also
-- self-grant a paid plan from the browser. The trigger freezes billing columns
-- for everyone except service_role.
-- (Moved from the root supabase-schema.sql; must run before
-- 20260610_harden_billing_and_rls.sql, which alters this function.)
create or replace function public.protect_billing_columns()
returns trigger language plpgsql security definer as $$
begin
  if current_user <> 'service_role' then
    new.subscription_tier      := old.subscription_tier;
    new.subscription_status    := old.subscription_status;
    new.stripe_customer_id     := old.stripe_customer_id;
    new.stripe_subscription_id := old.stripe_subscription_id;
  end if;
  return new;
end; $$;

drop trigger if exists trg_protect_billing_columns on public.user_profiles;

create trigger trg_protect_billing_columns
  before update on public.user_profiles
  for each row execute function public.protect_billing_columns();
