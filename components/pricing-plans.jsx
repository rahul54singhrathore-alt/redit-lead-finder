"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";

import { PlanButton } from "@/components/plan-button";
import { PLANS, priceView } from "@/lib/plans";

export function PricingPlans() {
  const [cycle, setCycle] = useState("monthly");

  return (
    <div className="pr-plans">
      <div className="pr-cycle" role="tablist" aria-label="Billing cycle">
        <button
          type="button"
          role="tab"
          aria-selected={cycle === "monthly"}
          className={`pr-cycle-btn${cycle === "monthly" ? " pr-cycle-active" : ""}`}
          onClick={() => setCycle("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={cycle === "yearly"}
          className={`pr-cycle-btn${cycle === "yearly" ? " pr-cycle-active" : ""}`}
          onClick={() => setCycle("yearly")}
        >
          Yearly
          <span className="pr-cycle-save">Save 20%</span>
        </button>
      </div>

      <div className="pr-grid">
        {PLANS.map((plan) => {
          const view = priceView(plan, cycle);
          return (
            <article key={plan.name} className={`pr-card${plan.featured ? " pr-card-featured" : ""}`}>
              {plan.badge ? <span className="pr-card-badge">{plan.badge}</span> : null}

              <div className="pr-card-head">
                <h2>{plan.name}</h2>
                <p>{plan.description}</p>
              </div>

              <div className="pr-card-price">
                <strong>{view.display}</strong>
                {view.suffix ? <span>{view.suffix}</span> : null}
              </div>
              <p className="pr-card-billed">{view.billed}</p>

              <PlanButton
                tierKey={plan.tierKey}
                billingCycle={cycle}
                label={plan.cta}
                className={`pr-card-cta${plan.featured ? " pr-card-cta-featured" : ""}`}
              />

              <ul className="pr-card-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <p className="pr-plans-foot">
        All plans include access to ChatGPT, Gemini, Claude, and Perplexity checks.
      </p>
    </div>
  );
}
