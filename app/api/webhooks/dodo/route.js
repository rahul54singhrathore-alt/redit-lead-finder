import { NextResponse } from "next/server";

import { verifyDodoWebhook, tierForProductId } from "@/lib/dodo";
import { createAdminClient } from "@/lib/supabase-server";

// Dodo Payments needs the raw body for signature verification.
export const dynamic = "force-dynamic";

async function setTierBySubscriptionId(admin, subscriptionId, fields) {
  if (!admin || !subscriptionId) return;
  await admin
    .from("user_profiles")
    .update(fields)
    .eq("dodo_subscription_id", subscriptionId);
}

async function setTierByUserId(admin, userId, fields) {
  if (!admin || !userId) return;
  await admin.from("user_profiles").update(fields).eq("user_id", userId);
}

// Dodo Payments calls this on subscription / payment lifecycle events.
// This is the authoritative place we grant or revoke a plan.
export async function POST(request) {
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  if (!verifyDodoWebhook(rawBody, headers, webhookSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server not configured for DB writes." }, { status: 503 });
  }

  const data     = event.data || {};
  const meta     = data.metadata || {};
  const userId   = meta.user_id || null;
  const subId    = data.subscription_id || data.id || null;
  const now      = new Date().toISOString();

  try {
    switch (event.type) {

      // Payment or subscription just activated — grant the tier.
      case "payment.succeeded":
      case "subscription.active": {
        const productId = data.product_id || data.items?.[0]?.product_id || null;
        const tier      = meta.tier || tierForProductId(productId) || null;
        if (userId && tier) {
          await setTierByUserId(admin, userId, {
            subscription_tier:   tier,
            subscription_status: "active",
            dodo_subscription_id: subId,
            updated_at:          now,
          });
        }
        break;
      }

      // Plan changed — update tier.
      case "subscription.updated": {
        const productId = data.product_id || data.items?.[0]?.product_id || null;
        const tier      = meta.tier || tierForProductId(productId) || null;
        const active    = data.status === "active" || data.status === "trialing";
        if (subId) {
          await setTierBySubscriptionId(admin, subId, {
            subscription_tier:   active && tier ? tier : "free",
            subscription_status: data.status || "unknown",
            updated_at:          now,
          });
        }
        break;
      }

      // Subscription cancelled — drop back to free.
      case "subscription.cancelled": {
        if (subId) {
          await setTierBySubscriptionId(admin, subId, {
            subscription_tier:   "free",
            subscription_status: "canceled",
            updated_at:          now,
          });
        } else if (userId) {
          await setTierByUserId(admin, userId, {
            subscription_tier:   "free",
            subscription_status: "canceled",
            updated_at:          now,
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
