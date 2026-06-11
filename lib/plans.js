// Shared plan catalog used by the pricing page and the checkout page.

export const PLANS = [
  {
    name: "Starter",
    tierKey: "free",
    monthlyPrice: 0,
    description: "For testing a single brand and checking where it appears in AI answers.",
    cta: "Start free",
    features: ["1 brand", "25 prompt runs", "Basic GEO audit", "7-day history"],
  },
  {
    name: "Pro",
    tierKey: "pro",
    monthlyPrice: 19,
    description: "For founders and solo operators tracking visibility and citation coverage.",
    cta: "Choose Pro",
    features: [
      "5 brands",
      "100 prompt runs",
      "AI citation finder",
      "Competitor GEO tracker",
      "Email notifications",
      "30-day history",
    ],
  },
  {
    name: "Growth",
    tierKey: "growth",
    monthlyPrice: 49,
    badge: "POPULAR",
    featured: true,
    description: "For growing teams improving content and measuring AI visibility at scale.",
    cta: "Choose Growth",
    features: [
      "20 brands",
      "Daily GEO audits",
      "AEO question finder",
      "Content optimizer",
      "Team members (3)",
      "6-month history",
    ],
  },
  {
    name: "Agency",
    tierKey: "agency",
    monthlyPrice: 99,
    description: "For agencies managing visibility reporting across multiple clients.",
    cta: "Choose Agency",
    features: [
      "Unlimited brands",
      "White-label reports",
      "Exportable audits",
      "API access",
      "Unlimited team members",
      "Priority support",
    ],
  },
];

// Pricing breakdown for a plan + billing cycle (yearly = 20% off).
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
    const perMonth = Math.round(plan.monthlyPrice * 0.8);
    const total = Math.round(plan.monthlyPrice * 12 * 0.8);
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
