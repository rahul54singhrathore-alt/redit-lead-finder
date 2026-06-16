"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon, ArrowRightIcon, BellRingIcon, CheckIcon,
  GaugeIcon, SearchIcon, SparklesIcon, TrendingUpIcon,
  WandSparklesIcon, ZapIcon,
} from "lucide-react";

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
  { value: "daily",  label: "Daily",  hint: "Best while tuning visibility." },
  { value: "weekly", label: "Weekly", hint: "A digest when you prefer fewer alerts." },
  { value: "off",    label: "Off",    hint: "Updates inside the dashboard only." },
];

const ENGINES = [
  { name: "ChatGPT",    color: "#10a37f" },
  { name: "Gemini",     color: "#4285f4" },
  { name: "Claude",     color: "#d97706" },
  { name: "Perplexity", color: "#7c3aed" },
];

function getFaviconUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return "";
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const { hostname } = new URL(withProtocol);
    if (!hostname.includes(".")) return "";
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch { return ""; }
}

function isValidUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return false;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return url.hostname.includes(".");
  } catch { return false; }
}

/* ── Right-side preview panels ── */
function PreviewStep1({ name, url }) {
  const faviconUrl = getFaviconUrl(url);
  const displayName = name || "Your brand";
  return (
    <div className="onb-preview">
      <p className="onb-preview-label">Your dashboard preview</p>
      <div className="onb-preview-card">
        <div className="onb-preview-card-head">
          {faviconUrl
            ? <img src={faviconUrl} alt="" className="onb-preview-favicon" onError={(e) => (e.currentTarget.style.display = "none")} />
            : <span className="onb-preview-favicon-placeholder" />}
          <div>
            <strong>{displayName}</strong>
            <span>GEO Score</span>
          </div>
          <div className="onb-preview-score-badge">72</div>
        </div>
        <div className="onb-preview-engines">
          {ENGINES.map(({ name: n, color }) => (
            <div key={n} className="onb-preview-engine-row">
              <span className="onb-preview-engine-dot" style={{ background: color }} />
              <span className="onb-preview-engine-name">{n}</span>
              <span className="onb-preview-engine-rank">#2</span>
            </div>
          ))}
        </div>
        <div className="onb-preview-trend">
          <TrendingUpIcon />
          <span>+8 pts this week</span>
        </div>
      </div>
      <ul className="onb-preview-bullets">
        <li><CheckIcon /><span>4 AI engines tracked simultaneously</span></li>
        <li><CheckIcon /><span>Daily scans, no manual work</span></li>
        <li><CheckIcon /><span>Competitor gap analysis</span></li>
      </ul>
    </div>
  );
}

function PreviewStep2({ competitors, sourceList, frequency }) {
  const compList = competitors.split(",").map(c => c.trim()).filter(Boolean);
  const freq = frequencyOptions.find(f => f.value === frequency) || frequencyOptions[0];
  return (
    <div className="onb-preview">
      <p className="onb-preview-label">What we track for you</p>
      <div className="onb-preview-sources">
        <p className="onb-preview-sources-label">Platforms monitored</p>
        <div className="onb-preview-source-chips">
          {(sourceList.length ? sourceList : DEFAULT_VISIBILITY_SOURCES).slice(0, 6).map(s => (
            <span key={s} className="onb-preview-source-chip">{s}</span>
          ))}
          {(sourceList.length || DEFAULT_VISIBILITY_SOURCES.length) > 6 && (
            <span className="onb-preview-source-chip onb-preview-chip-more">
              +{(sourceList.length || DEFAULT_VISIBILITY_SOURCES.length) - 6} more
            </span>
          )}
        </div>
      </div>
      {compList.length > 0 && (
        <div className="onb-preview-comps">
          <p className="onb-preview-sources-label">Competitors tracked</p>
          {compList.slice(0, 3).map(c => (
            <div key={c} className="onb-preview-comp-row">
              <span className="onb-preview-comp-dot" />
              <span>{c}</span>
            </div>
          ))}
        </div>
      )}
      <div className="onb-preview-digest">
        <BellRingIcon />
        <span><strong>{freq.label}</strong> digest — {freq.hint}</span>
      </div>
    </div>
  );
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
  const [customerType, setCustomerType] = useState("b2b");
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
      if (!session) { router.replace("/signin"); return; }
      setUser(session.user);

      const { data, error } = await supabase
        .from("user_profiles").select("*")
        .eq("user_id", session.user.id).maybeSingle();

      if (error && !isMissingSupabaseTableError(error, "user_profiles")) {
        setMessage("Could not load onboarding.");
      }

      const profile = data ? normalizeWorkspaceProfile(data) : null;
      if (profile?.onboarding_completed) { router.replace("/dashboard"); return; }

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
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/signin");
      else setUser(session.user);
    });
    return () => authListener?.subscription?.unsubscribe();
  }, [router, supabase]);

  const handleAutoFill = async () => {
    setFetchNote(""); setMessage("");
    if (!isValidUrl(productUrl)) { setMessage("Enter a valid website URL first."); return; }
    setIsFetching(true);
    try {
      const res = await fetch("/api/brand-lookup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: productUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setFetchNote(data?.error || "Could not read that website."); return; }
      const filled = [];
      if (data.brandName) { setProductName(data.brandName); filled.push("name"); }
      if (data.description) { setBrandDescription(data.description.slice(0, DESCRIPTION_MAX)); filled.push("description"); }
      if (data.industry) { setIndustry(data.industry); filled.push("industry"); }
      if (data.websiteUrl) setProductUrl(data.websiteUrl);
      setFetchNote(filled.length ? `Auto-filled ${filled.join(", ")} from your site.` : "Reached the site but found no brand info.");
    } catch { setFetchNote("Something went wrong reaching that website."); }
    finally { setIsFetching(false); }
  };

  const sourceList = parseCommaSeparatedList(sources);
  const competitorList = competitors.split(",").map(c => c.trim()).filter(Boolean);
  const selectedFrequency = frequencyOptions.find(f => f.value === digestFrequency) || frequencyOptions[0];

  const goNext = () => {
    setMessage("");
    if (step === 1) {
      if (!productName.trim()) return setMessage("Add your brand name.");
      if (!productUrl.trim() || !isValidUrl(productUrl)) return setMessage("Add a valid website URL.");
    }
    if (step === 2 && sourceList.length === 0) return setMessage("Choose at least one source to monitor.");
    setStep(s => Math.min(3, s + 1));
  };

  const goBack = () => { setMessage(""); setStep(s => Math.max(1, s - 1)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase || !user) { setMessage("Supabase is not configured yet."); return; }
    setIsSubmitting(true); setMessage("");

    const { error: profileError } = await supabase.from("user_profiles").upsert({
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
    }).select("*").single();

    if (profileError) {
      setIsSubmitting(false);
      setMessage(
        isMissingSupabaseTableError(profileError, "user_profiles")
          ? "Database isn't set up yet. Run the Supabase migrations and try again."
          : "Could not save your onboarding. Please try again.",
      );
      return;
    }

    const { error: kwErr } = await supabase.from("tracked_keywords").insert({
      user_id: user.id,
      keyword: productName.trim(),
      subreddits: sourceList.length ? sourceList : DEFAULT_VISIBILITY_SOURCES,
    });
    if (kwErr && !isMissingSupabaseTableError(kwErr, "tracked_keywords"))
      console.error("Failed to create initial tracked keyword:", kwErr);

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
      <div className={`onb-shell${step === 3 ? " onb-shell-narrow" : ""}`}>

        {/* ── Left: form card ── */}
        <div className="onb-card">
          {/* Header */}
          <header className="onb-head">
            <span className="onb-brand">
              <img src="/logo.png" alt="" />
              Oras
            </span>
            <span className="onb-step-count">Step {step} of 3</span>
          </header>

          {/* Progress */}
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
          {step === 1 && (
            <div className="onb-panel">
              <span className="onb-kicker"><SparklesIcon /> Welcome to Oras</span>
              <h1>Set up your brand</h1>
              <p className="onb-sub">Add your site URL and we&apos;ll auto-fill the rest in one click.</p>

              {/* Engine pills */}
              <div className="onb-engine-row">
                {ENGINES.map(({ name, color }) => (
                  <span key={name} className="onb-engine-pill">
                    <span className="onb-engine-dot" style={{ background: color }} />
                    {name}
                  </span>
                ))}
              </div>

              <label className="onb-field">
                <span>Website URL</span>
                <div className="onb-url-row">
                  <span className="onb-input-wrap">
                    {faviconUrl
                      ? <img className="onb-favicon" src={faviconUrl} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
                      : null}
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
          )}

          {/* Step 2 — Audience */}
          {step === 2 && (
            <div className="onb-panel">
              <span className="onb-kicker"><SparklesIcon /> Audience &amp; Sources</span>
              <h1>Who do you sell to?</h1>
              <p className="onb-sub">This tunes which AI prompts and signals we track for you.</p>

              <div className="onb-field-title" style={{ marginBottom: 8 }}>Customer type</div>
              <div className="onb-cards onb-customer-grid">
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

              <label className="onb-field" style={{ marginTop: 20 }}>
                <span>Top competitors <em>(optional)</em></span>
                <input
                  type="text"
                  value={competitors}
                  onChange={(e) => setCompetitors(e.target.value)}
                  placeholder="Competitor A, Competitor B"
                />
                <small className="onb-note">Comma-separated — we&apos;ll track their AI mentions alongside yours.</small>
              </label>

              <div className="onb-field" style={{ gap: 10 }}>
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
          )}

          {/* Step 3 — All set */}
          {step === 3 && (
            <div className="onb-panel onb-finish">
              <div className="onb-finish-hero">
                <div className="onb-finish-check">
                  <div className="onb-finish-check-ring" />
                  <svg className="onb-finish-check-svg" viewBox="0 0 52 52" fill="none">
                    <circle cx="26" cy="26" r="25" stroke="#22c55e" strokeWidth="2" fill="#f0fdf4" />
                    <path d="M14 26l9 9 15-15" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {faviconUrl && (
                  <div className="onb-finish-brand-row">
                    <img className="onb-finish-favicon" src={faviconUrl} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
                    <span className="onb-finish-brand-name">{productName}</span>
                  </div>
                )}
                <h1 className="onb-finish-title">You&apos;re all set!</h1>
                <p className="onb-sub">Your AI visibility workspace is ready. Here&apos;s what&apos;s waiting for you.</p>
              </div>

              <div className="onb-finish-cards">
                <div className="onb-finish-card onb-finish-card-green">
                  <span className="onb-finish-card-icon"><GaugeIcon /></span>
                  <strong>GEO Score</strong>
                  <p>Track {productName || "your brand"} across {sourceList.length || DEFAULT_VISIBILITY_SOURCES.length} AI engines.</p>
                </div>
                <div className="onb-finish-card onb-finish-card-blue">
                  <span className="onb-finish-card-icon"><BellRingIcon /></span>
                  <strong>{selectedFrequency.label} digest</strong>
                  <p>{selectedFrequency.value === "off" ? "Check updates in dashboard anytime." : "Score changes sent to your inbox."}</p>
                </div>
                <div className="onb-finish-card onb-finish-card-purple">
                  <span className="onb-finish-card-icon"><SearchIcon /></span>
                  <strong>Competitors</strong>
                  <p>{competitorList.length ? `Benchmarking ${competitorList.slice(0, 2).join(" & ")}.` : "Add competitors to benchmark."}</p>
                </div>
                <div className="onb-finish-card onb-finish-card-orange">
                  <span className="onb-finish-card-icon"><ZapIcon /></span>
                  <strong>Actions</strong>
                  <p>Ranked fixes to improve your AI presence.</p>
                </div>
              </div>

              <div className="onb-next-steps">
                <p className="onb-next-steps-label">What happens next</p>
                <div className="onb-timeline">
                  <div className="onb-timeline-item">
                    <span className="onb-timeline-dot onb-timeline-dot-1" />
                    <div className="onb-timeline-content">
                      <strong>First scan runs</strong>
                      <span>AI engines are queried for {productName || "your brand"}</span>
                    </div>
                  </div>
                  <div className="onb-timeline-line" />
                  <div className="onb-timeline-item">
                    <span className="onb-timeline-dot onb-timeline-dot-2" />
                    <div className="onb-timeline-content">
                      <strong>Visibility score appears</strong>
                      <span>See exactly where you rank vs competitors</span>
                    </div>
                  </div>
                  <div className="onb-timeline-line" />
                  <div className="onb-timeline-item">
                    <span className="onb-timeline-dot onb-timeline-dot-3" />
                    <div className="onb-timeline-content">
                      <strong>Recommendations unlock</strong>
                      <span>Concrete actions ranked by impact</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {message ? <p className="onb-error">{message}</p> : null}

          <div className="onb-actions">
            {step > 1
              ? <button type="button" className="onb-back" onClick={goBack}><ArrowLeftIcon /> Back</button>
              : <span />}
            {step < 3
              ? <button type="button" className="onb-next" onClick={goNext}>Continue <ArrowRightIcon /></button>
              : <button type="button" className="onb-next" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Setting up…" : "Go to dashboard"} {!isSubmitting && <ArrowRightIcon />}
                </button>}
          </div>
        </div>

        {/* ── Right: live preview (steps 1 & 2 only) ── */}
        {step === 1 && <PreviewStep1 name={productName} url={productUrl} />}
        {step === 2 && <PreviewStep2 competitors={competitors} sourceList={sourceList} frequency={digestFrequency} />}

      </div>

      <footer className="onb-footer">© 2026 · ORAS INC.</footer>
    </main>
  );
}
