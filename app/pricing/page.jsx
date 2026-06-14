import Link from "next/link";
import { CheckIcon } from "lucide-react";

import { PricingPlans } from "@/components/pricing-plans";
import { SiteNavbar } from "@/components/site-navbar";

export const metadata = {
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
  "Weekly AI visibility audit across all 4 engines",
  "AI-generated content and citation recommendations",
  "Competitor GEO tracking and benchmarking",
  "Dedicated account manager",
];

export default async function PricingPage({ searchParams }) {
  const params = await searchParams;
  const fromOnboarding = params?.welcome === "1";

  return (
    <main className="pr-page">
      <SiteNavbar />

      {fromOnboarding ? (
        <div className="pr-welcome">
          Your workspace is ready. Pick a plan to unlock more brands and prompt
          coverage — or <Link href="/dashboard">continue on the free plan</Link>.
        </div>
      ) : null}

      <section className="pr-hero">
        <p className="pr-eyebrow">Pricing</p>
        <h1>Simple, transparent pricing</h1>
        <p>Start free. Upgrade when you need more coverage, brands, or team access.</p>
      </section>

      <PricingPlans />

      <section className="pr-service">
        <div className="pr-service-inner">
          <div className="pr-service-left">
            <span className="pr-service-label">Done-For-You</span>
            <h2>Managed Visibility Service</h2>
            <p>
              Skip the software — get a fully managed AI visibility workflow with weekly audits,
              content recommendations, and competitor tracking delivered to your inbox.
            </p>
            <ul className="pr-service-features">
              {serviceFeatures.map((f) => (
                <li key={f}>
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
            <Link className="pr-service-cta" href="/signin">Apply for service →</Link>
          </div>
          <div className="pr-service-right">
            <div className="pr-service-price">
              <strong>$299</strong>
              <span>/month</span>
            </div>
            <p className="pr-service-note">Billed monthly · cancel anytime</p>
          </div>
        </div>
      </section>

      <section className="pr-faq">
        <h2>Common questions</h2>
        <div className="pr-faq-grid">
          <div className="pr-faq-item">
            <h3>Do I need a credit card to start?</h3>
            <p>No. The free plan requires no payment details — just sign up and go.</p>
          </div>
          <div className="pr-faq-item">
            <h3>What counts as a prompt run?</h3>
            <p>One prompt run is a single AI query checked across all 4 engines (ChatGPT, Gemini, Claude, Perplexity).</p>
          </div>
          <div className="pr-faq-item">
            <h3>Can I cancel anytime?</h3>
            <p>Yes. Cancel from your billing portal at any time — no questions asked.</p>
          </div>
          <div className="pr-faq-item">
            <h3>What happens when I hit my limit?</h3>
            <p>Checks pause until your next billing cycle. You can upgrade at any time to increase your quota.</p>
          </div>
        </div>
      </section>

      <footer className="pr-footer">
        Prices in USD · Taxes calculated at checkout ·{" "}
        <Link href="/dashboard">Back to dashboard</Link>
      </footer>
    </main>
  );
}
