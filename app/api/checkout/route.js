import { NextResponse } from "next/server";

import { getStripe, priceIdFor } from "@/lib/stripe";
import { createAdminClient, getUserFromToken, bearerToken } from "@/lib/supabase-server";

// Creates a Stripe Checkout Session for the selected subscription tier and
// returns its hosted URL. The client redirects the user there to pay.
export async function POST(request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Payments are not configured yet." }, { status: 503 });
  }

  // Authenticate the buyer from their Supabase access token.
  const user = await getUserFromToken(bearerToken(request));
  if (!user) {
    return NextResponse.json({ error: "Please sign in to upgrade." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const tierKey = String(body?.tierKey || "");
  const billingCycle = body?.billingCycle === "yearly" ? "yearly" : "monthly";
  const priceId = priceIdFor(tierKey, billingCycle);
  if (!priceId) {
    return NextResponse.json({ error: `No Stripe price configured for "${tierKey}".` }, { status: 400 });
  }

  const origin =
    request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const admin = createAdminClient();

  try {
    // Reuse an existing Stripe customer for this user if we have one.
    let customerId = null;
    if (admin) {
      const { data: profile } = await admin
        .from("user_profiles")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();
      customerId = profile?.stripe_customer_id || null;
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      if (admin) {
        await admin
          .from("user_profiles")
          .update({ stripe_customer_id: customerId })
          .eq("user_id", user.id);
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { metadata: { user_id: user.id, tier: tierKey, billing_cycle: billingCycle } },
      metadata: { user_id: user.id, tier: tierKey, billing_cycle: billingCycle },
      success_url: `${origin}/dashboard?welcome=${tierKey}`,
      cancel_url: `${origin}/pricing?canceled=1`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error?.message || "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
