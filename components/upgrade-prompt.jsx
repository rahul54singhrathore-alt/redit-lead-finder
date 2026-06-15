"use client";

import Link from "next/link";
import { ArrowRightIcon, LockIcon, SparklesIcon } from "lucide-react";

import { FEATURE_LABELS, firstTierWithFeature } from "@/lib/subscription";

// Benefit bullets derived from the feature key — 3 concrete things users get.
const FEATURE_BENEFITS = {
  seoBriefs: [
    "Generate AI-optimized SEO briefs in seconds",
    "Get keyword and topic recommendations tuned for GEO",
    "Export briefs as a PDF or share with your team",
  ],
  citationFinder: [
    "See exactly where AI engines cite your brand",
    "Discover citation gaps vs. your competitors",
    "Track citation growth over time",
  ],
  competitorTracker: [
    "Benchmark your visibility against up to 20 competitors",
    "See side-by-side GEO scores across all AI engines",
    "Get alerts when competitors gain or lose ground",
  ],
  recommendedFixes: [
    "Receive concrete, prioritized GEO improvement actions",
    "Fixes are tailored to each AI engine's citation signals",
    "See estimated score lift for every recommendation",
  ],
  emailAlerts: [
    "Get notified the moment your visibility changes",
    "Daily or weekly digest — your cadence, your choice",
    "Slack integration for instant team awareness",
  ],
  whiteLabelReports: [
    "Brand PDF reports with your own logo and colors",
    "Share polished reports directly with clients",
    "Automated scheduling — reports send themselves",
  ],
  apiAccess: [
    "Programmatic access to all visibility data",
    "Integrate GEO scores into your own dashboards",
    "Webhook support for real-time score events",
  ],
};

// Full lock card shown in place of a gated feature. Pass the feature key so the
// copy and the "Upgrade to <tier>" target are derived from the tier config.
export function FeatureLock({ feature, title, description }) {
  const tier = firstTierWithFeature(feature);
  const label = FEATURE_LABELS[feature] || "this feature";
  const benefits = FEATURE_BENEFITS[feature] || [
    "Unlock advanced AI visibility insights",
    "Access premium reporting and tracking tools",
    "Stay ahead of the competition with GEO data",
  ];

  return (
    <section className="feature-lock-card">
      <div className="feature-lock-icon-wrap">
        <div className="feature-lock-icon-circle">
          <LockIcon />
        </div>
      </div>
      <h2 className="feature-lock-headline">Unlock {title || label}</h2>
      <p className="feature-lock-tier">
        Available on <strong>{tier?.name || "Pro"}</strong> and above
      </p>
      <ul className="feature-lock-benefits">
        {benefits.map((b, i) => (
          <li key={i}>
            <span className="feature-lock-check">
              <SparklesIcon />
            </span>
            {b}
          </li>
        ))}
      </ul>
      {description && (
        <p className="feature-lock-description">{description}</p>
      )}
      <div className="feature-lock-actions">
        <Link className="primary-button feature-lock-cta" href="/pricing">
          Upgrade to {tier?.name || "Pro"}
          <ArrowRightIcon />
        </Link>
        <Link className="feature-lock-secondary" href="/pricing">
          See all plans
        </Link>
      </div>
    </section>
  );
}

// Compact inline banner shown when a usage limit (e.g. brand count) is reached.
export function LimitNotice({ title, description, ctaTier }) {
  return (
    <div className="limit-notice">
      <span className="limit-notice-icon">
        <SparklesIcon />
      </span>
      <div className="limit-notice-copy">
        <strong>{title}</strong>
        {description && <span>{description}</span>}
      </div>
      <Link className="primary-button limit-notice-button" href="/pricing">
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
