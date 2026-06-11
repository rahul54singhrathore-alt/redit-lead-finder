"use client";

import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";

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
