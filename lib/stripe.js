import Stripe from "stripe";

// Server-side Stripe client. Returns null if not configured so routes can
// respond with a clear "not set up" error instead of crashing.
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

// Maps tiers + billing cycle to Stripe Price IDs (set in the dashboard).
// Yearly is optional — falls back to the monthly price if not configured.
export const TIER_PRICES = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  },
  growth: {
    monthly: process.env.STRIPE_PRICE_GROWTH,
    yearly: process.env.STRIPE_PRICE_GROWTH_YEARLY,
  },
  agency: {
    monthly: process.env.STRIPE_PRICE_AGENCY,
    yearly: process.env.STRIPE_PRICE_AGENCY_YEARLY,
  },
};

// Resolves the Price ID for a tier + cycle, falling back to monthly.
export function priceIdFor(tier, cycle = "monthly") {
  const prices = TIER_PRICES[tier];
  if (!prices) return null;
  if (cycle === "yearly" && prices.yearly) return prices.yearly;
  return prices.monthly || null;
}

// Reverse lookup: given a Stripe Price ID, find which tier it unlocks.
export function tierForPriceId(priceId) {
  if (!priceId) return null;
  for (const [tier, prices] of Object.entries(TIER_PRICES)) {
    if (prices.monthly === priceId || prices.yearly === priceId) return tier;
  }
  return null;
}
