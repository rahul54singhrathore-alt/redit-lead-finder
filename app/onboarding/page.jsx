"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, BellRingIcon, CheckIcon, GaugeIcon, SearchIcon, SparklesIcon, WandSparklesIcon, ZapIcon } from "lucide-react";

import { SourcePresetPicker } from "../../components/source-preset-picker";
import { createBrowserSupabaseClient, isMissingSupabaseTableError } from "../../lib/supabase";
import {
  DEFAULT_VISIBILITY_SOURCES,
  INDUSTRY_OPTIONS,
  formatDefaultVisibilitySources,
  normalizeWorkspaceProfile,
  parseCommaSeparatedList,
} from "../../lib/workspace-profile";

const customerOptions = [
  { label: "B2B", value: "b2b", hint: "You sell to businesses" },
  { label: "B2C", value: "b2c", hint: "You sell to consumers" },
  { label: "Both", value: "both", hint: "A mix of both" },
];

const STEPS = ["Brand", "Audience", "You're set"];
const DESCRIPTION_MAX = 180;

const frequencyOptions = [
  {
    value: "daily",
    label: "Daily",
    hint: "Best while you are tuning visibility.",
  },
  {
    value: "weekly",
    label: "Weekly",
    hint: "A digest when you prefer fewer alerts.",
  },
  {
    value: "off",
    label: "Off",
    hint: "Keep updates inside the dashboard.",
  },
];

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
  const [brandDescription, setBrandDescription] = useState("");
  const [customerType, setCustomerType] = useState("both");
  const [competitors, setCompetitors] = useState("");
  const [sources, setSources] = useState(formatDefaultVisibilitySources());
  const [digestFrequency, setDigestFrequency] = useState("daily");

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
      if (profile?.brand_description) setBrandDescription(profile.brand_description.slice(0, DESCRIPTION_MAX));
      if (profile?.customer_type) setCustomerType(profile.customer_type);
      if (Array.isArray(profile?.competitors) && profile.competitors.length)
        setCompetitors(profile.competitors.join(", "));
      if (Array.isArray(profile?.target_subreddits) && profile.target_subreddits.length)
        setSources(profile.target_subreddits.join(", "));
      if (profile?.digest_frequency) setDigestFrequency(profile.digest_frequency);

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
      if (data.description) { setBrandDescription(data.description.slice(0, DESCRIPTION_MAX)); filled.push("description"); }
      if (data.industry) { setIndustry(data.industry); filled.push("industry"); }
      if (data.websiteUrl) setProductUrl(data.websiteUrl);
      setFetchNote(filled.length ? `Auto-filled ${filled.join(", ")} from your site.` : "Reached the site, but found no brand info.");
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
    if (step === 2 && sourceList.length === 0) {
      return setMessage("Choose at least one source to monitor.");
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const competitorList = competitors
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const sourceList = parseCommaSeparatedList(sources);
  const selectedFrequency = frequencyOptions.find((option) => option.value === digestFrequency) || frequencyOptions[0];

  const goBack = () => {
    setMessage("");
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
        brand_description: brandDescription.trim(),
        customer_type: customerType,
        competitors: competitorList,
        starter_keyword: productName.trim(),
        target_subreddits: sourceList.length ? sourceList : DEFAULT_VISIBILITY_SOURCES,
        digest_frequency: digestFrequency,
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
      subreddits: sourceList.length ? sourceList : DEFAULT_VISIBILITY_SOURCES,
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
            <span className="onb-kicker"><SparklesIcon /> Welcome to Oras</span>
            <h1>Set up your brand</h1>
            <p className="onb-sub">Add your site URL and we&apos;ll auto-fill the rest in one click.</p>

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
              <span>What does your brand do? <em>(optional)</em></span>
              <textarea
                className="onb-textarea"
                value={brandDescription}
                maxLength={DESCRIPTION_MAX}
                onChange={(e) => setBrandDescription(e.target.value)}
                placeholder="One or two lines — makes your AI visibility checks more accurate."
                rows={2}
              />
              <small className="onb-field-count">{brandDescription.length}/{DESCRIPTION_MAX}</small>
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
            <span className="onb-kicker"><SparklesIcon /> Audience &amp; Sources</span>
            <h1>Who do you sell to?</h1>
            <p className="onb-sub">This tunes which AI prompts and signals we track for you.</p>

            <div className="onb-cards onb-frequency-grid">
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

            <label className="onb-field" style={{ marginTop: "20px" }}>
              <span>Top competitors <em>(optional)</em></span>
              <input
                type="text"
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                placeholder="Competitor A, Competitor B, Competitor C"
              />
              <small className="onb-note">Comma-separated — we&apos;ll track their AI mentions alongside yours.</small>
            </label>

            <div className="onb-field" style={{ gap: "10px" }}>
              <span>Platforms to monitor <em>({sourceList.length} selected)</em></span>
              <SourcePresetPicker value={sources} onChange={setSources} />
              <small className="onb-field-hint">Add custom sources in Settings after setup.</small>
            </div>

            <div className="onb-frequency">
              <span className="onb-field-title">Digest rhythm</span>
              <div className="onb-cards onb-frequency-grid">
                {frequencyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`onb-choice-card${digestFrequency === option.value ? " onb-choice-active" : ""}`}
                    onClick={() => setDigestFrequency(option.value)}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.hint}</span>
                    {digestFrequency === option.value ? <CheckIcon className="onb-choice-check" /> : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Step 3 — All set */}
        {step === 3 ? (
          <div className="onb-panel onb-finish">
            <div className="onb-finish-icon"><SparklesIcon /></div>
            <h1>{productName ? `${productName} is ready` : "Your workspace is ready"}</h1>
            <p className="onb-sub">Here&apos;s what&apos;s set up and waiting for you in the dashboard.</p>

            <div className="onb-feature-list">
              <div className="onb-feature-item">
                <span className="onb-feature-icon"><GaugeIcon /></span>
                <div>
                  <strong>GEO Score</strong>
                  <p>Track {productName || "your brand"} across {sourceList.length || DEFAULT_VISIBILITY_SOURCES.length} selected sources.</p>
                </div>
              </div>
              <div className="onb-feature-item">
                <span className="onb-feature-icon"><BellRingIcon /></span>
                <div>
                  <strong>{selectedFrequency.label} digest</strong>
                  <p>{selectedFrequency.value === "off" ? "You can review signals in the dashboard." : "Visibility changes will be summarized for review."}</p>
                </div>
              </div>
              <div className="onb-feature-item">
                <span className="onb-feature-icon"><SearchIcon /></span>
                <div>
                  <strong>Competitor context</strong>
                  <p>{competitorList.length ? `Benchmark against ${competitorList.slice(0, 2).join(" and ")}.` : "Add competitors later when you want benchmarking."}</p>
                </div>
              </div>
              <div className="onb-feature-item">
                <span className="onb-feature-icon"><ZapIcon /></span>
                <div>
                  <strong>Recommendations</strong>
                  <p>Use the setup to generate concrete actions for improving AI visibility.</p>
                </div>
              </div>
            </div>

            <div className="onb-recap">
              <div className="onb-recap-row"><span>Brand</span><strong>{productName || "—"}</strong></div>
              <div className="onb-recap-row"><span>Website</span><strong>{productUrl || "—"}</strong></div>
              {industry ? <div className="onb-recap-row"><span>Industry</span><strong>{industry}</strong></div> : null}
              <div className="onb-recap-row"><span>Audience</span><strong>{customerType.toUpperCase()}</strong></div>
              <div className="onb-recap-row"><span>Sources</span><strong>{sourceList.join(", ") || "—"}</strong></div>
              <div className="onb-recap-row"><span>Digest</span><strong>{selectedFrequency.label}</strong></div>
              {competitorList.length > 0 ? (
                <div className="onb-recap-row"><span>Competitors</span><strong>{competitorList.join(", ")}</strong></div>
              ) : null}
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
              {isSubmitting ? "Setting up…" : "Go to dashboard"} {!isSubmitting ? <ArrowRightIcon /> : null}
            </button>
          )}
        </div>
      </div>

      <footer className="onb-footer">© 2026 · ORAS INC.</footer>
    </main>
  );
}
