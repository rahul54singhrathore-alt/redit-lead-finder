// Shared plan catalog used by the pricing page and the checkout page.

export const PLANS = [
  {
    name: "Pro",
    tierKey: "pro",
    monthlyPrice: 89,
    annualMonthlyPrice: 74,
    description: "For solopreneurs & small sites getting started with AI search.",
    cta: "Start now",
    features: [
      "10 SEO articles per month",
      "50 tracked prompts",
      "4,000 AI search responses / mo",
      "One response + one prompt answered by one engine",
      "1 website",
      "1 team seat",
      "3–4 engines · 2 + 1 + 0",
      "Weekly full-refresh across 3 engines",
      "Google Search Console integration",
      "GKE integration",
      "WebPilot CMS publishing",
      "AI images",
      "Email support",
    ],
  },
  {
    name: "Business",
    tierKey: "growth",
    monthlyPrice: 239,
    annualMonthlyPrice: 199,
    badge: "BEST VALUE",
    featured: true,
    description: "For growing brands — multi-engine tracking, content creation, and publishing. One pipeline.",
    cta: "Start now",
    features: [
      "Everything in Pro, plus",
      "50 SEO articles per month",
      "160 tracked prompts",
      "16,000 AI search responses / mo",
      "One response + one prompt answered by one engine once",
      "5 websites",
      "3 team seats",
      "All 5 engines · 3 + 1 + 1",
      "Weekly full-refresh across all 5 engines",
      "Ranking coverage for active prompts",
      "Trackpilot brands",
      "Citation & mention analysis",
      "Priority confidence checks (up to 3 series)",
      "AI images",
    ],
  },
  {
    name: "Scale",
    tierKey: "agency",
    monthlyPrice: 739,
    annualMonthlyPrice: 616,
    description: "For teams — full autopilot, unlimited tasks.",
    cta: "Start now",
    features: [
      "Everything in Business, plus",
      "150 SEO articles per month",
      "400 tracked prompts",
      "40,000 AI search responses / mo",
      "All 7 engines · 4 + 1 + 1 + 1",
      "10 websites",
      "Unlimited team seats",
      "Daily visibility updates across all 7 engines",
      "Expanded confidence checks (up to 3 series)",
      "20 competitor brands",
      "Scheduled reports (custom cadence)",
      "Full autopilot: write + publish + measure",
      "Citation & mention analysis (all series)",
      "Priority queue",
      "Scheduled reports & quality support",
    ],
  },
];

export function getPlan(tierKey) {
  return PLANS.find((plan) => plan.tierKey === tierKey) || null;
}

// Pricing breakdown for a plan + billing cycle.
export function priceView(plan, cycle) {
  if (!plan || plan.monthlyPrice === 0) {
    return {
      display: "Free",
      suffix: "",
      billed: "Free forever — no card required",
      perMonth: 0,
      total: 0,
    };
  }
  if (cycle === "yearly") {
    const perMonth = plan.annualMonthlyPrice ?? Math.round(plan.monthlyPrice * 0.8);
    const total = perMonth * 12;
    return {
      display: `$${perMonth}`,
      suffix: "/mo",
      billed: `Billed yearly · $${total}/yr`,
      perMonth,
      total,
    };
  }
  return {
    display: `$${plan.monthlyPrice}`,
    suffix: "/mo",
    billed: "Billed monthly",
    perMonth: plan.monthlyPrice,
    total: plan.monthlyPrice,
  };
}
