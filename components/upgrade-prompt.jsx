"use client";

import Link from "next/link";
import { ArrowRightIcon, LockIcon, SparklesIcon } from "lucide-react";

import { FEATURE_LABELS, firstTierWithFeature } from "@/lib/subscription";

// Full lock card shown in place of a gated feature. Pass the feature key so the
// copy and the "Upgrade to <tier>" target are derived from the tier config.
export function FeatureLock({ feature, title, description }) {
  const tier = firstTierWithFeature(feature);
  const label = FEATURE_LABELS[feature] || "this feature";

  return (
    <section className="dashboard-card seo-brief-lock">
      <div className="card-header">
        <div>
          <h2>{title || label}</h2>
          <p className="card-supporting-copy">
            Available on {tier?.name || "Pro"} and above.
          </p>
        </div>
        <span className="pricing-badge">Locked</span>
      </div>
      <div className="seo-brief-locked">
        <LockIcon />
        <div>
          <strong>Upgrade to unlock {label.toLowerCase()}</strong>
          <p>{description}</p>
        </div>
        <Link className="primary-button seo-brief-upgrade" href="/pricing">
          {tier ? `Get ${tier.name}` : "View plans"}
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}

// Compact inline banner shown when a usage limit (e.g. brand count) is reached.
export function LimitNotice({ title, description, ctaTier }) {
  return (
    <div className="upgrade-notice">
      <span className="upgrade-notice-icon">
        <SparklesIcon />
      </span>
      <div className="upgrade-notice-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <Link className="primary-button upgrade-notice-button" href="/pricing">
        {ctaTier ? `Upgrade to ${ctaTier}` : "Upgrade"}
        <ArrowRightIcon />
      </Link>
    </div>
  );
}

// A small "Pro" / "Growth" style chip indicating current plan + usage.
export function UsageMeter({ label, used, limit }) {
  const isUnlimited = limit === Infinity;
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const atLimit = !isUnlimited && used >= limit;

  return (
    <div className="usage-meter">
      <div className="usage-meter-head">
        <span>{label}</span>
        <strong className={atLimit ? "usage-meter-full" : ""}>
          {used} / {isUnlimited ? "∞" : limit}
        </strong>
      </div>
      {!isUnlimited ? (
        <div className="usage-meter-track">
          <div
            className={`usage-meter-fill${atLimit ? " usage-meter-fill-full" : ""}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
