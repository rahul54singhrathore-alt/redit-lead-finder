"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, SparklesIcon, WandSparklesIcon } from "lucide-react";

import { createBrowserSupabaseClient, isMissingSupabaseTableError } from "../../lib/supabase";
import {
  DEFAULT_VISIBILITY_SOURCES,
  INDUSTRY_OPTIONS,
  REFERRAL_SOURCE_OPTIONS,
  normalizeWorkspaceProfile,
} from "../../lib/workspace-profile";

const customerOptions = [
  { label: "B2B", value: "b2b", hint: "You sell to businesses" },
  { label: "B2C", value: "b2c", hint: "You sell to consumers" },
  { label: "Both", value: "both", hint: "A mix of both" },
];

const STEPS = ["Brand", "Audience", "Finish"];

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

function isValidUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return false;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return url.hostname.includes(".");
  } catch {
    return false;
  }
}

export default function OnboardingPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1);

  const [productName, setProductName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [customerType, setCustomerType] = useState("both");
  const [referralSource, setReferralSource] = useState("");

  const [isFetching, setIsFetching] = useState(false);
  const [fetchNote, setFetchNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const faviconUrl = useMemo(() => getFaviconUrl(productUrl), [productUrl]);

  useEffect(() => {
    if (!supabase) return;

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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

      if (error && !isMissingSupabaseTableError(error, "user_profiles")) {
        setMessage("Could not load onboarding.");
      }

      const profile = data ? normalizeWorkspaceProfile(data) : null;
      if (profile?.onboarding_completed) {
        router.replace("/dashboard");
        return;
      }

      if (profile?.product_name) setProductName(profile.product_name);
      if (profile?.product_url) setProductUrl(profile.product_url);
      if (profile?.industry) setIndustry(profile.industry);
      if (profile?.customer_type) setCustomerType(profile.customer_type);
      if (profile?.referral_source) setReferralSource(profile.referral_source);

      setLoading(false);
    };

    load();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) router.replace("/signin");
      else setUser(session.user);
    });

    return () => authListener?.subscription?.unsubscribe();
  }, [router, supabase]);

  const handleAutoFill = async () => {
    setFetchNote("");
    setMessage("");
    if (!isValidUrl(productUrl)) {
      setMessage("Enter a valid website URL first.");
      return;
    }
    setIsFetching(true);
    try {
      const response = await fetch("/api/brand-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: productUrl.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFetchNote(data?.error || "Could not read that website.");
        return;
      }
      const filled = [];
      if (data.brandName) { setProductName(data.brandName); filled.push("name"); }
      if (data.industry) { setIndustry(data.industry); filled.push("industry"); }
      if (data.websiteUrl) setProductUrl(data.websiteUrl);
      setFetchNote(filled.length ? `Auto-filled ${filled.join(" & ")} from your site.` : "Reached the site, but found no brand info.");
    } catch {
      setFetchNote("Something went wrong reaching that website.");
    } finally {
      setIsFetching(false);
    }
  };

  const goNext = () => {
    setMessage("");
    if (step === 1) {
      if (!productName.trim()) return setMessage("Add your brand name.");
      if (!productUrl.trim() || !isValidUrl(productUrl)) return setMessage("Add a valid website URL.");
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => {
    setMessage("");
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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

    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        onboarding_completed: true,
        product_name: productName.trim(),
        product_url: productUrl.trim(),
        industry,
        customer_type: customerType,
        referral_source: referralSource,
        starter_keyword: productName.trim(),
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
          : "Could not save your onboarding. Please try again.",
      );
      return;
    }

    const { error: keywordError } = await supabase.from("tracked_keywords").insert({
      user_id: user.id,
      keyword: productName.trim(),
      subreddits: DEFAULT_VISIBILITY_SOURCES,
    });
    if (keywordError && !isMissingSupabaseTableError(keywordError, "tracked_keywords")) {
      console.error("Failed to create initial tracked keyword:", keywordError);
    }

    setIsSubmitting(false);
    router.replace("/dashboard");
  };

  if (loading) {
    return (
      <main className="oras-auth-page oras-auth-page-plain">
        <section className="oras-auth-wrap">
          <p className="oras-auth-loading">Loading...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="onb-page">
      <div className="onb-card">
        <header className="onb-head">
          <span className="onb-brand">
            <img src="/logo.png" alt="" />
            Oras
          </span>
          <span className="onb-step-count">Step {step} of 3</span>
        </header>

        <div className="onb-progress">
          {STEPS.map((label, index) => {
            const n = index + 1;
            const state = n < step ? "done" : n === step ? "active" : "";
            return (
              <div key={label} className={`onb-progress-item onb-${state}`}>
                <span className="onb-progress-dot">{n < step ? <CheckIcon /> : n}</span>
                <span className="onb-progress-label">{label}</span>
              </div>
            );
          })}
          <div className="onb-progress-bar">
            <div className="onb-progress-fill" style={{ width: `${((step - 1) / 2) * 100}%` }} />
          </div>
        </div>

        {/* Step 1 — Brand */}
        {step === 1 ? (
          <div className="onb-panel">
            <span className="onb-kicker"><SparklesIcon /> Welcome</span>
            <h1>Tell us about your brand</h1>
            <p className="onb-sub">Add your site and we&apos;ll auto-fill the rest in one click.</p>

            <label className="onb-field">
              <span>Website URL</span>
              <div className="onb-url-row">
                <span className="onb-input-wrap">
                  {faviconUrl ? <img className="onb-favicon" src={faviconUrl} alt="" onError={(e) => (e.currentTarget.style.display = "none")} /> : null}
                  <input
                    type="text"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="https://yourbrand.com"
                  />
                </span>
                <button type="button" className="onb-autofill" onClick={handleAutoFill} disabled={isFetching}>
                  <WandSparklesIcon className={isFetching ? "onb-spin" : ""} />
                  {isFetching ? "Reading…" : "Auto-fill"}
                </button>
              </div>
              {fetchNote ? <small className="onb-note">{fetchNote}</small> : null}
            </label>

            <label className="onb-field">
              <span>Brand name</span>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Acme"
              />
            </label>

            <label className="onb-field">
              <span>Industry <em>(optional)</em></span>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option value="">Select industry</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        {/* Step 2 — Audience */}
        {step === 2 ? (
          <div className="onb-panel">
            <span className="onb-kicker"><SparklesIcon /> Audience</span>
            <h1>Who are your customers?</h1>
            <p className="onb-sub">This helps us tune which AI prompts and sources matter for you.</p>

            <div className="onb-cards">
              {customerOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`onb-choice-card${customerType === option.value ? " onb-choice-active" : ""}`}
                  onClick={() => setCustomerType(option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.hint}</span>
                  {customerType === option.value ? <CheckIcon className="onb-choice-check" /> : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Step 3 — Finish */}
        {step === 3 ? (
          <div className="onb-panel">
            <span className="onb-kicker"><SparklesIcon /> Almost there</span>
            <h1>One last thing</h1>
            <p className="onb-sub">Where did you hear about Oras?</p>

            <label className="onb-field">
              <span>How did you find us?</span>
              <select value={referralSource} onChange={(e) => setReferralSource(e.target.value)}>
                <option value="" disabled>Select an option</option>
                {REFERRAL_SOURCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>

            <div className="onb-recap">
              <h3>Your workspace</h3>
              <div className="onb-recap-row"><span>Brand</span><strong>{productName || "—"}</strong></div>
              <div className="onb-recap-row"><span>Website</span><strong>{productUrl || "—"}</strong></div>
              {industry ? <div className="onb-recap-row"><span>Industry</span><strong>{industry}</strong></div> : null}
              <div className="onb-recap-row"><span>Audience</span><strong>{customerType.toUpperCase()}</strong></div>
            </div>
          </div>
        ) : null}

        {message ? <p className="onb-error">{message}</p> : null}

        <div className="onb-actions">
          {step > 1 ? (
            <button type="button" className="onb-back" onClick={goBack}>
              <ArrowLeftIcon /> Back
            </button>
          ) : <span />}

          {step < 3 ? (
            <button type="button" className="onb-next" onClick={goNext}>
              Continue <ArrowRightIcon />
            </button>
          ) : (
            <button type="button" className="onb-next" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Setting up…" : "Complete setup"} {!isSubmitting ? <ArrowRightIcon /> : null}
            </button>
          )}
        </div>
      </div>

      <footer className="onb-footer">© 2026 · ORAS INC.</footer>
    </main>
  );
}
