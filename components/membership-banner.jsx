"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckCircle2Icon, CrownIcon, SparklesIcon, XIcon } from "lucide-react";

import { getTier, getLimits, nextTier } from "@/lib/subscription";

// Membership strip shown on the dashboard. Celebrates a fresh upgrade
// (?welcome=<tier>), reassures paid members, or nudges free users to upgrade.
export function MembershipBanner({ subscriptionTier = "free" }) {
  const [welcome, setWelcome] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const value = params.get("welcome");
    if (value && getTier(value).key !== "free") {
      setWelcome(getTier(value).key);
      // Clean the URL so a refresh doesn't re-trigger the celebration.
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const tier = getTier(welcome || subscriptionTier);
  const isPaid = tier.key !== "free";
  const limits = getLimits(tier.key);

  // Celebration after upgrade.
  if (welcome && !dismissed) {
    const perks = [
      `${limits.brands === Infinity ? "Unlimited" : limits.brands} brands`,
      `${limits.engines.length} AI engines`,
      "Competitor Intelligence unlocked",
      tier.features.whiteLabelReports ? "White-label reports" : "Recommended GEO fixes",
    ];
    return (
      <section className="member-celebrate">
        <button className="member-celebrate-close" onClick={() => setDismissed(true)} aria-label="Dismiss">
          <XIcon />
        </button>
        <div className="member-celebrate-icon">
          <CrownIcon />
        </div>
        <div className="member-celebrate-copy">
          <span className="member-celebrate-tag">🎉 Welcome to {tier.name}</span>
          <h2>You’re officially a {tier.name} member.</h2>
          <p>Your workspace just leveled up. Here’s what’s now unlocked:</p>
          <ul className="member-perks">
            {perks.map((perk) => (
              <li key={perk}>
                <CheckCircle2Icon /> {perk}
              </li>
            ))}
          </ul>
          <Link href="/dashboard/competitors" className="primary-button">
            Explore Competitor Intel <ArrowRightIcon className="button-icon" />
          </Link>
        </div>
      </section>
    );
  }

  // Steady-state member strip.
  if (isPaid) {
    return (
      <div className="member-strip">
        <span className="member-strip-badge">
          <CrownIcon /> {tier.name} member
        </span>
        <span className="member-strip-text">
          All your {tier.name} features are active. Thanks for being part of Oras.
        </span>
        <Link href="/dashboard/competitors" className="member-strip-link">
          Competitor Intel →
        </Link>
      </div>
    );
  }

  // Free-tier upgrade nudge.
  const upgrade = nextTier("free");
  return (
    <div className="member-strip member-strip-free">
      <span className="member-strip-badge member-strip-badge-free">
        <SparklesIcon /> Free plan
      </span>
      <span className="member-strip-text">
        Unlock all AI engines, more brands, and Competitor Intelligence with {upgrade?.name}.
      </span>
      <Link href="/pricing" className="primary-button member-strip-cta">
        Upgrade <ArrowRightIcon className="button-icon" />
      </Link>
    </div>
  );
}
