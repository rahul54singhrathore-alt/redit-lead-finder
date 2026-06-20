"use client";

import { useCallback, useState } from "react";
import {
  ArrowRightIcon,
  BellRingIcon,
  CheckIcon,
  Loader2Icon,
  SparklesIcon,
  UsersIcon,
  WandSparklesIcon,
  ZapIcon,
} from "lucide-react";
import {
  INDUSTRY_OPTIONS,
  formatDefaultVisibilitySources,
  parseCommaSeparatedList,
} from "@/lib/workspace-profile";

/* ── constants ──────────────────────────────────────────────────────────── */

const STEPS = [
  { key: "brand",       label: "Your brand",    icon: SparklesIcon },
  { key: "competitors", label: "Competitors",   icon: UsersIcon },
  { key: "notify",      label: "Notifications", icon: BellRingIcon },
];

const FREQUENCY_OPTIONS = [
  { value: "daily",  label: "Daily",  description: "A compact summary every morning." },
  { value: "weekly", label: "Weekly", description: "One digest every week." },
  { value: "off",    label: "Off",    description: "I'll check the dashboard myself." },
];

const DESC_MAX = 200;

/* ── helpers ────────────────────────────────────────────────────────────── */

function isValidUrl(value) {
  const v = String(value || "").trim();
  if (!v) return false;
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return u.hostname.includes(".");
  } catch { return false; }
}

/* ── CompetitorTags ─────────────────────────────────────────────────────── */

function CompetitorTags({ tags, onChange }) {
  const [draft, setDraft] = useState("");

  const add = useCallback(() => {
    const name = draft.trim();
    if (!name || tags.includes(name)) { setDraft(""); return; }
    onChange([...tags, name]);
    setDraft("");
  }, [draft, tags, onChange]);

  const remove = (tag) => onChange(tags.filter(t => t !== tag));

  const onKey = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
    if (e.key === "Backspace" && !draft && tags.length) remove(tags[tags.length - 1]);
  };

  return (
    <div className="ob3-tags-wrap">
      {tags.map(tag => (
        <span key={tag} className="ob3-tag">
          {tag}
          <button type="button" className="ob3-tag-x" onClick={() => remove(tag)}>×</button>
        </span>
      ))}
      <input
        className="ob3-tags-input"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={tags.length ? "Add another…" : "e.g. Ahrefs, Semrush"}
      />
    </div>
  );
}

/* ── main component ─────────────────────────────────────────────────────── */

export function DashboardOnboarding({ user, supabase, onComplete }) {
  const [step,        setStep]        = useState(0);
  const [submitting,  setSubmitting]  = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [autofillMsg, setAutofillMsg] = useState("");
  const [errors,      setErrors]      = useState({});
  const [saveError,   setSaveError]   = useState("");

  // Step 1 — brand
  const [url,         setUrl]         = useState("");
  const [brandName,   setBrandName]   = useState("");
  const [description, setDescription] = useState("");
  const [industry,    setIndustry]    = useState("");

  // Step 2 — competitors
  const [competitors, setCompetitors] = useState([]);

  // Step 3 — notifications
  const [frequency,   setFrequency]   = useState("weekly");

  /* ── auto-fill ── */
  const handleAutoFill = async () => {
    if (!isValidUrl(url)) {
      setErrors(e => ({ ...e, url: "Enter a valid URL first." }));
      return;
    }
    setAutofilling(true);
    setAutofillMsg("");
    setErrors(e => { const n = { ...e }; delete n.url; return n; });
    try {
      const res  = await fetch("/api/brand-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setAutofillMsg(data?.error || "Couldn't read that site."); return; }
      const filled = [];
      if (data.brandName)   { setBrandName(data.brandName);                   filled.push("name"); }
      if (data.description) { setDescription(data.description.slice(0, DESC_MAX)); filled.push("description"); }
      if (data.industry)    { setIndustry(data.industry);                     filled.push("industry"); }
      if (data.websiteUrl)  setUrl(data.websiteUrl);
      setAutofillMsg(filled.length
        ? `Auto-filled: ${filled.join(", ")}. Review and continue.`
        : "Site reached but no metadata found — fill in manually.");
    } catch { setAutofillMsg("Something went wrong. Try again."); }
    finally { setAutofilling(false); }
  };

  /* ── validation per step ── */
  const validateStep = () => {
    if (step === 0) {
      const errs = {};
      if (!brandName.trim()) errs.brandName = "Brand name is required.";
      if (url && !isValidUrl(url)) errs.url = "Enter a valid URL, e.g. https://oras.com";
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => { setStep(s => s - 1); setErrors({}); };

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!supabase || !user) { setSaveError("Session expired — please refresh."); return; }
    setSubmitting(true);
    setSaveError("");

    const sources = parseCommaSeparatedList(formatDefaultVisibilitySources());

    const { error } = await supabase.from("user_profiles").upsert({
      user_id:              user.id,
      onboarding_completed: true,
      product_name:         brandName.trim(),
      product_url:          url.trim(),
      brand_description:    description.trim(),
      industry,
      competitors,
      starter_keyword:      brandName.trim(),
      target_subreddits:    sources,
      digest_frequency:     frequency,
      email_digest:         frequency !== "off",
      updated_at:           new Date().toISOString(),
    });

    if (!error) {
      await supabase.from("tracked_keywords").insert({
        user_id:    user.id,
        keyword:    brandName.trim(),
        subreddits: sources,
      }).catch(() => {});
    }

    setSubmitting(false);
    if (error) { setSaveError(error.message || "Could not save. Try again."); return; }

    onComplete({
      product_name:      brandName.trim(),
      product_url:       url.trim(),
      brand_description: description.trim(),
      industry,
      competitors,
      digest_frequency:  frequency,
    });
  };

  const currentStep = STEPS[step];
  const progress    = ((step) / (STEPS.length)) * 100;

  return (
    <div className="ob3-root">

      {/* ── sidebar / intro ── */}
      <div className="ob3-sidebar">
        <div className="ob3-sidebar-top">
          <div className="ob3-brand">
            <img src="/logo.png" alt="" className="ob3-logo" />
            <span>ORAS</span>
          </div>
          <h2 className="ob3-sidebar-title">
            Get your brand visible in every AI answer.
          </h2>
          <p className="ob3-sidebar-sub">
            Takes 60 seconds. We'll run your first scan as soon as you're done.
          </p>
        </div>

        {/* step list */}
        <div className="ob3-steps">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done    = i < step;
            const active  = i === step;
            return (
              <div key={s.key} className={`ob3-step-row${active ? " active" : ""}${done ? " done" : ""}`}>
                <div className="ob3-step-icon-wrap">
                  {done ? <CheckIcon className="ob3-step-check" /> : <Icon />}
                </div>
                <div>
                  <span className="ob3-step-num">Step {i + 1}</span>
                  <span className="ob3-step-label">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── form panel ── */}
      <div className="ob3-panel">

        {/* progress bar */}
        <div className="ob3-progress-track">
          <div className="ob3-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="ob3-form-wrap">

          {/* ── Step 0: Brand ── */}
          {step === 0 && (
            <div className="ob3-step-content">
              <div className="ob3-step-head">
                <span className="ob3-kicker">Step 1 of 3</span>
                <h1>Tell us about your brand</h1>
                <p>Paste your website and we'll auto-fill the rest.</p>
              </div>

              <div className="ob3-fields">
                {/* URL + autofill */}
                <div className="ob3-field">
                  <label>Website URL <span className="ob3-opt">optional</span></label>
                  <div className="ob3-url-row">
                    <input
                      className={`ob3-input${errors.url ? " ob3-input-err" : ""}`}
                      type="url"
                      placeholder="https://yourbrand.com"
                      value={url}
                      onChange={e => { setUrl(e.target.value); setErrors(v => { const n={...v}; delete n.url; return n; }); setAutofillMsg(""); }}
                    />
                    <button type="button" className="ob3-autofill-btn" onClick={handleAutoFill} disabled={autofilling}>
                      {autofilling
                        ? <Loader2Icon className="ob3-spin" />
                        : <WandSparklesIcon />}
                      {autofilling ? "Reading…" : "Auto-fill"}
                    </button>
                  </div>
                  {errors.url   && <span className="ob3-err-msg">{errors.url}</span>}
                  {autofillMsg  && <span className="ob3-fill-msg">{autofillMsg}</span>}
                </div>

                {/* Brand name */}
                <div className="ob3-field">
                  <label>Brand name <span className="ob3-req">*</span></label>
                  <input
                    className={`ob3-input${errors.brandName ? " ob3-input-err" : ""}`}
                    type="text"
                    placeholder="e.g. Acme Inc."
                    value={brandName}
                    onChange={e => { setBrandName(e.target.value); setErrors(v => { const n={...v}; delete n.brandName; return n; }); }}
                  />
                  {errors.brandName && <span className="ob3-err-msg">{errors.brandName}</span>}
                </div>

                {/* Description */}
                <div className="ob3-field">
                  <label>
                    What does your brand do?
                    <span className="ob3-counter">{description.length}/{DESC_MAX}</span>
                  </label>
                  <textarea
                    className="ob3-input ob3-textarea"
                    rows={3}
                    maxLength={DESC_MAX}
                    placeholder="1–2 sentences describing your product and who it's for."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                {/* Industry */}
                <div className="ob3-field">
                  <label>Industry <span className="ob3-opt">optional</span></label>
                  <select className="ob3-input" value={industry} onChange={e => setIndustry(e.target.value)}>
                    <option value="">Select industry…</option>
                    {INDUSTRY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div className="ob3-actions">
                <button type="button" className="ob3-next-btn" onClick={next}>
                  Continue <ArrowRightIcon />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 1: Competitors ── */}
          {step === 1 && (
            <div className="ob3-step-content">
              <div className="ob3-step-head">
                <span className="ob3-kicker">Step 2 of 3</span>
                <h1>Who do you compete with?</h1>
                <p>We'll track them alongside your brand across every AI engine. You can skip this and add them later.</p>
              </div>

              <div className="ob3-fields">
                <div className="ob3-field">
                  <label>Competitors <span className="ob3-opt">optional</span></label>
                  <CompetitorTags tags={competitors} onChange={setCompetitors} />
                  <span className="ob3-hint">Press Enter or comma after each name.</span>
                </div>

                {competitors.length > 0 && (
                  <div className="ob3-comp-preview">
                    <ZapIcon className="ob3-comp-icon" />
                    <span>We'll benchmark <strong>{brandName || "your brand"}</strong> against {competitors.length} competitor{competitors.length > 1 ? "s" : ""} in every scan.</span>
                  </div>
                )}
              </div>

              <div className="ob3-actions ob3-actions-row">
                <button type="button" className="ob3-back-btn" onClick={back}>← Back</button>
                <button type="button" className="ob3-next-btn" onClick={next}>
                  {competitors.length ? "Continue" : "Skip for now"} <ArrowRightIcon />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Notifications ── */}
          {step === 2 && (
            <div className="ob3-step-content">
              <div className="ob3-step-head">
                <span className="ob3-kicker">Step 3 of 3</span>
                <h1>How often should we email you?</h1>
                <p>We'll send visibility summaries and ranking changes to <strong>{user?.email}</strong>.</p>
              </div>

              <div className="ob3-fields">
                <div className="ob3-freq-grid">
                  {FREQUENCY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`ob3-freq-card${frequency === opt.value ? " selected" : ""}`}
                      onClick={() => setFrequency(opt.value)}
                    >
                      <div className="ob3-freq-check">
                        {frequency === opt.value && <CheckIcon />}
                      </div>
                      <strong>{opt.label}</strong>
                      <span>{opt.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {saveError && <p className="ob3-save-err">{saveError}</p>}

              <div className="ob3-actions ob3-actions-row">
                <button type="button" className="ob3-back-btn" onClick={back}>← Back</button>
                <button
                  type="button"
                  className="ob3-next-btn ob3-submit-btn"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting
                    ? <><Loader2Icon className="ob3-spin" /> Setting up…</>
                    : <>Launch dashboard <ZapIcon /></>}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
