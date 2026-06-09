"use client";

import { useState } from "react";
import {
  ArrowRightIcon,
  BellRingIcon,
  CheckCircle2Icon,
  GlobeIcon,
  Loader2Icon,
  SearchIcon,
  SparklesIcon,
  WandSparklesIcon,
} from "lucide-react";

import { SourcePresetPicker } from "@/components/source-preset-picker";
import {
  INDUSTRY_OPTIONS,
  formatDefaultVisibilitySources,
  parseCommaSeparatedList,
} from "@/lib/workspace-profile";

const frequencyOptions = [
  {
    value: "daily",
    label: "Daily",
    description: "A compact summary once per day.",
  },
  {
    value: "weekly",
    label: "Weekly",
    description: "Batch results into a weekly digest.",
  },
  {
    value: "off",
    label: "Off",
    description: "Keep notifications inside the dashboard.",
  },
];

const DESCRIPTION_MAX = 180;

function isValidUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return false;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProtocol);
    return Boolean(url.hostname) && url.hostname.includes(".");
  } catch {
    return false;
  }
}

export function DashboardOnboarding({ user, supabase, onComplete }) {
  const [brandName, setBrandName] = useState("Oras");
  const [websiteUrl, setWebsiteUrl] = useState("https://oras.com");
  const [brandDescription, setBrandDescription] = useState(
    "AI visibility, GEO audits, citation tracking, and white-label reports for brands and agencies.",
  );
  const [industry, setIndustry] = useState("SEO");
  const [competitors, setCompetitors] = useState("");
  const [sources, setSources] = useState(formatDefaultVisibilitySources());
  const [digestFrequency, setDigestFrequency] = useState("daily");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchNote, setFetchNote] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const clearError = (field) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const handleAutoFill = async () => {
    setFetchNote("");
    setMessage("");

    if (!isValidUrl(websiteUrl)) {
      setErrors((prev) => ({ ...prev, websiteUrl: "Enter a valid website URL first." }));
      return;
    }

    setIsFetching(true);
    try {
      const response = await fetch("/api/brand-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setFetchNote(data?.error || "Could not read that website.");
        return;
      }

      const filled = [];
      if (data.brandName) {
        setBrandName(data.brandName);
        filled.push("name");
      }
      if (data.description) {
        setBrandDescription(data.description.slice(0, DESCRIPTION_MAX));
        filled.push("description");
      }
      if (data.industry) {
        setIndustry(data.industry);
        filled.push("industry");
      }
      if (data.websiteUrl) {
        setWebsiteUrl(data.websiteUrl);
      }
      clearError("brandName");
      clearError("websiteUrl");

      setFetchNote(
        filled.length
          ? `Auto-filled ${filled.join(", ")} from your site. Review before continuing.`
          : "We reached the site but found no brand metadata. Fill the fields manually.",
      );
    } catch {
      setFetchNote("Something went wrong reaching that website. Try again.");
    } finally {
      setIsFetching(false);
    }
  };

  const validate = (trimmedBrandName, trimmedWebsiteUrl, sourceList) => {
    const nextErrors = {};
    if (!trimmedBrandName) {
      nextErrors.brandName = "Add the brand you want to track.";
    }
    if (trimmedWebsiteUrl && !isValidUrl(trimmedWebsiteUrl)) {
      nextErrors.websiteUrl = "Enter a valid URL, e.g. https://oras.com";
    }
    if (sourceList.length === 0) {
      nextErrors.sources = "Add at least one source or competitor.";
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedBrandName = brandName.trim();
    const trimmedWebsiteUrl = websiteUrl.trim();
    const trimmedDescription = brandDescription.trim();
    const sourceList = parseCommaSeparatedList(sources);
    const competitorList = parseCommaSeparatedList(competitors);

    const nextErrors = validate(trimmedBrandName, trimmedWebsiteUrl, sourceList);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setMessage("");
      return;
    }

    if (!supabase || !user) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setMessage("");

    const profileResult = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        onboarding_completed: true,
        product_name: trimmedBrandName,
        product_url: trimmedWebsiteUrl,
        brand_description: trimmedDescription,
        industry,
        competitors: competitorList,
        starter_keyword: trimmedBrandName,
        target_subreddits: sourceList,
        digest_frequency: digestFrequency,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    const keywordResult = await supabase.from("tracked_keywords").insert({
      user_id: user.id,
      keyword: trimmedBrandName,
      subreddits: sourceList,
    });

    const alertResult = await supabase.from("alert_rules").insert({
      user_id: user.id,
      name: "Visibility audits",
      trigger: "new matching signal found",
      channel: digestFrequency === "off" ? "Dashboard only" : "Instant email",
      active: digestFrequency !== "off",
    });

    setIsSubmitting(false);

    if (profileResult.error || alertResult.error) {
      const errorMessage =
        profileResult.error?.message ||
        alertResult.error?.message ||
        "Could not save onboarding setup.";
      setMessage(errorMessage);
      return;
    }

    onComplete({
      product_name: trimmedBrandName,
      product_url: trimmedWebsiteUrl,
      brand_description: trimmedDescription,
      industry,
      competitors: competitorList,
      starter_keyword: trimmedBrandName,
      target_subreddits: sourceList,
      digest_frequency: digestFrequency,
    });
  };

  return (
    <section className="onboarding-shell">
      <div className="onboarding-intro">
        <span className="onboarding-kicker">
          <SparklesIcon className="onboarding-kicker-icon" />
          First-time setup
        </span>
        <h1>Set up the brands, sources, and visibility rhythm you care about.</h1>
        <p>
          We will create your first tracked brand, save the source targets,
          and store your audit frequency so the workspace is ready the next time
          you sign in.
        </p>

        <div className="onboarding-steps">
          <div className="onboarding-step">
            <SearchIcon className="onboarding-step-icon" />
            <div>
              <strong>Brand information</strong>
              <span>Add your site and let us auto-fill the brand details.</span>
            </div>
          </div>
          <div className="onboarding-step">
            <CheckCircle2Icon className="onboarding-step-icon" />
            <div>
              <strong>Sources and competitors</strong>
              <span>Focus on the websites, forums, and competitors that shape AI visibility.</span>
            </div>
          </div>
          <div className="onboarding-step">
            <BellRingIcon className="onboarding-step-icon" />
            <div>
              <strong>Audit frequency</strong>
              <span>Choose how often you want visibility checks surfaced back to you.</span>
            </div>
          </div>
        </div>
      </div>

      <form className="onboarding-card" onSubmit={handleSubmit} noValidate>
        <div className="card-header">
          <h2>Visibility setup</h2>
          <span className="onboarding-progress">Step 1 of 1</span>
        </div>

        <div className="settings-stack">
          <fieldset className="onboarding-fieldset">
            <legend className="onboarding-legend">
              <GlobeIcon className="onboarding-legend-icon" />
              Brand information
            </legend>

            <div className="form-group">
              <label className="form-label" htmlFor="onboarding-website">
                Website URL
              </label>
              <div className="onboarding-url-row">
                <input
                  id="onboarding-website"
                  className={`form-input${errors.websiteUrl ? " form-input-error" : ""}`}
                  type="url"
                  placeholder="https://oras.com"
                  value={websiteUrl}
                  onChange={(event) => {
                    setWebsiteUrl(event.target.value);
                    clearError("websiteUrl");
                  }}
                />
                <button
                  type="button"
                  className="onboarding-autofill"
                  onClick={handleAutoFill}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <Loader2Icon className="button-icon onboarding-spin" />
                  ) : (
                    <WandSparklesIcon className="button-icon" />
                  )}
                  {isFetching ? "Reading…" : "Auto-fill"}
                </button>
              </div>
              {errors.websiteUrl ? (
                <span className="onboarding-field-error">{errors.websiteUrl}</span>
              ) : (
                <span className="onboarding-field-hint">
                  Paste your site and we’ll pull the brand name, description, and industry.
                </span>
              )}
              {fetchNote ? <span className="onboarding-field-note">{fetchNote}</span> : null}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="onboarding-brand-name">
                Brand name
              </label>
              <input
                id="onboarding-brand-name"
                className={`form-input${errors.brandName ? " form-input-error" : ""}`}
                type="text"
                placeholder="e.g., Oras"
                value={brandName}
                onChange={(event) => {
                  setBrandName(event.target.value);
                  clearError("brandName");
                }}
              />
              {errors.brandName ? (
                <span className="onboarding-field-error">{errors.brandName}</span>
              ) : null}
            </div>

            <div className="form-group">
              <div className="onboarding-label-row">
                <label className="form-label" htmlFor="onboarding-description">
                  Brand description
                </label>
                <span
                  className={`onboarding-counter${
                    brandDescription.length > DESCRIPTION_MAX ? " onboarding-counter-over" : ""
                  }`}
                >
                  {brandDescription.length}/{DESCRIPTION_MAX}
                </span>
              </div>
              <textarea
                id="onboarding-description"
                className="form-input"
                rows={2}
                maxLength={DESCRIPTION_MAX}
                placeholder="1-2 lines describing what your brand does."
                value={brandDescription}
                onChange={(event) => setBrandDescription(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="onboarding-industry">
                Industry / niche
              </label>
              <select
                id="onboarding-industry"
                className="form-input"
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
              >
                {INDUSTRY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="onboarding-competitors">
                Competitors <span className="onboarding-optional">optional</span>
              </label>
              <input
                id="onboarding-competitors"
                className="form-input"
                type="text"
                placeholder="e.g., Ahrefs, Semrush, Surfer"
                value={competitors}
                onChange={(event) => setCompetitors(event.target.value)}
              />
              <span className="onboarding-field-hint">
                Comma-separated brands we should benchmark you against.
              </span>
            </div>
          </fieldset>

          <div className="form-group">
            <label className="form-label" htmlFor="onboarding-subreddits">
              Sources / competitors
            </label>
            <input
              id="onboarding-subreddits"
              className={`form-input${errors.sources ? " form-input-error" : ""}`}
              type="text"
              placeholder={formatDefaultVisibilitySources()}
              value={sources}
              onChange={(event) => {
                setSources(event.target.value);
                clearError("sources");
              }}
            />
            {errors.sources ? (
              <span className="onboarding-field-error">{errors.sources}</span>
            ) : null}
            <SourcePresetPicker value={sources} onChange={setSources} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="onboarding-frequency">
              Audit frequency
            </label>
            <select
              id="onboarding-frequency"
              className="form-input"
              value={digestFrequency}
              onChange={(event) => setDigestFrequency(event.target.value)}
            >
              {frequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="onboarding-summary">
            {frequencyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`onboarding-choice${digestFrequency === option.value ? " onboarding-choice-active" : ""}`}
                onClick={() => setDigestFrequency(option.value)}
              >
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        {message ? <p className="onboarding-message">{message}</p> : null}

        <div className="onboarding-actions">
          <button className="primary-button onboarding-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Create workspace"}
            {!isSubmitting ? <ArrowRightIcon className="button-icon" /> : null}
          </button>
        </div>
      </form>
    </section>
  );
}
