import Link from "next/link";

import { PricingPlans } from "@/components/pricing-plans";
import { SiteNavbar } from "@/components/site-navbar";

export const metadata = {
  // Root layout applies the "%s | Oras" template, so the title here omits the
  // brand suffix to avoid duplicating it.
  title: "Pricing — AI Visibility & GEO Tracking Plans",
  description:
    "Simple plans for tracking your brand's visibility across ChatGPT, Gemini, Claude, and Perplexity. Start free — upgrade as you grow.",
  alternates: { canonical: "https://www.tryoras.com/pricing" },
  openGraph: {
    title: "Pricing — AI Visibility & GEO Tracking Plans | Oras",
    description:
      "Simple plans for tracking your brand's visibility across ChatGPT, Gemini, Claude, and Perplexity. Start free — upgrade as you grow.",
    url: "https://www.tryoras.com/pricing",
  },
};

const serviceFeatures = [
  "Daily visibility checks",
  "Mentions delivered to Slack/Email",
  "AI-generated content suggestions",
  "Weekly GEO report",
];

export default async function PricingPage({ searchParams }) {
  const params = await searchParams;
  const fromOnboarding = params?.welcome === "1";

  return (
    <main className="pricing-page autosend-page">
      <SiteNavbar />

      {fromOnboarding ? (
        <div className="pricing-welcome">
          🎉 Your workspace is ready. Pick a plan to unlock more brands and prompt
          coverage — or <Link href="/dashboard">continue on the free plan</Link>.
        </div>
      ) : null}

      <section className="pricing-hero">
        <p className="eyebrow">Subscription plans</p>
        <h1>Choose the AI visibility plan that fits your workflow.</h1>
        <p>
          Start free, upgrade when you need more brands, stronger prompt coverage, team access, or a managed visibility service.
        </p>
      </section>

      <PricingPlans />

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
