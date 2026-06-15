import { NextResponse } from "next/server";

import { getDodo } from "@/lib/dodo";
import { createAdminClient, getUserFromToken, bearerToken } from "@/lib/supabase-server";

// Opens the Dodo Payments customer portal so a subscriber can manage,
// update, or cancel their subscription and view invoices.
export async function POST(request) {
  const dodo = getDodo();
  if (!dodo) {
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
    .select("dodo_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.dodo_subscription_id) {
    return NextResponse.json({ error: "No active subscription found." }, { status: 400 });
  }

  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  try {
    // Dodo customer portal: redirect user to manage their subscription.
    const portal = await dodo.customers.customerPortal({
      subscription_id: profile.dodo_subscription_id,
      return_url:      `${origin}/dashboard/settings`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Could not open billing portal." },
      { status: 502 },
    );
  }
}
