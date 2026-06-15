import { NextResponse } from "next/server";

import { getDodo, productIdFor } from "@/lib/dodo";
import { getUserFromToken, bearerToken } from "@/lib/supabase-server";

// Creates a Dodo Payments checkout session for the selected subscription tier
// and returns its hosted checkout URL. The client redirects the user there.
export async function POST(request) {
  const dodo = getDodo();
  if (!dodo) {
    return NextResponse.json({ error: "Payments are not configured yet." }, { status: 503 });
  }

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

  const tierKey      = String(body?.tierKey || "");
  const billingCycle = body?.billingCycle === "yearly" ? "yearly" : "monthly";
  const productId    = productIdFor(tierKey, billingCycle);

  if (!productId) {
    return NextResponse.json(
      { error: `No Dodo product configured for "${tierKey}".` },
      { status: 400 },
    );
  }

  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  try {
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer:     { email: user.email },
      return_url:   `${origin}/dashboard?welcome=${tierKey}`,
      metadata: {
        user_id:       user.id,
        tier:          tierKey,
        billing_cycle: billingCycle,
      },
    });

    return NextResponse.json({ url: session.checkout_url });
  } catch (error) {
    const message = error?.message || "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
