import DodoPayments from "dodopayments";

// Server-side Dodo Payments client. Returns null if not configured.
export function getDodo() {
  const key = process.env.DODO_PAYMENTS_API_KEY;
  if (!key) return null;
  const env = process.env.DODO_PAYMENTS_ENV === "live_mode" ? "live_mode" : "test_mode";
  return new DodoPayments({ bearerToken: key, environment: env });
}

// Maps tiers + billing cycle to Dodo Payments Product IDs.
// Set these in your Dodo Payments dashboard under Products.
export const TIER_PRODUCTS = {
  pro: {
    monthly: process.env.DODO_PRODUCT_PRO,
    yearly:  process.env.DODO_PRODUCT_PRO_YEARLY,
  },
  growth: {
    monthly: process.env.DODO_PRODUCT_GROWTH,
    yearly:  process.env.DODO_PRODUCT_GROWTH_YEARLY,
  },
  agency: {
    monthly: process.env.DODO_PRODUCT_AGENCY,
    yearly:  process.env.DODO_PRODUCT_AGENCY_YEARLY,
  },
};

// Returns the Product ID for a tier + billing cycle, falling back to monthly.
export function productIdFor(tier, cycle = "monthly") {
  const products = TIER_PRODUCTS[tier];
  if (!products) return null;
  if (cycle === "yearly" && products.yearly) return products.yearly;
  return products.monthly || null;
}

// Reverse lookup: given a Dodo Product ID, find which tier it unlocks.
export function tierForProductId(productId) {
  if (!productId) return null;
  for (const [tier, products] of Object.entries(TIER_PRODUCTS)) {
    if (products.monthly === productId || products.yearly === productId) return tier;
  }
  return null;
}

// Verify a Dodo Payments webhook signature using the Standard Webhooks spec.
// Header: webhook-signature contains the signature.
// Sign: HMAC-SHA256 of "<webhook-id>.<webhook-timestamp>.<raw-body>"
export function verifyDodoWebhook(rawBody, headers, secret) {
  if (!secret) return false;
  const { createHmac, timingSafeEqual } = require("crypto");
  const webhookId        = headers["webhook-id"]        || "";
  const webhookTimestamp = headers["webhook-timestamp"]  || "";
  const webhookSig       = headers["webhook-signature"]  || "";

  // Reject stale webhooks (older than 5 minutes)
  const ts = Number(webhookTimestamp);
  if (Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const signedPayload = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("base64");

  // webhook-signature may contain multiple space-separated "v1,<sig>" entries
  const sigs = webhookSig.split(" ").map((s) => s.replace(/^v\d+,/, ""));
  return sigs.some((sig) => {
    try {
      return timingSafeEqual(Buffer.from(sig, "base64"), Buffer.from(expected, "base64"));
    } catch {
      return false;
    }
  });
}
