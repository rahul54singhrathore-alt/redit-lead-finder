"use client";

import Link from "next/link";
import { ArrowRightIcon, CheckCircle2Icon, LockIcon } from "lucide-react";

import { firstTierWithFeature, hasFeature } from "@/lib/subscription";

// Actionable GEO fixes shown to paying users. For free users the list is
// blurred behind a lock (the classic "problem visible, solution paywalled"
// conversion pattern).
const FIXES = [
  {
    title: "Add comparison & alternatives pages",
    detail: "AI engines cite comparison pages heavily. Create “X vs Y” and “best alternatives” pages.",
  },
  {
    title: "Build Reddit & Quora citations",
    detail: "Answer relevant threads so AI has high-trust sources mentioning your brand.",
  },
  {
    title: "Add FAQ schema to key pages",
    detail: "Structured FAQs make your answers easy for LLMs to extract and quote.",
  },
  {
    title: "Create author & entity pages",
    detail: "Strong entity coverage improves how confidently AI associates topics with you.",
  },
];

export function RecommendedFixes({ subscriptionTier = "free", brand = "your brand" }) {
  const unlocked = hasFeature(subscriptionTier, "recommendedFixes");
  const tier = firstTierWithFeature("recommendedFixes");

  return (
    <section className="dashboard-card fixes-card">
      <div className="card-header">
        <div>
          <h2>Recommended GEO fixes</h2>
          <p className="card-supporting-copy">
            Prioritized actions to get {brand} mentioned more often in AI answers.
          </p>
        </div>
        <span className="pricing-badge">{unlocked ? "Pro" : "Locked"}</span>
      </div>

      <div className={`fixes-list${unlocked ? "" : " fixes-list-blurred"}`} aria-hidden={!unlocked}>
        {FIXES.map((fix) => (
          <div key={fix.title} className="fix-item">
            <CheckCircle2Icon className="fix-item-icon" />
            <div>
              <strong>{fix.title}</strong>
              <span>{fix.detail}</span>
            </div>
          </div>
        ))}
      </div>

      {!unlocked ? (
        <div className="fixes-lock-overlay">
          <LockIcon />
          <strong>Unlock your recommended fixes</strong>
          <p>See exactly why competitors rank ahead and the steps to close the gap.</p>
          <Link href="/pricing" className="primary-button">
            Get {tier?.name || "Pro"} <ArrowRightIcon className="button-icon" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
