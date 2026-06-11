// Single source of truth for subscription tiers, limits, and feature gating.
// The `subscription_tier` column on user_profiles stores one of these keys.

export const TIERS = {
  free: {
    key: "free",
    name: "Starter",
    price: "Free",
    order: 0,
    limits: {
      brands: 1,
      promptRuns: 25,
      historyDays: 7,
      engines: ["ChatGPT"],
    },
    features: {
      seoBriefs: false,
      citationFinder: false,
      competitorTracker: false,
      recommendedFixes: false,
      emailAlerts: false,
      whiteLabelReports: false,
      apiAccess: false,
    },
  },
  pro: {
    key: "pro",
    name: "Pro",
    price: "$19",
    order: 1,
    limits: {
      brands: 5,
      promptRuns: 100,
      historyDays: 30,
      engines: ["ChatGPT", "Gemini", "Claude"],
    },
    features: {
      seoBriefs: true,
      citationFinder: true,
      competitorTracker: true,
      recommendedFixes: true,
      emailAlerts: true,
      whiteLabelReports: false,
      apiAccess: false,
    },
  },
  growth: {
    key: "growth",
    name: "Growth",
    price: "$49",
    order: 2,
    limits: {
      brands: 20,
      promptRuns: 500,
      historyDays: 180,
      engines: ["ChatGPT", "Gemini", "Claude", "Perplexity"],
    },
    features: {
      seoBriefs: true,
      citationFinder: true,
      competitorTracker: true,
      recommendedFixes: true,
      emailAlerts: true,
      whiteLabelReports: false,
      apiAccess: false,
    },
  },
  agency: {
    key: "agency",
    name: "Agency",
    price: "$99",
    order: 3,
    limits: {
      brands: Infinity,
      promptRuns: Infinity,
      historyDays: 365,
      engines: ["ChatGPT", "Gemini", "Claude", "Perplexity"],
    },
    features: {
      seoBriefs: true,
      citationFinder: true,
      competitorTracker: true,
      recommendedFixes: true,
      emailAlerts: true,
      whiteLabelReports: true,
      apiAccess: true,
    },
  },
};

export const TIER_ORDER = ["free", "pro", "growth", "agency"];


export function getTier(tierKey) {
  return TIERS[tierKey] || TIERS.free;
}

export function getLimits(tierKey) {
  return getTier(tierKey).limits;
}

// Returns true when the tier includes the given feature flag.
export function hasFeature(tierKey, feature) {
  return Boolean(getTier(tierKey).features?.[feature]);
}

// Returns true while the user is still under their brand allowance.
export function canAddBrand(tierKey, currentCount) {
  return currentCount < getLimits(tierKey).brands;
}

// The cheapest tier that unlocks a given feature (for "Upgrade to X" copy).
export function firstTierWithFeature(feature) {
  for (const key of TIER_ORDER) {
    if (hasFeature(key, feature)) return getTier(key);
  }
  return null;
}

// The next tier up from the current one, or null if already at the top.
export function nextTier(tierKey) {
  const current = getTier(tierKey).order;
  const nextKey = TIER_ORDER.find((key) => getTier(key).order === current + 1);
  return nextKey ? getTier(nextKey) : null;
}

