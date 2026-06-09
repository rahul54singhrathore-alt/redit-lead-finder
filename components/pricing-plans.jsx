"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";

import { PlanButton } from "@/components/plan-button";
import { PLANS, priceView } from "@/lib/plans";

export function PricingPlans() {
  const [cycle, setCycle] = useState("monthly");

  return (
    <>
      <div className="pp-toggle" role="tablist" aria-label="Billing cycle">
        <button
          type="button"
          role="tab"
          aria-selected={cycle === "monthly"}
          className={`pp-toggle-btn${cycle === "monthly" ? " pp-toggle-active" : ""}`}
          onClick={() => setCycle("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={cycle === "yearly"}
          className={`pp-toggle-btn${cycle === "yearly" ? " pp-toggle-active" : ""}`}
          onClick={() => setCycle("yearly")}
        >
          Yearly <span className="pp-save">-20%</span>
        </button>
      </div>

      <section className="pp-grid" aria-label="Subscription plans">
        {PLANS.map((plan) => {
          const view = priceView(plan, cycle);
          return (
            <article key={plan.name} className={`pp-card${plan.featured ? " pp-card-featured" : ""}`}>
              <div className="pp-card-head">
                <div className="pp-titlerow">
                  <h2>{plan.name}</h2>
                  {plan.badge ? <span className="pp-badge">{plan.badge}</span> : null}
                </div>
                <p className="pp-desc">{plan.description}</p>
              </div>

              <div className="pp-price">
                <strong>{view.display}</strong>
                {view.suffix ? <span>{view.suffix}</span> : null}
              </div>
              <p className="pp-billed">{view.billed}</p>

              <PlanButton
                tierKey={plan.tierKey}
                billingCycle={cycle}
                label={plan.cta}
                className={`pp-cta${plan.featured ? " pp-cta-featured" : ""}`}
              />

              <ul className="pp-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <CheckIcon className="pp-check" />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <p className="pp-foot">
        Prices in USD. Taxes calculated at checkout. Cancel anytime from your billing portal.
      </p>
    </>
  );
}
