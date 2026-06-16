import Link from "next/link";

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
        <div className="pr-engines">
          {[
            { label: "ChatGPT", color: "#10a37f" },
            { label: "Gemini", color: "#4285f4" },
            { label: "Claude", color: "#d97706" },
            { label: "Perplexity", color: "#7c3aed" },
          ].map(({ label, color }) => (
            <span key={label} className="pr-engine-badge">
              <span className="pr-engine-dot" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </section>

      <PricingPlans />

      <section className="pr-faq">
        <h2>Common questions</h2>
        <p className="pr-faq-sub">Everything you need to know before getting started.</p>
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
