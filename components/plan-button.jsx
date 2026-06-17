"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createBrowserSupabaseClient } from "@/lib/supabase";

// Payments are gated behind a public flag so the app can launch free-only:
// while it's off, paid plans show "Coming soon" instead of a dead checkout.
// Set NEXT_PUBLIC_PAYMENTS_ENABLED=true once Dodo Payments is configured to go live.
const paymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";

// Pricing CTA. Free continues into the app; a paid plan starts a real Stripe
// Checkout session (card entry happens on Stripe's secure hosted page — we
// never touch card data). On success the Stripe webhook flips the tier.
export function PlanButton({ tierKey, label, className, billingCycle = "monthly" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Free launch: paid plans aren't purchasable yet — show a clear "Coming soon"
  // instead of letting the user click through to a 503 from /api/checkout.
  if (!paymentsEnabled && tierKey !== "free") {
    return (
      <button type="button" className={className} disabled aria-disabled="true">
        Coming soon
      </button>
    );
  }

  const handleClick = async () => {
    setError("");
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      router.push("/signin");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/signin");
      return;
    }

    if (tierKey === "free") {
      router.push("/dashboard");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tierKey, billingCycle }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.url) {
        window.location.href = data.url; // Dodo-hosted secure checkout
        return;
      }

      if (response.status === 503) {
        setError("Payments aren't configured yet. Add your Dodo Payments keys to enable checkout.");
      } else {
        setError(data.error || "Could not start checkout.");
      }
    } catch {
      setError("Could not reach the payment server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className={className} onClick={handleClick} disabled={busy}>
        {busy ? "Redirecting…" : label}
      </button>
      {error ? <span className="plan-button-error">{error}</span> : null}
    </>
  );
}
