"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient, isMissingSupabaseTableError } from "../../lib/supabase";
import {
  DEFAULT_VISIBILITY_SOURCES,
  REFERRAL_SOURCE_OPTIONS,
  normalizeWorkspaceProfile,
} from "../../lib/workspace-profile";

const customerOptions = [
  { label: "B2B", value: "b2b" },
  { label: "B2C", value: "b2c" },
  { label: "BOTH", value: "both" },
];

// Resolve a small favicon for whatever URL the user types, via Google's service.
function getFaviconUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return "";
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const { hostname } = new URL(withProtocol);
    if (!hostname.includes(".")) return "";
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return "";
  }
}

export default function OnboardingPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [productName, setProductName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [customerType, setCustomerType] = useState("both");
  const [referralSource, setReferralSource] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const faviconUrl = useMemo(() => getFaviconUrl(productUrl), [productUrl]);

  useEffect(() => {
    if (!supabase) return;

    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/signin");
        return;
      }

      setUser(session.user);

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      // Handle case where user_profiles table doesn't exist yet
      if (error && !isMissingSupabaseTableError(error, "user_profiles")) {
        setMessage("Could not load onboarding.");
      }

      const profile = data ? normalizeWorkspaceProfile(data) : null;
      if (profile?.onboarding_completed) {
        router.replace("/dashboard");
        return;
      }

      if (profile?.product_name) {
        setProductName(profile.product_name);
      }
      if (profile?.product_url) {
        setProductUrl(profile.product_url);
      }
      if (profile?.customer_type) {
        setCustomerType(profile.customer_type);
      }
      if (profile?.referral_source) {
        setReferralSource(profile.referral_source);
      }

      setLoading(false);
    };

    load();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace("/signin");
      } else {
        setUser(session.user);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router, supabase]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedProductName = productName.trim();
    if (!trimmedProductName) {
      setMessage("Add your product name.");
      return;
    }

    const trimmedProductUrl = productUrl.trim();
    if (!trimmedProductUrl) {
      setMessage("Add your product URL.");
      return;
    }

    if (!referralSource) {
      setMessage("Let us know where you came from.");
      return;
    }

    if (!supabase || !user) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    // Supabase queries don't throw on failure — they resolve with an `error`
    // object. We must inspect it: if the profile write fails, the dashboard
    // will see onboarding_completed unset and bounce straight back here,
    // creating a redirect loop. So we surface the error and stop instead.
    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        onboarding_completed: true,
        product_name: trimmedProductName,
        product_url: trimmedProductUrl,
        customer_type: customerType,
        referral_source: referralSource,
        starter_keyword: trimmedProductName,
        target_subreddits: DEFAULT_VISIBILITY_SOURCES,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (profileError) {
      setIsSubmitting(false);
      setMessage(
        isMissingSupabaseTableError(profileError, "user_profiles")
          ? "Database isn't set up yet. Run the Supabase migrations and try again."
          : "Could not save your onboarding. Please try again."
      );
      return;
    }

    // Seed the first tracked keyword. This is best-effort — a failure here
    // shouldn't block the user from reaching the dashboard.
    const { error: keywordError } = await supabase.from("tracked_keywords").insert({
      user_id: user.id,
      keyword: trimmedProductName,
      subreddits: DEFAULT_VISIBILITY_SOURCES,
    });

    if (keywordError && !isMissingSupabaseTableError(keywordError, "tracked_keywords")) {
      // Non-fatal: log for diagnostics but continue to the dashboard.
      console.error("Failed to create initial tracked keyword:", keywordError);
    }

    setIsSubmitting(false);
    router.replace("/dashboard");
  };

  if (loading) {
    return (
      <main className="rankora-auth-page rankora-auth-page-plain">
        <section className="rankora-auth-wrap">
          <p className="rankora-auth-loading">Loading...</p>
        </section>
        <footer className="rankora-auth-footer">© 2026 · RANKORA INC.</footer>
      </main>
    );
  }

  return (
    <main className="rankora-auth-page rankora-auth-page-plain">
      <section className="rankora-auth-wrap" aria-label="Onboarding">
        <div className="rankora-login rankora-onboard">
          <div className="rankora-login-head">
            <h1>Welcome! Let's get you started</h1>
            <p>Tell us about your product so we can start finding leads for you.</p>
          </div>

          <form className="rankora-login-form" onSubmit={handleSubmit}>
            <div className="rankora-auth-field">
              <span>Product name</span>
              <label className="rankora-auth-input">
                <input
                  type="text"
                  value={productName}
                  onChange={(event) => setProductName(event.target.value)}
                  placeholder="Acme"
                />
              </label>
            </div>

            <div className="rankora-auth-field">
              <span>Product URL</span>
              <label className="rankora-auth-input">
                <input
                  type="text"
                  value={productUrl}
                  onChange={(event) => setProductUrl(event.target.value)}
                  placeholder="https://acme.com"
                />
                {faviconUrl ? (
                  <img
                    className="rankora-url-favicon"
                    src={faviconUrl}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}
              </label>
            </div>

            <div className="rankora-auth-field">
              <span>Who are your customers?</span>
              <div className="rankora-choices">
                {customerOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={customerType === option.value ? "rankora-choice active" : "rankora-choice"}
                    onClick={() => setCustomerType(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rankora-auth-field">
              <span>Where are you coming from?</span>
              <label className="rankora-auth-input rankora-auth-select">
                <select
                  value={referralSource}
                  onChange={(event) => setReferralSource(event.target.value)}
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  {REFERRAL_SOURCE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button className="rankora-auth-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Getting started..." : "Complete setup"}
            </button>

            {message ? <p className="rankora-auth-note error">{message}</p> : null}
          </form>
        </div>
      </section>

      <footer className="rankora-auth-footer">© 2026 · RANKORA INC.</footer>
    </main>
  );
}
