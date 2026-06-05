import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "For testing a small Reddit lead workflow.",
    features: [
      "3 keywords",
      "10 alerts/day",
      "Email notifications",
      "7-day history",
    ],
    cta: "Start free",
    href: "/signin",
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "/month",
    description: "For founders and solo operators tracking active demand.",
    features: [
      "50 keywords",
      "Unlimited alerts",
      "AI intent scoring",
      "AI reply generation",
      "Email + Slack notifications",
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
    description: "For growing teams monitoring more markets and competitors.",
    features: [
      "250 keywords",
      "Competitor tracking",
      "Reddit + X monitoring",
      "Google Sheets export",
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
    description: "For agencies managing lead monitoring for multiple clients.",
    features: [
      "Unlimited keywords",
      "Unlimited team members",
      "White-label reports",
      "Notion, CRM, Zapier integrations",
      "API access",
      "Priority support",
    ],
    cta: "Choose Agency",
    href: "/signin",
  },
];

const serviceFeatures = [
  "Daily qualified leads",
  "Leads delivered to Slack/Email",
  "AI-generated outreach suggestions",
  "Weekly opportunity report",
];

export default function PricingPage() {
  return (
    <main className="pricing-page">
      <header className="site-header">
        <Link className="brand" href="/">
          <img src="/logo.svg" alt="" />
          Lead Finder
        </Link>
        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/pricing">Pricing</Link>
          <Link className="nav-cta" href="/signin">Sign In</Link>
        </nav>
      </header>

      <section className="pricing-hero">
        <p className="eyebrow">Subscription plans</p>
        <h1>Choose the Reddit lead engine that fits your pipeline.</h1>
        <p>
          Start free, upgrade when you need more keywords, stronger automation, team access, or a fully managed lead service.
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
          <h2>Done-For-You Lead Service</h2>
          <p>Instead of only software, get a managed lead workflow with qualified opportunities delivered every day.</p>
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
