import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

export function createBrowserSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}

export function getAppUrl() {
  return appUrl || (typeof window === "undefined" ? undefined : window.location.origin);
}

export function isMissingSupabaseTableError(error, tableName) {
  if (!error) return false;

  const message = String(error.message || "").toLowerCase();
  const details = String(error.details || "").toLowerCase();
  const hint = String(error.hint || "").toLowerCase();
  const target = String(tableName || "").toLowerCase();

  return (
    message.includes(`public.${target}`) ||
    message.includes(`.${target}`) ||
    details.includes(target) ||
    hint.includes("schema cache") ||
    hint.includes("reload") ||
    message.includes("does not exist")
  );
}
