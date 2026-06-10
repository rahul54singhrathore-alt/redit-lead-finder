// Caching + rate-limiting for the (expensive) multi-engine visibility check.
//
// Both are backed by Supabase so they work on serverless, where in-memory
// state does not survive across instances. Everything goes through the
// service-role admin client (server-only). If the service-role key is absent,
// these helpers degrade to no-ops so the check still works — just uncached and
// unthrottled.

import { createHash } from "crypto";

import { createAdminClient } from "./supabase-server";
import { engineConfigSignature } from "./engines";

// How long a (prompt, brand, engine-config) result stays fresh.
const CACHE_TTL_SECONDS = Number(process.env.VISIBILITY_CACHE_TTL_SECONDS || 6 * 60 * 60);
// Rate limit: max checks per window per client.
const RATE_LIMIT_MAX = Number(process.env.VISIBILITY_RATE_LIMIT_MAX || 15);
const RATE_LIMIT_WINDOW_SECONDS = Number(process.env.VISIBILITY_RATE_LIMIT_WINDOW || 300);

function cacheKey(prompt, brand) {
  const normalized = `${String(prompt).trim().toLowerCase()}::${String(brand).trim().toLowerCase()}::${engineConfigSignature()}`;
  return createHash("sha256").update(normalized).digest("hex");
}

// Best-effort client identifier for rate limiting. Prefers the first
// X-Forwarded-For hop (the real client behind a proxy/CDN), then other common
// headers, falling back to a shared bucket.
export function clientIdentifier(request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "anonymous"
  );
}

// Atomic fixed-window rate limit via a Postgres function. Returns
// { allowed, remaining, limit, retryAfter }. Fails open if Supabase is
// unavailable — never block a real check because the limiter is down.
export async function checkRateLimit(identifier) {
  const admin = createAdminClient();
  if (!admin) return { allowed: true, remaining: RATE_LIMIT_MAX, limit: RATE_LIMIT_MAX, retryAfter: 0 };

  const { data, error } = await admin.rpc("increment_rate_limit", {
    p_bucket: `visibility:${identifier}`,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
  });

  if (error || typeof data !== "number") {
    return { allowed: true, remaining: RATE_LIMIT_MAX, limit: RATE_LIMIT_MAX, retryAfter: 0 };
  }

  const count = data;
  const allowed = count <= RATE_LIMIT_MAX;
  return {
    allowed,
    remaining: Math.max(0, RATE_LIMIT_MAX - count),
    limit: RATE_LIMIT_MAX,
    retryAfter: allowed ? 0 : RATE_LIMIT_WINDOW_SECONDS,
  };
}

// Returns a fresh cached result for (prompt, brand) or null.
export async function getCachedResult(prompt, brand) {
  const admin = createAdminClient();
  if (!admin) return null;

  const key = cacheKey(prompt, brand);
  const freshAfter = new Date(Date.now() - CACHE_TTL_SECONDS * 1000).toISOString();

  const { data, error } = await admin
    .from("visibility_cache")
    .select("result, created_at")
    .eq("cache_key", key)
    .gte("created_at", freshAfter)
    .maybeSingle();

  if (error || !data) return null;
  return { result: data.result, cachedAt: data.created_at };
}

// Upserts a result into the cache. Best-effort — a cache write failure must
// not fail the request.
export async function putCachedResult(prompt, brand, result) {
  const admin = createAdminClient();
  if (!admin) return;

  const key = cacheKey(prompt, brand);
  await admin
    .from("visibility_cache")
    .upsert(
      {
        cache_key: key,
        prompt: String(prompt).slice(0, 500),
        brand: String(brand).slice(0, 200),
        result,
        created_at: new Date().toISOString(),
      },
      { onConflict: "cache_key" },
    );
}
