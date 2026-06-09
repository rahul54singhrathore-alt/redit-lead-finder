import { NextResponse } from "next/server";

import { getStripe } from "@/lib/stripe";
import { createAdminClient, getUserFromToken, bearerToken } from "@/lib/supabase-server";

// Opens the Stripe Customer Portal so a subscriber can update, downgrade, or
// cancel their plan and view invoices.
export async function POST(request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Payments are not configured yet." }, { status: 503 });
  }

  const user = await getUserFromToken(bearerToken(request));
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server not configured." }, { status: 503 });
  }

  const { data: profile } = await admin
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No active subscription found." }, { status: 400 });
  }

  const origin =
    request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/dashboard/settings`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Could not open billing portal." }, { status: 502 });
  }
}
