import { NextResponse } from "next/server";

import { getStripe, tierForPriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-server";

// Stripe needs the raw, unparsed body to verify the signature.
export const dynamic = "force-dynamic";

async function setTierByCustomer(admin, customerId, fields) {
  if (!admin || !customerId) return;
  await admin.from("user_profiles").update(fields).eq("stripe_customer_id", customerId);
}

// Stripe calls this endpoint on payment/subscription events. This is the
// authoritative place we grant or revoke a plan — never trust the client.
export async function POST(request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: `Invalid signature: ${error.message}` }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server not configured for DB writes." }, { status: 503 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.user_id;
        const tier = session.metadata?.tier;
        if (userId && tier) {
          await admin
            .from("user_profiles")
            .update({
              subscription_tier: tier,
              subscription_status: "active",
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const priceId = sub.items?.data?.[0]?.price?.id;
        const tier = tierForPriceId(priceId);
        const active = sub.status === "active" || sub.status === "trialing";
        await setTierByCustomer(admin, sub.customer, {
          subscription_tier: active && tier ? tier : "free",
          subscription_status: sub.status,
          stripe_subscription_id: sub.id,
          updated_at: new Date().toISOString(),
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await setTierByCustomer(admin, sub.customer, {
          subscription_tier: "free",
          subscription_status: "canceled",
          updated_at: new Date().toISOString(),
        });
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
