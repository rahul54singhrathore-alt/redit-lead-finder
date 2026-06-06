import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "For testing a single brand and checking where it appears in AI answers.",
    features: [
      "1 brand",
      "25 prompt runs",
      "Basic GEO audit",
      "7-day history",
    ],
    cta: "Start free",
    href: "/signin",
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "/month",
    description: "For founders and solo operators tracking visibility and citation coverage.",
    features: [
      "5 brands",
      "100 prompt runs",
      "AI citation finder",
      "Competitor GEO tracker",
      "Full SEO brief generator",
      "Email notifications",
      "30-day history",
    ],
    cta: "Choose Pro",
    href: "/signin",
  },
  {
    name: "Growth",
    price: "$49",
    cadence: "/month",
    badge: "Popular",
    description: "For growing teams improving content and measuring AI visibility at scale.",
    features: [
      "20 brands",
      "Daily GEO audits",
      "AEO question finder",
      "Full SEO brief generator",
      "Content optimizer",
      "Team members (3)",
      "6-month history",
    ],
    cta: "Choose Growth",
    href: "/signin",
    featured: true,
  },
  {
    name: "Agency",
    price: "$99",
    cadence: "/month",
    description: "For agencies managing visibility reporting across multiple clients.",
    features: [
      "Unlimited brands",
      "Unlimited team members",
      "White-label reports",
      "Full SEO brief generator",
      "Exportable audits",
      "API access",
      "Priority support",
    ],
    cta: "Choose Agency",
    href: "/signin",
  },
];

const serviceFeatures = [
  "Daily visibility checks",
  "Mentions delivered to Slack/Email",
  "AI-generated content suggestions",
  "Weekly GEO report",
];

export default function PricingPage() {
  return (
    <main className="pricing-page">
      <header className="site-header">
        <Link className="brand" href="/">
          <img src="/logo.png" alt="" />
          Rankora
        </Link>
        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/pricing">Pricing</Link>
          <Link className="nav-cta" href="/signin">Sign In</Link>
        </nav>
      </header>

      <section className="pricing-hero">
        <p className="eyebrow">Subscription plans</p>
        <h1>Choose the AI visibility plan that fits your workflow.</h1>
        <p>
          Start free, upgrade when you need more brands, stronger prompt coverage, team access, or a managed visibility service.
        </p>
      </section>

      <section className="pricing-grid" aria-label="Software subscription plans">
        {plans.map((plan) => (
          <article key={plan.name} className={`pricing-card ${plan.featured ? "pricing-card-featured" : ""}`}>
            <div className="pricing-card-header">
              <div>
                <h2>{plan.name}</h2>
                <p>{plan.description}</p>
              </div>
              {plan.badge ? <span className="pricing-badge">{plan.badge}</span> : null}
            </div>
            <div className="pricing-price">
              <strong>{plan.price}</strong>
              {plan.cadence ? <span>{plan.cadence}</span> : null}
            </div>
            <ul className="pricing-features">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link className={plan.featured ? "primary-button pricing-button" : "secondary-button pricing-button"} href={plan.href}>
              {plan.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="service-plan">
        <div>
          <span className="pricing-badge">Done-For-You</span>
          <h2>Done-For-You Visibility Service</h2>
          <p>Instead of only software, get a managed AI visibility workflow with audits, tracking, and content recommendations delivered every week.</p>
        </div>
        <div className="service-price">
          <strong>$299</strong>
          <span>/month</span>
        </div>
        <ul className="pricing-features service-features">
          {serviceFeatures.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <Link className="primary-button pricing-button" href="/signin">Apply for service</Link>
      </section>
    </main>
  );
}
