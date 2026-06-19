import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Dodo Payments webhook handler — Supabase Edge Function
// Verifies the Standard Webhooks signature, then grants/revokes subscription
// tiers in user_profiles based on payment lifecycle events.
//
// Deploy:   supabase functions deploy dodo-webhook --no-verify-jwt
// Secrets:  supabase secrets set DODO_WEBHOOK_SECRET=<from dodo dashboard>
//
// Set the webhook URL in Dodo dashboard to:
//   https://<your-project-ref>.supabase.co/functions/v1/dodo-webhook

const TIER_PRODUCTS_LIVE: Record<string, string> = {
  pdt_0Nh6OphSyHzzgiwtDNXUd: "pro",
  pdt_0Nh6OpiYy9IcaYpv9SpHg: "growth",
  pdt_0Nh6OpjbxfWn2vbRmC3Zx: "agency",
};

const TIER_PRODUCTS_TEST: Record<string, string> = {
  pdt_0Nh6OpZX9OL8Tr2EEtuyL: "pro",
  pdt_0Nh6OpalUMHWyz7aU2BYw: "growth",
  pdt_0Nh6Opey6dJMvNLrnSeeT: "agency",
};

function tierForProductId(productId: string | null): string | null {
  if (!productId) return null;
  const isLive = Deno.env.get("DODO_PAYMENTS_ENV") === "live_mode";
  const map = isLive ? TIER_PRODUCTS_LIVE : TIER_PRODUCTS_TEST;
  return map[productId] ?? null;
}

// Standard Webhooks signature verification (HMAC-SHA256)
async function verifySignature(
  rawBody: string,
  headers: Headers,
  secret: string,
): Promise<boolean> {
  const webhookId        = headers.get("webhook-id")        ?? "";
  const webhookTimestamp = headers.get("webhook-timestamp")  ?? "";
  const webhookSig       = headers.get("webhook-signature")  ?? "";

  if (!webhookId || !webhookTimestamp || !webhookSig) return false;

  // Reject webhooks older than 5 minutes
  const ts = Number(webhookTimestamp);
  if (Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const signedPayload = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sigBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));

  // webhook-signature may contain multiple "v1,<sig>" entries
  const sigs = webhookSig.split(" ").map((s) => s.replace(/^v\d+,/, ""));
  return sigs.some((sig) => sig === expected);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const secret = Deno.env.get("DODO_WEBHOOK_SECRET");
  if (!secret) {
    return json({ error: "Webhook not configured." }, 503);
  }

  const rawBody = await req.text();

  const verified = await verifySignature(rawBody, req.headers, secret);
  if (!verified) {
    return json({ error: "Invalid webhook signature." }, 400);
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  // Build Supabase admin client using service role (bypasses RLS)
  const supabaseUrl  = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const data   = (event.data ?? {}) as Record<string, unknown>;
  const meta   = (data.metadata ?? {}) as Record<string, string>;
  const userId = meta.user_id ?? null;
  const subId  = (data.subscription_id ?? data.id ?? null) as string | null;
  const now    = new Date().toISOString();

  const eventType = event.type as string;

  try {
    switch (eventType) {

      case "payment.succeeded":
      case "subscription.active": {
        const productId = (
          data.product_id ??
          (data.items as Array<Record<string, string>>)?.[0]?.product_id ??
          null
        ) as string | null;
        const tier = meta.tier || tierForProductId(productId);
        if (userId && tier) {
          await admin
            .from("user_profiles")
            .update({
              subscription_tier:    tier,
              subscription_status:  "active",
              dodo_subscription_id: subId,
              updated_at:           now,
            })
            .eq("user_id", userId);
        }
        break;
      }

      case "subscription.updated": {
        const productId = (
          data.product_id ??
          (data.items as Array<Record<string, string>>)?.[0]?.product_id ??
          null
        ) as string | null;
        const tier   = meta.tier || tierForProductId(productId);
        const active = data.status === "active" || data.status === "trialing";
        if (subId) {
          await admin
            .from("user_profiles")
            .update({
              subscription_tier:   active && tier ? tier : "free",
              subscription_status: (data.status as string) ?? "unknown",
              updated_at:          now,
            })
            .eq("dodo_subscription_id", subId);
        }
        break;
      }

      case "subscription.cancelled": {
        if (subId) {
          await admin
            .from("user_profiles")
            .update({
              subscription_tier:   "free",
              subscription_status: "canceled",
              updated_at:          now,
            })
            .eq("dodo_subscription_id", subId);
        } else if (userId) {
          await admin
            .from("user_profiles")
            .update({
              subscription_tier:   "free",
              subscription_status: "canceled",
              updated_at:          now,
            })
            .eq("user_id", userId);
        }
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Handler failed.";
    return json({ error: message }, 500);
  }

  return json({ received: true });
});
